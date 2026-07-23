# その他仕様書（Miscellaneous Specification）

## 目次

- [1. コード規約](#1-コード規約)
    - [書式設定（Prettier）](#書式設定prettier)
    - [リンター（ESLint 9）](#リンターeslint-9)
    - [カスタムルール](#カスタムルール)
    - [パスエイリアス](#パスエイリアス)
- [2. 環境変数](#2-環境変数)
    - [ローカル開発（`.env`）](#ローカル開発env)
    - [テスト環境（`.env.test`）](#テスト環境envtest)
    - [本番環境（Cloud Run）](#本番環境cloud-run)
- [3. 開発コマンド](#3-開発コマンド)
- [4. CI/CDパイプライン](#4-cicdパイプライン)
    - [テストワークフロー（`test.yml`）](#テストワークフローtestyml)
    - [デプロイワークフロー（`deploy_to_googlecloud.yml`）](#デプロイワークフローdeploy_to_googlecloudyml)
- [5. Terraform管理リソース](#5-terraform管理リソース)
    - [シークレット値の投入（Terraform外）](#シークレット値の投入terraform外)
- [6. 依存パッケージ](#6-依存パッケージ)
    - [本番依存（dependencies）](#本番依存dependencies)
    - [開発依存（devDependencies）](#開発依存devdependencies)
- [7. 用語集](#7-用語集)

## 1. コード規約

### 書式設定（Prettier）

| 項目 | 設定値 |
|------|--------|
| タブ幅 | 4スペース |
| クォート | シングルクォート |
| 末尾カンマ | あり（`trailingComma: all`） |
| セミコロン | あり（`semi: true`） |
| 行幅 | 100（`printWidth: 100`） |
| 対象ファイル | `**/*.{ts,tsx}` |

### リンター（ESLint 9）

フラットコンフィグ形式（`eslint.config.mjs`）を使用。実行は `pnpm lint`（= `eslint`）。

> Next.js 16 で `next lint` は削除されたため、lint スクリプトは `eslint` を直接呼び出す。`eslint.config.mjs` が import する各プラグインは、pnpm の厳格な `node_modules` で解決できるよう **直接 devDependency** として明示している（`eslint-config-next` の推移的依存に依存しない）。

| プラグイン | 用途 |
|-----------|------|
| `@next/eslint-plugin-next` | Next.js固有のルール |
| `eslint-plugin-react` | Reactルール |
| `eslint-plugin-react-hooks` | Hooksルール |
| `typescript-eslint` | TypeScriptルール |
| `eslint-plugin-jsdoc` | JSDoc（TSDoc）規約の機械強制（`.claude/rules/jsdoc.md` 準拠） |
| `eslint-config-prettier` | Prettierとの競合解消 |

#### JSDoc ルール（`eslint-plugin-jsdoc`）

`src/**/*.{ts,tsx}` に適用。**書かれた JSDoc の整合性を検証**する方針（`require-jsdoc` による有無強制はしない。有無・質はレビューで担保）。

| ルール | 設定 | 意図 |
|-------|------|------|
| `jsdoc/no-types` | error | 型ブレース（`@param {string}`）禁止。型は TS シグネチャが唯一の真実 |
| `jsdoc/require-param` / `-description` | error | JSDoc を持つ関数は全引数を説明（分割代入ルートは非展開） |
| `jsdoc/check-param-names` | error（`.ts`のみ） | `@param` 名と実引数の照合。`.tsx` は per-prop 慣習と非互換のため off |
| `jsdoc/require-returns` / `-description` | error（`.ts`のみ） | 戻り値の意味付け必須。`.tsx`（JSX 返却）は off |
| `jsdoc/check-alignment` / `no-multi-asterisks` | warn | 体裁 |

- **テストコード**（`tests/`・`src/test/`、および過去のコロケート配置 `__tests__/`・`*.test.*`）は公開シンボルでないため JSDoc 必須系を免除。`react/display-name` もテストのインラインラッパー向けに off（免除 glob は `tests/**` を含む）。ユニットテストは `tests/` に集約する（`.claude/rules/testing.md`）。
- `react-hooks/set-state-in-effect` は正当なパターン（async フェッチ前の loading セット等）に過剰反応するため `warn` に降格。挙動を伴う修正は `docs/11-tasks.md` の課題として管理。

### カスタムルール

```javascript
"react/react-in-jsx-scope": "off",  // React 17+ auto import
"react/prop-types": "off",          // TypeScriptで型安全性を担保
```

### パスエイリアス

```json
// tsconfig.json
{
  "paths": { "@/*": ["./src/*"] }
}
```

**使用例**: `import { Blog } from '@/app/types/blogs'`

## 2. 環境変数

> **正準**: 環境変数の一覧・供給元・本番（Secret Manager）構成は [`../manuals/environment.md`](../manuals/environment.md) を正準とする。ローカル雛形はフロントアプリ配下の [`apps/front/.env.example`](../apps/front/.env.example)。本節は要点の再掲。
>
> モノレポ構成のため、環境変数ファイルは `apps/front/.env`・`apps/front/.env.test` に置く。

### ローカル開発（`apps/front/.env`）

```bash
NEXT_PUBLIC_VISIT_ID_KEY=visit_id   # 訪問者ID用キー（ビルド時インライン化）
BACKEND_API_URL=http://localhost:8080  # バックエンドAPI URL
ALLOWED_REPO_OWNER=kojikawazu        # GitHubプロキシ許可オーナー
GITHUB_TOKEN=ghp_xxxxx              # GitHub APIトークン
```

### テスト環境（`apps/front/.env.test`）

```bash
# GitHub Actionsのテストworkflowで生成
NEXT_PUBLIC_VISIT_ID_KEY=test_visit_id
BACKEND_API_URL=http://localhost:8080
```

### 本番環境（Cloud Run）

| 変数名 | 供給元 | Secret Manager名 |
|--------|--------|-----------------|
| `NEXT_PUBLIC_VISIT_ID_KEY` | 平文 env var（`.env` ビルド時） | - |
| `BACKEND_API_URL` | Secret Manager | `backend-api-url` |
| `ALLOWED_REPO_OWNER` | Secret Manager | `allowed-repo-owner` |
| `GITHUB_TOKEN` | Secret Manager | `github-token` |

## 3. 開発コマンド

```bash
# 開発サーバー
pnpm dev

# ビルド
pnpm build

# 本番サーバー
pnpm start

# ユニットテスト（Vitest）
pnpm test              # 全ユニットテスト実行
pnpm test:watch        # ウォッチモード

# インテグレーションテスト（Vitest + testcontainers・要 docker）
pnpm test:it           # 実スタック（Postgres + 実 Go バックエンド）を起動して IT 実行

# リント
pnpm lint

# フォーマット
pnpm format            # 自動修正
pnpm format:check      # チェックのみ

# E2Eテスト
pnpm test:e2e          # HTMLレポート付き
pnpm test:e2e:ui       # インタラクティブUI
pnpm test:e2e:headed   # ブラウザ表示

# 特定テスト（apps/front を起点に実行）
pnpm --filter front exec playwright test e2e/tests/pages/blog_home/blog_home_unauth.spec.ts
```

> モノレポのルート `package.json` は各スクリプトを `pnpm --filter front <script>` に委譲する。上記コマンドはリポジトリ直下からそのまま実行できる。

## 4. CI/CDパイプライン

### テストワークフロー（`test.yml`）

```
トリガー: PR / push to main
  1. チェックアウト
  2. pnpm セットアップ（10.33.0）
  3. pnpm install --frozen-lockfile（ワークスペース全体）
  4. apps/front/.env.test 生成
  5. Playwrightブラウザインストール（pnpm --filter front exec）
  6. テスト実行（pnpm --filter front test:e2e・リトライ2回）
  7. レポートアップロード（apps/front/playwright-report/）
```

### デプロイワークフロー（`deploy_to_googlecloud.yml`）

```
トリガー: push to main
  1. チェックアウト
  2. GCP認証
  3. apps/front/.env に NEXT_PUBLIC_VISIT_ID_KEY のみ書出
  4. Dockerイメージビルド（context=リポジトリルート）
  5. Artifact Registry へプッシュ
  6. Cloud Run へデプロイ（--set-secrets は使用しない）
```

## 5. Terraform管理リソース

| リソース | 用途 |
|---------|------|
| `google_secret_manager_secret` | Secret Manager の箱（3つ） |
| `google_secret_manager_secret_iam_member` | Cloud Run SAへのアクセス権限 |
| `google_cloud_run_service` | Cloud Runサービス（`value_from.secret_key_ref` でシークレット参照） |

### シークレット値の投入（Terraform外）

```bash
gcloud secrets versions add backend-api-url --data-file=- <<< "<バックエンドURL>"
gcloud secrets versions add allowed-repo-owner --data-file=- <<< "kojikawazu"
gcloud secrets versions add github-token --data-file=- <<< "ghp_xxxxx"
```

## 6. 依存パッケージ

### 本番依存（dependencies）

| パッケージ | 用途 |
|-----------|------|
| `next` | フレームワーク |
| `react`, `react-dom` | UIライブラリ |
| `@tanstack/react-query` | サーバー状態管理 |
| `zustand` | ローカル状態管理 |
| `react-hook-form`, `@hookform/resolvers` | フォーム管理 |
| `zod` | バリデーション |
| `react-markdown`, `remark-gfm`, `remark-breaks`, `rehype-highlight` | Markdownレンダリング |
| `highlight.js` | シンタックスハイライト |
| `gray-matter` | Markdownフロントマター解析 |
| `react-hot-toast` | トースト通知 |
| `react-modal` | モーダルダイアログ |
| `react-spinners` | ローディングスピナー |
| `lucide-react` | アイコン |
| `@fortawesome/react-fontawesome`, `@fortawesome/free-brands-svg-icons` | ブランドアイコン |
| `dotenv` | 環境変数読み込み |

### 開発依存（devDependencies）

| パッケージ | 用途 |
|-----------|------|
| `typescript`, `@types/*` | TypeScript |
| `tailwindcss`, `postcss` | CSS |
| `eslint`, `eslint-config-next`, `eslint-config-prettier`, `@next/eslint-plugin-next`, `eslint-plugin-react`, `eslint-plugin-react-hooks`, `typescript-eslint`, `eslint-plugin-jsdoc` | リンター |
| `prettier` | フォーマッター |
| `vitest`, `@vitejs/plugin-react`, `jsdom` | ユニットテスト（実行環境） |
| `@testing-library/react`, `@testing-library/dom`, `@testing-library/jest-dom`, `@testing-library/user-event` | ユニットテスト（DOM/フック検証） |
| `@playwright/test`, `playwright` | E2Eテスト |

## 7. 用語集

| 用語 | 説明 |
|------|------|
| BFF | Backend For Frontend — フロントエンド専用のバックエンドプロキシ |
| Route Handler | Next.js App Routerのサーバーサイドエンドポイント（`route.ts`） |
| Route Group | Next.jsの括弧付きディレクトリ（`(auth)`, `(common)`）でレイアウトを共有 |
| TanStack Query | React用の非同期状態管理ライブラリ（旧React Query） |
| Visit ID | 匿名ユーザーを識別するための訪問者ID（いいね機能で使用） |
| Fail-closed | 設定不備時にアクセスを拒否する安全側に倒す設計 |
| gray-matter | Markdownのフロントマター（YAMLメタデータ）を解析するライブラリ |
