variable "SCM_MANAGER_EMAIL" {}
variable "SCM_PROJECT_NAME" {}
variable "SCM_ROOT_DOMAIN" {}
variable "SCM_DOMAIN" {}

provider "aws" {
  version = "~> 2.48"
  alias   = "region"
}

provider "aws" {
  alias = "virginia"
  region = "us-east-1"
}

terraform {
  required_providers {
    aws = "~> 2.48"
  }

  backend "s3" {
    bucket = "slack-channel-membership-terraform"
    key    = "terraform-state/terraform.tfstate"
    dynamodb_table = "slack-channel-membership-terraform"
  }
}

data "aws_caller_identity" "current" {}
data "aws_partition" "current" {}
data "aws_region" "current" {}

locals {
  account_id = data.aws_caller_identity.current.account_id
  region     = data.aws_region.current.name
  partition  = data.aws_partition.current.partition
  env        = terraform.workspace
}

resource "aws_dynamodb_table" "slack_at" {
  name           = "${var.SCM_PROJECT_NAME}-slack-at-${local.env}"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "teamId"
  attribute {
    name = "teamId"
    type = "S"
  }
  tags = {
    Manager = var.SCM_MANAGER_EMAIL
    Environment = local.env
  }
}

resource "aws_iam_role" "lambda_excution_role" {
  name               = "${var.SCM_PROJECT_NAME}-lambda-excution-role-${local.env}"
  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF

  tags = {
    Manager = var.SCM_MANAGER_EMAIL
    Environment = local.env
  }
}


resource "aws_iam_role_policy" "labmda_excution_role_policy" {
  name   = "${var.SCM_PROJECT_NAME}_lambda_excution_role_policy_${local.env}"
  role   = aws_iam_role.lambda_excution_role.id
  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [ "logs:CreateLogStream" ],
      "Resource": [ "arn:${local.partition}:logs:${local.region}:${local.account_id}:log-group:/aws/lambda/${var.SCM_PROJECT_NAME}-${local.env}-*:*" ]
    },
    {
      "Effect": "Allow",
      "Action": [ "logs:PutLogEvents" ],
      "Resource": [ "arn:${local.partition}:logs:${local.region}:${local.account_id}:log-group:/aws/lambda/${var.SCM_PROJECT_NAME}-${local.env}-*:*:*" ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:DeleteItem"
      ],
      "Resource": "arn:aws:dynamodb:*:*:table/${aws_dynamodb_table.slack_at.name}"
    }
  ]
}
EOF

}

data "aws_route53_zone" "main" {
  name         = var.SCM_ROOT_DOMAIN
  private_zone = false
}

resource "aws_api_gateway_rest_api" "main" {
  name        = "${var.SCM_PROJECT_NAME}-${local.env}"
  endpoint_configuration {
    types = ["REGIONAL"]
  }
  /*
  tags = {
    Manager = var.SCM_MANAGER_EMAIL
  }
  */
}

resource "aws_api_gateway_domain_name" "main" {
  certificate_arn = aws_acm_certificate.cert.arn
  domain_name     = var.SCM_DOMAIN
}

resource "aws_api_gateway_base_path_mapping" "main" {
  api_id      = aws_api_gateway_rest_api.main.id
  stage_name  = local.env
  domain_name = aws_api_gateway_domain_name.main.domain_name
}

resource "aws_route53_record" "main" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = var.SCM_DOMAIN
  type    = "A"
  alias {
    evaluate_target_health = true
    name    = aws_api_gateway_domain_name.main.cloudfront_domain_name
    zone_id = aws_api_gateway_domain_name.main.cloudfront_zone_id
  }
}

resource "aws_acm_certificate" "cert" {
  domain_name       = var.SCM_DOMAIN
  validation_method = "DNS"
  provider          = aws.virginia
}

resource "aws_route53_record" "cert_validation" {
  name    = aws_acm_certificate.cert.domain_validation_options.0.resource_record_name
  type    = aws_acm_certificate.cert.domain_validation_options.0.resource_record_type
  zone_id = data.aws_route53_zone.main.id
  records = [aws_acm_certificate.cert.domain_validation_options.0.resource_record_value]
  ttl     = 60
}

resource "aws_acm_certificate_validation" "cert" {
  certificate_arn         = aws_acm_certificate.cert.arn
  validation_record_fqdns = [aws_route53_record.cert_validation.fqdn]
  provider                = aws.virginia
}
