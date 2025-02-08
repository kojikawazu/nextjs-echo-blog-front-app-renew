# ---------------------------------------------
# Variables
# ---------------------------------------------
variable "project" {
  type = string
}

variable "environment" {
  type = string
}

variable "gcp_project_id" {
  type = string
}

variable "gcp_region" {
  type = string
}

variable "repository_id" {
  type = string
}

variable "http_port" {
  type = number
}

variable "invoker_role" {
  type = string
}

variable "service_name" {
  type = string
}

variable "app_name" {
  type = string
}

variable "backend_api_url" {
  type = string
}

variable "visit_id_key" {
  type = string
}
