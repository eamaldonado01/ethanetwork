terraform {
  backend "s3" {
    bucket         = "odin-tf-state-468381823872-uswest1"
    key            = "terraform.tfstate"
    region         = "us-west-1"
    dynamodb_table = "odin-tf-lock"
    encrypt        = true
  }
}
