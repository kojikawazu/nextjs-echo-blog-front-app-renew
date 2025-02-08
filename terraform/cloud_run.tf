# ---------------------------------------------
# Cloud Run
# ---------------------------------------------
# Google Cloud Run のサービスアカウントを作成
resource "google_service_account" "cloud_run_sa" {
  account_id   = "cloud-run-sa"
  display_name = "Cloud Run Service Account"
}

# Google Cloud Run にデプロイするサaビス
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

        env {
          name  = "NEXT_PUBLIC_BACKEND_API_URL"
          value = var.backend_api_url
        }
        env {
          name  = "NEXT_PUBLIC_VISIT_ID_KEY"
          value = var.visit_id_key
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
    google_artifact_registry_repository.nextjs_echo_blog_app_repo
  ]
}
