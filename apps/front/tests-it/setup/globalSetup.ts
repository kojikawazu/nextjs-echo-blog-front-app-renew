import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GenericContainer, Network, Wait } from 'testcontainers';
import { PostgreSqlContainer } from '@testcontainers/postgresql';

/** Vitest の globalSetup が受け取る provide 関数（型定義がパス公開されないため最小定義）。 */
type GlobalSetupContext = {
    provide: <K extends keyof import('vitest').ProvidedContext>(
        key: K,
        value: import('vitest').ProvidedContext[K],
    ) => void;
};

/**
 * IT（インテグレーションテスト）用の実スタックを testcontainers で起動する。
 *
 * 構成: Vitest(IT) → BFF Route Handler(in-process) → 実 Go バックエンド(container)
 *       → PostgreSQL(container・backend の schema.sql / seed.sql を投入)。
 * 真の外部 3rd-party（GitHub API 等）のみスタブし、それ以外は実依存を使う。
 *
 * バックエンドのソース/資産は別リポジトリ（`nextjs-echo-back-blog-app`）にあり、
 * 既定では兄弟ディレクトリを参照する。`BACKEND_REPO_PATH` で上書きできる。
 * `BACKEND_IMAGE` を指定した場合はビルドせず既存イメージ（例: Artifact Registry の
 * pinned image）を使う。
 */

const CURRENT_DIR = path.dirname(fileURLToPath(import.meta.url));
// apps/front/tests-it/setup -> apps/front
const FRONT_ROOT = path.resolve(CURRENT_DIR, '../..');
// 既定: 兄弟 repo の backend モジュール。環境により配置が違うため env で上書き可能。
const BACKEND_DIR =
    process.env.BACKEND_REPO_PATH ??
    path.resolve(FRONT_ROOT, '../../../nextjs-echo-back-blog-app/backend');

/** DB コンテナのネットワークエイリアス（バックエンドの接続先ホスト名）。 */
const DB_ALIAS = 'db';
/** バックエンドのリッスンポート（backend の既定 PORT）。 */
const BACKEND_PORT = 8080;

/**
 * IT 実スタックを起動し、BFF が叩く `BACKEND_API_URL` を provide する。
 *
 * @param ctx - Vitest のグローバルセットアップコンテキスト（`provide` を含む）
 * @returns テスト終了後に全コンテナ/ネットワークを破棄する teardown 関数
 */
export default async function setup({ provide }: GlobalSetupContext) {
    const schemaSql = path.join(BACKEND_DIR, 'testsupport', 'testdata', 'schema.sql');
    const seedSql = path.join(BACKEND_DIR, 'testsupport', 'testdata', 'seed.sql');

    const teardownFns: Array<() => Promise<unknown>> = [];

    // 共有ネットワーク（backend → postgres をエイリアスで解決させる）
    const network = await new Network().start();
    teardownFns.push(() => network.stop());

    // 1) PostgreSQL: docker-entrypoint-initdb.d に schema/seed を配置し初回起動時に適用
    const postgres = await new PostgreSqlContainer('postgres:16-alpine')
        .withDatabase('testdb')
        .withUsername('postgres')
        .withPassword('postgres')
        .withNetwork(network)
        .withNetworkAliases(DB_ALIAS)
        .withCopyFilesToContainer([
            { source: schemaSql, target: '/docker-entrypoint-initdb.d/01_schema.sql' },
            { source: seedSql, target: '/docker-entrypoint-initdb.d/02_seed.sql' },
        ])
        .start();
    teardownFns.push(() => postgres.stop());

    // 2) 実 Go バックエンド。DB_SSLMODE=disable はコンテナ Postgres が非 SSL のため
    //    （backend/supabase/client.go 参照）。
    //    BACKEND_IMAGE 指定時は既存イメージ（例: Artifact Registry の pinned image）を使い、
    //    未指定なら別 repo の Dockerfile をビルドする（ローカル/自己完結 CI 向け）。
    const backendBase = process.env.BACKEND_IMAGE
        ? new GenericContainer(process.env.BACKEND_IMAGE)
        : await GenericContainer.fromDockerfile(BACKEND_DIR).build();
    const backend = await backendBase
        .withNetwork(network)
        .withEnvironment({
            SUPABASE_URL: `postgresql://postgres:postgres@${DB_ALIAS}:5432/testdb`,
            DB_SSLMODE: 'disable',
            JWT_SECRET_KEY: 'it-test-secret-key',
            ALLOWED_ORIGINS: 'http://localhost:3000',
            PORT: String(BACKEND_PORT),
            ENV: '',
        })
        .withExposedPorts(BACKEND_PORT)
        // ヘルスチェック（routes.go: GET / → 200 "Service is running"）。
        // 起動には DB 接続 + TestQuery 成功が必要なため猶予を長めに取る。
        .withWaitStrategy(
            Wait.forHttp('/', BACKEND_PORT).forStatusCode(200).withStartupTimeout(120_000),
        )
        .start();
    teardownFns.push(() => backend.stop());

    // BFF は `${BACKEND_API_URL}/blogs` の形で叩くため /api を含める（routes.go の api グループ）
    const backendApiUrl = `http://${backend.getHost()}:${backend.getMappedPort(BACKEND_PORT)}/api`;
    provide('backendApiUrl', backendApiUrl);
    // 同一プロセス実行時の保険（setupFiles でも inject から再設定する）
    process.env.BACKEND_API_URL = backendApiUrl;

    return async () => {
        // 起動と逆順に破棄する
        for (const stop of teardownFns.reverse()) {
            try {
                await stop();
            } catch {
                // teardown の失敗はテスト結果に影響させない
            }
        }
    };
}

declare module 'vitest' {
    interface ProvidedContext {
        /** BFF Route Handler が叩くバックエンド API のベース URL（`/api` を含む）。 */
        backendApiUrl: string;
    }
}
