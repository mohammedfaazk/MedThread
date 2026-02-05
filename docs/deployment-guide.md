# MedThread Deployment Guide

## Infrastructure Overview

```
┌─────────────────────────────────────────────┐
│              Load Balancer                   │
│            (AWS ALB / Nginx)                 │
└──────────────┬──────────────────────────────┘
               │
       ┌───────┴────────┐
       │                │
┌──────▼──────┐  ┌──────▼──────┐
│  Web App    │  │  API Server │
│  (Next.js)  │  │  (Express)  │
│  Container  │  │  Container  │
└─────────────┘  └──────┬──────┘
                        │
              ┌─────────┼─────────┐
              │         │         │
       ┌──────▼──┐  ┌──▼────┐  ┌─▼────────┐
       │   DB    │  │ Redis │  │ AI Service│
       │(Postgres)│  │ Cache │  │ Container │
       └─────────┘  └───────┘  └──────────┘
```

## Prerequisites

- Docker & Docker Compose
- Node.js 20+
- PostgreSQL 15+
- Redis 7+
- AWS Account (for production)
- Domain name
- SSL certificate

## Local Development Setup

### 1. Clone Repository
```bash
git clone https://github.com/your-org/medthread.git
cd medthread
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
```bash
# Copy example env files
cp .env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

# Edit with your values
nano apps/api/.env
```

### 4. Start Services with Docker
```bash
docker-compose up -d
```

### 5. Database Setup
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# (Optional) Seed database
npm run db:seed
```

### 6. Start Development Servers
```bash
npm run dev
```

Access:
- Web: http://localhost:3000
- API: http://localhost:3001
- AI Service: http://localhost:3002

## Production Deployment

### Option 1: Docker Compose (Simple)

**Best for:** Small to medium deployments, single server

```bash
# On production server
git clone https://github.com/your-org/medthread.git
cd medthread

# Set production environment variables
nano .env.production

# Build and start
docker-compose -f docker-compose.prod.yml up -d

# Run migrations
docker-compose exec api npm run db:migrate

# Check logs
docker-compose logs -f
```

### Option 2: Kubernetes (Scalable)

**Best for:** Large deployments, high availability

```bash
# Build images
docker build -t medthread/web:latest -f apps/web/Dockerfile .
docker build -t medthread/api:latest -f apps/api/Dockerfile .
docker build -t medthread/ai:latest -f services/ai/Dockerfile .

# Push to registry
docker push medthread/web:latest
docker push medthread/api:latest
docker push medthread/ai:latest

# Deploy to Kubernetes
kubectl apply -f k8s/
```

### Option 3: AWS (Recommended)

**Architecture:**
- ECS Fargate for containers
- RDS PostgreSQL for database
- ElastiCache Redis for caching
- S3 for file storage
- CloudFront for CDN
- Route 53 for DNS
- ACM for SSL certificates

**Deployment Steps:**

1. **Setup Infrastructure**
```bash
# Using Terraform
cd infrastructure/terraform
terraform init
terraform plan
terraform apply
```

2. **Build and Push Images**
```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Build and push
docker build -t medthread/web:latest -f apps/web/Dockerfile .
docker tag medthread/web:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/medthread-web:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/medthread-web:latest
```

3. **Deploy to ECS**
```bash
# Update ECS service
aws ecs update-service --cluster medthread-cluster --service medthread-web --force-new-deployment
```

4. **Run Database Migrations**
```bash
# Connect to ECS task
aws ecs execute-command --cluster medthread-cluster --task <task-id> --command "/bin/sh"

# Run migrations
npm run db:migrate
```

## Environment Variables

### API Service (.env)
```bash
# Database
DATABASE_URL="postgresql://user:password@host:5432/medthread"

# Authentication
JWT_SECRET="your-super-secret-jwt-key-change-this"
JWT_EXPIRES_IN="7d"

# Redis
REDIS_URL="redis://localhost:6379"

# AWS (for file uploads)
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_S3_BUCKET="medthread-uploads"
AWS_REGION="us-east-1"

# Email (SendGrid)
SENDGRID_API_KEY="your-sendgrid-key"
FROM_EMAIL="noreply@medthread.com"

# AI Service
AI_SERVICE_URL="http://localhost:3002"

# Environment
NODE_ENV="production"
PORT=3001
```

### Web App (.env)
```bash
NEXT_PUBLIC_API_URL="https://api.medthread.com"
NEXT_PUBLIC_AI_SERVICE_URL="https://ai.medthread.com"
NEXT_PUBLIC_SENTRY_DSN="your-sentry-dsn"
```

## Database Migrations

### Create Migration
```bash
cd packages/database
npx prisma migrate dev --name add_user_preferences
```

### Run Migrations (Production)
```bash
npx prisma migrate deploy
```

### Rollback Migration
```bash
# Manually revert in database or restore from backup
```

## Monitoring & Logging

### Application Monitoring
- **Sentry**: Error tracking
- **New Relic**: Performance monitoring
- **Datadog**: Infrastructure monitoring

### Log Aggregation
- **CloudWatch Logs** (AWS)
- **ELK Stack** (self-hosted)
- **Papertrail** (SaaS)

### Health Checks
```bash
# API health
curl https://api.medthread.com/health

# Database health
curl https://api.medthread.com/health/db

# Redis health
curl https://api.medthread.com/health/redis
```

## Backup & Recovery

### Database Backups
```bash
# Automated daily backups (RDS)
# Retention: 30 days

# Manual backup
pg_dump -h host -U user -d medthread > backup.sql

# Restore
psql -h host -U user -d medthread < backup.sql
```

### File Backups
- S3 versioning enabled
- Cross-region replication
- Lifecycle policies

## SSL/TLS Configuration

### Let's Encrypt (Free)
```bash
# Using Certbot
certbot --nginx -d medthread.com -d www.medthread.com
```

### AWS Certificate Manager
- Automatic renewal
- Integrated with ALB/CloudFront

## Scaling Strategy

### Horizontal Scaling
- Add more API containers
- Load balancer distributes traffic
- Stateless architecture

### Database Scaling
- Read replicas for queries
- Connection pooling
- Query optimization

### Caching Strategy
- Redis for session data
- CDN for static assets
- API response caching

## Security Checklist

- [ ] SSL/TLS enabled
- [ ] Environment variables secured
- [ ] Database encrypted at rest
- [ ] Regular security updates
- [ ] Firewall configured
- [ ] Rate limiting enabled
- [ ] CORS configured
- [ ] SQL injection protection
- [ ] XSS protection
- [ ] CSRF protection
- [ ] Secrets rotation
- [ ] Audit logging enabled

## Rollback Procedure

1. Identify issue
2. Stop deployment
3. Revert to previous image tag
4. Update ECS service
5. Verify functionality
6. Investigate root cause

## Performance Optimization

### CDN Configuration
- Cache static assets (images, CSS, JS)
- Edge locations worldwide
- Automatic compression

### Database Optimization
- Indexes on frequently queried fields
- Query optimization
- Connection pooling

### API Optimization
- Response compression
- Pagination
- Field selection
- Caching headers

## Disaster Recovery

### RTO (Recovery Time Objective): 1 hour
### RPO (Recovery Point Objective): 15 minutes

**Recovery Steps:**
1. Activate backup region
2. Restore database from latest backup
3. Update DNS to point to backup
4. Verify functionality
5. Communicate with users

## Cost Optimization

- Use spot instances for non-critical workloads
- Auto-scaling based on demand
- S3 lifecycle policies
- Reserved instances for stable workloads
- Monitor and optimize unused resources
