# --------------------------------------------------------------
# Google Cloud Run ドメインマッピング (カスタムドメイン)
# --------------------------------------------------------------
resource "google_cloud_run_domain_mapping" "domain_mapping" {
  name     = var.domain_name
  location = var.gcp_region

  metadata {
    namespace = var.gcp_project_id
  }

  spec {
    route_name       = google_cloud_run_service.nextjs_echo_blog_app_service.name
    certificate_mode = "AUTOMATIC"
  }

  depends_on = [
    google_cloud_run_service.nextjs_echo_blog_app_service
  ]
}