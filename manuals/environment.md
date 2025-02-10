# 環境変数の設定

## アプリケーション側の設定

.envに以下の環境変数を設定します。

```bash
NEXT_PUBLIC_BACKEND_API_URL=
NEXT_PUBLIC_VISIT_ID_KEY=
```

## Terraformの設定

terraform.tfvarsに以下の環境変数を設定します。

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
backend_api_url = ""
visit_id_key = ""
domain_name = ""
```

## GitHub Actionsの設定

.github/workflows/deploy.ymlに以下のシークレットを使用します。
GitHubのリポジトリのSettingsからSecrets and variablesを選択し、以下のシークレットを設定します。

```bash
GCP_SERVICE_ACCOUNT_KEY
GCP_PROJECT_ID
GCP_REGION
REPO_NAME
APP_NAME
GCP_CLOUD_RUN_SERVICE_NAME
NEXT_PUBLIC_VISIT_ID_KEY
NEXT_PUBLIC_BACKEND_API_URL
```
