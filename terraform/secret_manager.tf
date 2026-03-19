# ---------------------------------------------
# Secret Manager
# ---------------------------------------------
# 全シークレットの箱のみ Terraform 管理。
# 値の投入は gcloud で実施し、Terraform state にシークレット値を残さない。
#
# 初回構築手順:
#   1. terraform apply -target=module.secrets（またはsecret関連リソースのみ）
#   2. gcloud secrets versions add <secret-id> --data-file=- <<< "値"
#   3. terraform apply（Cloud Run 含む全体）

# --- BACKEND_API_URL ---
resource "google_secret_manager_secret" "backend_api_url" {
  secret_id = "backend-api-url"

  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_iam_member" "backend_api_url_access" {
  secret_id = google_secret_manager_secret.backend_api_url.id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.cloud_run_sa.email}"
}

# --- ALLOWED_REPO_OWNER ---
resource "google_secret_manager_secret" "allowed_repo_owner" {
  secret_id = "allowed-repo-owner"

  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_iam_member" "allowed_repo_owner_access" {
  secret_id = google_secret_manager_secret.allowed_repo_owner.id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.cloud_run_sa.email}"
}

# --- GITHUB_TOKEN ---
resource "google_secret_manager_secret" "github_token" {
  secret_id = "github-token"

  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_iam_member" "github_token_access" {
  secret_id = google_secret_manager_secret.github_token.id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.cloud_run_sa.email}"
}
