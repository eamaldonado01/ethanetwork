terraform {
  backend "s3" {
    bucket         = "odin-tf-state-468381823872"
    key            = "terraform.tfstate"
    region         = "us-west-1"
    encrypt        = true
    dynamodb_table = "odin-tf-state-locks" # locks via DynamoDB
  }
}
