# その他仕様書（Miscellaneous Specification）

## 1. コード規約

### 書式設定（Prettier）

| 項目 | 設定値 |
|------|--------|
| タブ幅 | 4スペース |
| クォート | シングルクォート |
| 末尾カンマ | あり（trailing comma） |
| 対象ファイル | `**/*.{ts,tsx}` |

### リンター（ESLint 9）

フラットコンフィグ形式（`eslint.config.mjs`）を使用。

| プラグイン | 用途 |
|-----------|------|
| `@next/eslint-plugin-next` | Next.js固有のルール |
| `eslint-plugin-react` | Reactルール |
| `eslint-plugin-react-hooks` | Hooksルール |
| `typescript-eslint` | TypeScriptルール |
| `eslint-config-prettier` | Prettierとの競合解消 |

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

### ローカル開発（`.env`）

```bash
NEXT_PUBLIC_VISIT_ID_KEY=visit_id   # 訪問者ID用キー（ビルド時インライン化）
BACKEND_API_URL=http://localhost:8080  # バックエンドAPI URL
ALLOWED_REPO_OWNER=kojikawazu        # GitHubプロキシ許可オーナー
GITHUB_TOKEN=ghp_xxxxx              # GitHub APIトークン
```

### テスト環境（`.env.test`）

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

# リント
pnpm lint

# フォーマット
pnpm format            # 自動修正
pnpm format:check      # チェックのみ

# E2Eテスト
pnpm test:e2e          # HTMLレポート付き
pnpm test:e2e:ui       # インタラクティブUI
pnpm test:e2e:headed   # ブラウザ表示

# 特定テスト
pnpm dlx playwright test e2e/tests/pages/blog_home/home.spec.ts
```

## 4. CI/CDパイプライン

### テストワークフロー（`test.yml`）

```
トリガー: PR / push to main
  1. チェックアウト
  2. Node.js 20 セットアップ
  3. pnpm install --frozen-lockfile
  4. .env.test 生成
  5. Playwrightブラウザインストール
  6. テスト実行（リトライ2回）
  7. レポートアップロード
```

### デプロイワークフロー（`deploy_to_googlecloud.yml`）

```
トリガー: push to main
  1. チェックアウト
  2. GCP認証
  3. .env に NEXT_PUBLIC_VISIT_ID_KEY のみ書出
  4. Dockerイメージビルド
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
| `eslint`, `eslint-config-next`, `eslint-config-prettier` | リンター |
| `prettier` | フォーマッター |
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
