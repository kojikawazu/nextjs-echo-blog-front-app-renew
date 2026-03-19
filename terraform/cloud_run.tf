# ---------------------------------------------
# Cloud Run
# ---------------------------------------------
# Google Cloud Run のサービスアカウントを作成
resource "google_service_account" "cloud_run_sa" {
  account_id   = "cloud-run-sa"
  display_name = "Cloud Run Service Account"
}

# Google Cloud Run にデプロイするサービス
resource "google_cloud_run_service" "nextjs_echo_blog_app_service" {
  name     = var.service_name
  location = var.gcp_region

  metadata {
    namespace = var.gcp_project_id
  }

  template {
    spec {
      containers {
        image = "${var.gcp_region}-docker.pkg.dev/${var.gcp_project_id}/${google_artifact_registry_repository.nextjs_echo_blog_app_repo.repository_id}/${var.app_name}"

        ports {
          container_port = var.http_port
        }
        resources {
          limits = {
            cpu    = "1000m"
            memory = "512Mi"
          }
        }

        # NEXT_PUBLIC_VISIT_ID_KEY はビルド時にJSバンドルへインライン化される公開値
        env {
          name  = "NEXT_PUBLIC_VISIT_ID_KEY"
          value = var.visit_id_key
        }

        # 以下は全て Secret Manager から注入
        # key = "latest": ローテーション時に gcloud だけで反映可能にするため
        env {
          name = "BACKEND_API_URL"
          value_from {
            secret_key_ref {
              name = google_secret_manager_secret.backend_api_url.secret_id
              key  = "latest"
            }
          }
        }
        env {
          name = "ALLOWED_REPO_OWNER"
          value_from {
            secret_key_ref {
              name = google_secret_manager_secret.allowed_repo_owner.secret_id
              key  = "latest"
            }
          }
        }
        env {
          name = "GITHUB_TOKEN"
          value_from {
            secret_key_ref {
              name = google_secret_manager_secret.github_token.secret_id
              key  = "latest"
            }
          }
        }
      }
      service_account_name = google_service_account.cloud_run_sa.email
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }

  depends_on = [
    google_artifact_registry_repository.nextjs_echo_blog_app_repo,
    google_secret_manager_secret_iam_member.backend_api_url_access,
    google_secret_manager_secret_iam_member.allowed_repo_owner_access,
    google_secret_manager_secret_iam_member.github_token_access,
  ]
}
