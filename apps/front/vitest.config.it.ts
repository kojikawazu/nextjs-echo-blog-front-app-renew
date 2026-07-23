import { defineConfig } from 'vitest/config';
import path from 'path';

/**
 * IT（インテグレーションテスト）専用の Vitest 設定。
 *
 * ユニットテスト（`vitest.config.ts`）とは分離し、testcontainers で実スタックを
 * 起動して BFF Route Handler を in-process で検証する。docker が必要。
 * 実行: `pnpm --filter front test:it`（= `vitest run --config vitest.config.it.ts`）。
 */
export default defineConfig({
    test: {
        environment: 'node',
        globals: true,
        include: ['tests-it/**/*.it.test.ts'],
        globalSetup: ['./tests-it/setup/globalSetup.ts'],
        setupFiles: ['./tests-it/setup/inject-env.ts'],
        // コンテナ相手のリクエストは UT より遅い。ビルド/起動は hook 側で吸収する。
        testTimeout: 30_000,
        hookTimeout: 240_000,
        // 実スタックは globalSetup で 1 度だけ起動し、全ファイルで共有する
        // （各フォークは inject-env.ts で BACKEND_API_URL を自フォークに反映する）。
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
});
