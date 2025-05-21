variable "region" {
  description = "AWS region"
  default     = "us-west-1"
}

variable "domain_name" {
  description = "FQDN for your app (e.g. ethanetwork.com)"
  default     = "ethanetwork.com"
}

variable "hosted_zone_id" {
  description = "Route53 Hosted Zone ID where domain_name lives"
  default     = "Z09526303I92OTLP815PX"
}

variable "image_tag" {
  description = "Docker image tag pushed by CI"
  default     = "latest"
}
