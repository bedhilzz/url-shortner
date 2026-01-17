resource "google_service_account" "shortener" {
  account_id   = "url-shortener-sa"
  display_name = "URL Shortener Service Account"
}

resource "google_cloud_run_service" "shortener" {
  name     = var.service_name
  location = var.region

  template {
    spec {
      service_account_name = google_service_account.shortener.email

      containers {
        image = "gcr.io/${var.project_id}/url-shortener:latest"
      }
    }
  }
}
