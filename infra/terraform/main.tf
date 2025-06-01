###########################################
#  production stack                       #
###########################################



########################
#        VPC           #
########################

resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
}

resource "aws_subnet" "public_a" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.1.0/24"
  map_public_ip_on_launch = true
  availability_zone       = "${var.region}a"
}

resource "aws_subnet" "public_b" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.2.0/24"
  map_public_ip_on_launch = true
  availability_zone       = "${var.region}c"
}

resource "aws_internet_gateway" "gw" {
  vpc_id = aws_vpc.main.id
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.gw.id
  }
}

resource "aws_route_table_association" "public_a" {
  subnet_id      = aws_subnet.public_a.id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "public_b" {
  subnet_id      = aws_subnet.public_b.id
  route_table_id = aws_route_table.public.id
}

########################
#   Security Groups     #
########################

resource "aws_security_group" "alb" {
  name        = "odin-alb-sg"
  description = "Allow HTTP and HTTPS from anywhere"
  vpc_id      = aws_vpc.main.id

  lifecycle { ignore_changes = [description] }

  ingress {
    description = "Allow HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    description = "Allow HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  egress {
    description = "All outbound"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "ecs" {
  name        = "odin-ecs-sg"
  description = "Allow ALB to ECS on 3000"
  vpc_id      = aws_vpc.main.id

  lifecycle { ignore_changes = [description, ingress, egress] }

  ingress {
    description     = "ALB to port 3000"
    from_port       = 3000
    to_port         = 3000
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "db" {
  name   = "odin-db-sg"
  vpc_id = aws_vpc.main.id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs.id]
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "cache" {
  name   = "odin-cache-sg"
  vpc_id = aws_vpc.main.id

  ingress {
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs.id]
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

########################
#  ALB & Listeners      #
########################

resource "aws_lb" "alb" {
  name               = "odin-alb"
  load_balancer_type = "application"
  subnets            = [aws_subnet.public_a.id, aws_subnet.public_b.id]
  security_groups    = [aws_security_group.alb.id]
}

resource "aws_lb_target_group" "blue" {
  name        = "odin-blue"
  port        = 3000
  protocol    = "HTTP"
  target_type = "ip"
  vpc_id      = aws_vpc.main.id

  health_check {
    path    = "/api/healthz"
    matcher = "200-399"
  }
}

resource "aws_lb_target_group" "green" {
  name        = "odin-green"
  port        = 3000
  protocol    = "HTTP"
  target_type = "ip"
  vpc_id      = aws_vpc.main.id

  health_check {
    path    = "/api/healthz"
    matcher = "200-399"
  }
}

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.alb.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.green.arn
  }
}

resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.alb.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-2016-08"
  certificate_arn   = aws_acm_certificate.cert.arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.green.arn
  }
}

########################
#   ACM & DNS           #
########################

resource "aws_acm_certificate" "cert" {
  domain_name       = var.domain_name
  validation_method = "DNS"
}

resource "aws_route53_record" "cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.cert.domain_validation_options :
    dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
      zone   = var.hosted_zone_id
    }
  }

  zone_id = each.value.zone
  name    = each.value.name
  type    = each.value.type
  ttl     = 60
  records = [each.value.record]
}

resource "aws_acm_certificate_validation" "cert" {
  certificate_arn         = aws_acm_certificate.cert.arn
  validation_record_fqdns = [for rec in aws_route53_record.cert_validation : rec.fqdn]
}

########################
#   ECS Cluster / IAM   #
########################

resource "aws_ecs_cluster" "cluster" {
  name = "odin-cluster"
}

data "aws_iam_policy_document" "task_assume" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "task_execution" {
  name               = "odin-task-exec"
  assume_role_policy = data.aws_iam_policy_document.task_assume.json
}

resource "aws_iam_role_policy_attachment" "ssm_agent" {
  role       = aws_iam_role.task_execution.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_role_policy_attachment" "exec_baseline" {
  role       = aws_iam_role.task_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_iam_role_policy_attachment" "exec_ecr" {
  role       = aws_iam_role.task_execution.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
}

data "aws_caller_identity" "self" {}

# --- IAM policy that lets terraform-deployer manage inline
#     policies on the odin-task-exec role -------------------
resource "aws_iam_role_policy" "tf_can_manage_task_exec_policies" {
  name = "tf-manage-task-exec-inline-policies"
  role = "terraform-deployer"

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Effect = "Allow"
      Action = [
        "iam:PutRolePolicy",
        "iam:DeleteRolePolicy",
        "iam:GetRolePolicy"
      ]
      Resource = "arn:aws:iam::${data.aws_caller_identity.self.account_id}:role/odin-task-exec"
    }]
  })
}


########################
# Secrets Manager for Auth0
########################

data "aws_secretsmanager_secret" "auth0" {
  name = "/ethanetwork/auth0"
}

data "aws_secretsmanager_secret_version" "auth0" {
  secret_id = data.aws_secretsmanager_secret.auth0.id
}

########################
#  Task Definition      #
########################

resource "aws_ecs_task_definition" "service" {
  family                   = "odin-service"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = 512
  memory                   = 1024
  task_role_arn            = aws_iam_role.task_execution.arn
  execution_role_arn       = aws_iam_role.task_execution.arn

  container_definitions = jsonencode([
    {
      name      = "web"
      image     = "${data.aws_caller_identity.self.account_id}.dkr.ecr.${var.region}.amazonaws.com/odin-book:${var.image_tag}"
      essential = true

      portMappings = [
        { containerPort = 3000, hostPort = 3000 }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = "/ecs/odin-service"
          awslogs-region        = var.region
          awslogs-stream-prefix = "ecs"
        }
      }

      # ── only truly secret values in "secrets" ─────────────────────────────────
      secrets = [
        { name = "AUTH0_SECRET", valueFrom = "${data.aws_secretsmanager_secret.auth0.arn}:AUTH0_SECRET::" },
        { name = "AUTH0_CLIENT_SECRET", valueFrom = "${data.aws_secretsmanager_secret.auth0.arn}:AUTH0_CLIENT_SECRET::" },
        { name = "AUTH0_CLIENT_ID", valueFrom = "${data.aws_secretsmanager_secret.auth0.arn}:AUTH0_CLIENT_ID::" },
        { name = "AUTH0_ISSUER_BASE_URL", valueFrom = "${data.aws_secretsmanager_secret.auth0.arn}:AUTH0_ISSUER_BASE_URL::" },

        { name = "DATABASE_URL", valueFrom = aws_ssm_parameter.db_url.arn },
        { name = "REDIS_URL", valueFrom = aws_ssm_parameter.redis_url.arn }
      ]

      # ── all non-secret cookie & domain settings in "environment" ────────────────
      environment = [
        { name = "SITE_URL", value = "https://ethanetwork.com" },
        { name = "NEXT_PUBLIC_SITE_URL", value = "https://ethanetwork.com" },
        { name = "PORT", value = "3000" },
        { name = "HOST", value = "0.0.0.0" },
        { name = "INTERNAL_GRAPHQL_URL", value = "http://127.0.0.1:3000/api/graphql" },
        { name = "AUTH0_BASE_URL", value = "https://ethanetwork.com" },
        { name = "NEXT_PUBLIC_AUTH0_BASE_URL", value = "https://ethanetwork.com" },
        { name = "AUTH0_COOKIE_DOMAIN", value = ".ethanetwork.com" },
        { name = "AUTH0_COOKIE_SAME_SITE", value = "none" },
        { name = "AUTH0_COOKIE_SECURE", value = "true" },
        { name = "AUTH0_AUDIENCE", value = "https://odin-book.local/graphql" },
        { name = "S3_BUCKET", value = "odin-media-1" },
        { name = "S3_REGION", value = "us-west-1" }
      ]
    }
  ])
}


resource "aws_ecs_service" "service" {
  name                   = "odin-service"
  cluster                = aws_ecs_cluster.cluster.id
  task_definition        = aws_ecs_task_definition.service.arn
  desired_count          = 1
  enable_execute_command = true
  launch_type            = "FARGATE"
  depends_on             = [aws_lb_listener.https]

  network_configuration {
    subnets          = [aws_subnet.public_a.id, aws_subnet.public_b.id]
    security_groups  = [aws_security_group.ecs.id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.green.arn
    container_name   = "web"
    container_port   = 3000
  }
}

########################
#       DNS A-Record    #
########################

resource "aws_route53_record" "app" {
  zone_id = var.hosted_zone_id
  name    = var.domain_name
  type    = "A"

  alias {
    name                   = aws_lb.alb.dns_name
    zone_id                = aws_lb.alb.zone_id
    evaluate_target_health = true
  }
}

########################
#       PostgreSQL      #
########################

resource "aws_db_subnet_group" "db_subnets" {
  name       = "odin-db-subnets"
  subnet_ids = [aws_subnet.public_a.id, aws_subnet.public_b.id]
}

resource "random_password" "db_pw" {
  length  = 16
  special = false
}

resource "aws_db_instance" "postgres" {
  identifier             = "odin-postgres"
  engine                 = "postgres"
  engine_version         = "16.8"
  instance_class         = "db.t3.micro"
  username               = "odin"
  password               = random_password.db_pw.result
  allocated_storage      = 20
  skip_final_snapshot    = true
  vpc_security_group_ids = [aws_security_group.db.id]
  db_subnet_group_name   = aws_db_subnet_group.db_subnets.name
  publicly_accessible    = true
}

########################
#         Redis         #
########################

resource "aws_elasticache_subnet_group" "cache" {
  name       = "odin-cache-subnets"
  subnet_ids = [aws_subnet.public_a.id, aws_subnet.public_b.id]
}

resource "aws_elasticache_cluster" "redis" {
  cluster_id           = "odin-redis"
  engine               = "redis"
  node_type            = "cache.t2.micro"
  num_cache_nodes      = 1
  port                 = 6379
  subnet_group_name    = aws_elasticache_subnet_group.cache.name
  security_group_ids   = [aws_security_group.cache.id]
  parameter_group_name = "default.redis7"
}

########################
#      SSM Params       #
########################

resource "aws_ssm_parameter" "db_url" {
  name  = "/odin/DATABASE_URL"
  type  = "SecureString"
  value = "postgresql://odin:${random_password.db_pw.result}@${aws_db_instance.postgres.address}:5432/odin_book?schema=public"
}

resource "aws_ssm_parameter" "redis_url" {
  name  = "/odin/REDIS_URL"
  type  = "SecureString"
  value = "redis://${aws_elasticache_cluster.redis.cache_nodes[0].address}:6379"
}

########################
#   CloudWatch Logs     #
########################

resource "aws_cloudwatch_log_group" "ecs_logs" {
  name              = "/ecs/odin-service"
  retention_in_days = 14
}

########################
#      IAM Policies     #
########################

resource "aws_iam_role_policy" "ssm_read" {
  name = "odin-ssm-read"
  role = aws_iam_role.task_execution.id

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Effect   = "Allow",
      Action   = ["ssm:GetParameter", "ssm:GetParameters"],
      Resource = "arn:aws:ssm:${var.region}:${data.aws_caller_identity.self.account_id}:parameter/odin/*"
    }]
  })
}

resource "aws_iam_role_policy" "AllowRDSAndElastiCacheSubnetGroups" {
  name = "AllowRDSAndElastiCacheSubnetGroups"
  role = aws_iam_role.task_execution.name

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Sid    = "AllowSsmCrudOnOdin",
        Effect = "Allow",
        Action = [
          "ssm:GetParameter", "ssm:GetParameters",
          "ssm:PutParameter", "ssm:DeleteParameter", "ssm:ListTagsForResource"
        ],
        Resource = "arn:aws:ssm:${var.region}:${data.aws_caller_identity.self.account_id}:parameter/odin/*"
      },
      {
        Sid      = "AllowSsmDescribeGlobal",
        Effect   = "Allow",
        Action   = ["ssm:DescribeParameters"],
        Resource = "*"
      },
      {
        Sid    = "AllowRdsAndCacheCrud",
        Effect = "Allow",
        Action = [
          "rds:CreateDBSubnetGroup", "rds:DeleteDBSubnetGroup", "rds:DescribeDBSubnetGroups", "rds:ListTagsForResource",
          "rds:AddTagsToResource", "rds:RemoveTagsFromResource", "rds:CreateDBInstance", "rds:DeleteDBInstance",
          "rds:DescribeDBInstances", "rds:ModifyDBInstance", "rds:StartDBInstance", "rds:StopDBInstance",
          "elasticache:CreateCacheSubnetGroup", "elasticache:DeleteCacheSubnetGroup", "elasticache:DescribeCacheSubnetGroups",
          "elasticache:ListTagsForResource", "elasticache:AddTagsToResource", "elasticache:RemoveTagsFromResource",
          "elasticache:CreateCacheCluster", "elasticache:DeleteCacheCluster", "elasticache:DescribeCacheClusters",
          "elasticache:ModifyCacheCluster"
        ],
        Resource = [
          "arn:aws:rds:${var.region}:${data.aws_caller_identity.self.account_id}:subgrp:odin-db-subnets",
          "arn:aws:rds:${var.region}:${data.aws_caller_identity.self.account_id}:db:odin-postgres",
          "arn:aws:elasticache:${var.region}:${data.aws_caller_identity.self.account_id}:subnetgroup:odin-cache-subnets",
          "arn:aws:elasticache:${var.region}:${data.aws_caller_identity.self.account_id}:cluster:odin-redis"
        ]
      }
    ]
  })
}

resource "aws_iam_role_policy" "task_get_auth0_secret" {
  name = "odin-task-get-auth0-secret"
  role = aws_iam_role.task_execution.id

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Effect   = "Allow",
      Action   = "secretsmanager:GetSecretValue",
      Resource = data.aws_secretsmanager_secret.auth0.arn
    }]
  })
}

##############################################
#  allow the task to read/write odin-media-1 #
##############################################
resource "aws_iam_role_policy" "task_s3_media" {
  name = "odin-task-s3-media"
  role = aws_iam_role.task_execution.id

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:PutObjectAcl",
          "s3:DeleteObject"
        ]
        Resource = "arn:aws:s3:::odin-media-1/*"
      },
      {
        Effect   = "Allow"
        Action   = ["s3:ListBucket"]
        Resource = "arn:aws:s3:::odin-media-1"
      }
    ]
  })
}

################################################################################
# Public-read policy for odin-media-1
################################################################################
resource "aws_s3_bucket_policy" "media_public_read" {
  bucket = "odin-media-1"

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Sid       = "PublicRead",
      Effect    = "Allow",
      Principal = "*",
      Action    = ["s3:GetObject"],
      Resource  = "arn:aws:s3:::odin-media-1/*"
    }]
  })
}
