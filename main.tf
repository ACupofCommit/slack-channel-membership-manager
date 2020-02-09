variable "SCM_MANAGER_EMAIL" {}
variable "SCM_PROJECT_NAME" {}

provider "aws" {
  version = "~> 2.48"
  alias   = "region"
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
