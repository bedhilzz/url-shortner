variable "project_id" {
  type        = string
  description = "GCP Project ID"
}

variable "region" {
  type        = string
  default     = "asia-southeast2"
}

variable "service_name" {
  type        = string
  default     = "url-shortener"
}
