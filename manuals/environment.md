# 環境変数の設定

## アプリケーション側の設定

ローカル開発用に、フロントアプリのディレクトリ `apps/front/.env` を設定します（雛形は `apps/front/.env.example`）。

```bash
# apps/front/.env
NEXT_PUBLIC_VISIT_ID_KEY=
BACKEND_API_URL=
ALLOWED_REPO_OWNER=
GITHUB_TOKEN=
```

> モノレポ構成のため、環境変数ファイルはリポジトリ直下ではなく `apps/front/` 配下に置きます。E2E 用の `apps/front/.env.test` も同様です。

### インテグレーションテスト（IT）用

IT（`pnpm test:it`）は testcontainers で実 Go バックエンド + 実 PostgreSQL を起動するため、**Docker が必要**です。`BACKEND_API_URL` は `globalSetup` が起動したコンテナの URL を自動注入するため設定不要です。

| 変数 | 既定 | 用途 |
|------|------|------|
| `BACKEND_REPO_PATH` | 兄弟ディレクトリ（`../../../nextjs-echo-back-blog-app/backend`） | バックエンド repo の `backend/` パス。Dockerfile と `testsupport/testdata/{schema,seed}.sql` の参照元。配置が異なる環境で上書きする |

> バックエンドコンテナには IT 内部で `JWT_SECRET_KEY` / `SUPABASE_URL`（コンテナ Postgres 向け）/ `DB_SSLMODE=disable` 等をテスト用の値として与える（`tests-it/setup/globalSetup.ts`）。本番シークレットは使用しない。

## 本番環境（Cloud Run）

| 変数名 | 供給元 | 備考 |
|--------|--------|------|
| `NEXT_PUBLIC_VISIT_ID_KEY` | 平文 env var | ビルド時にJSバンドルへインライン化される公開値 |
| `BACKEND_API_URL` | Secret Manager | `backend-api-url` |
| `ALLOWED_REPO_OWNER` | Secret Manager | `allowed-repo-owner` |
| `GITHUB_TOKEN` | Secret Manager | `github-token` |

## Terraformの設定

terraform.tfvars に設定する変数（シークレット値は含まない）:

```bash
project = ""
environment = ""
gcp_project_id = ""
gcp_region = ""
repository_id = ""
invoker_role = ""
service_name = ""
app_name = ""
http_port =
visit_id_key = ""
domain_name = ""
```

## GitHub Actionsの設定

GitHubリポジトリの Settings → Secrets and variables で設定:

```bash
GCP_SERVICE_ACCOUNT_KEY
GCP_PROJECT_ID
GCP_REGION
REPO_NAME
APP_NAME
GCP_CLOUD_RUN_SERVICE_NAME
NEXT_PUBLIC_VISIT_ID_KEY
BACKEND_API_URL
ALLOWED_REPO_OWNER
```

※ `GITHUB_TOKEN` は不要。Cloud Run の Secret Manager 参照で注入されます。

## シークレット管理

Secret Manager で管理されるシークレット一覧:

| Secret ID | Cloud Run 環境変数名 |
|-----------|---------------------|
| `backend-api-url` | `BACKEND_API_URL` |
| `allowed-repo-owner` | `ALLOWED_REPO_OWNER` |
| `github-token` | `GITHUB_TOKEN` |

### 新規環境の初回構築（2段階）

```bash
# ステップ1: Secret Manager の箱と IAM のみ先に作成
terraform apply \
  -target=google_secret_manager_secret.backend_api_url \
  -target=google_secret_manager_secret.allowed_repo_owner \
  -target=google_secret_manager_secret.github_token \
  -target=google_secret_manager_secret_iam_member.backend_api_url_access \
  -target=google_secret_manager_secret_iam_member.allowed_repo_owner_access \
  -target=google_secret_manager_secret_iam_member.github_token_access

# ステップ2: シークレット値を投入
gcloud secrets versions add backend-api-url --data-file=- <<< "<バックエンドURL>"
gcloud secrets versions add allowed-repo-owner --data-file=- <<< "kojikawazu"
gcloud secrets versions add github-token --data-file=- <<< "ghp_xxxxx"

# ステップ3: 残りのリソース（Cloud Run 含む）を作成
terraform apply
```

### シークレットのローテーション

```bash
# 新しい値を追加
gcloud secrets versions add <secret-id> --data-file=- <<< "new-value"

# 即時反映が必要な場合は Cloud Run を再デプロイ
gcloud run services update <SERVICE_NAME> --region <REGION>

# バージョン確認
gcloud secrets versions list <secret-id>
```
