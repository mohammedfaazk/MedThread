# 🚀 MedThread - Production Deployment Guide

**Complete guide to deploying MedThread to production**

---

## 📋 Prerequisites

### Required Services
- PostgreSQL database (v14+)
- Node.js (v18+)
- npm or yarn
- Domain name with SSL certificate

### Optional Services (for full functionality)
- Firebase (push notifications)
- SMTP service (SendGrid, AWS SES, or Mailgun)
- Stripe (payments)
- AWS S3 (file uploads)
- Redis (caching)
- Google Maps API (hospital finder)

---

## 🔧 Step 1: Database Setup

### Option A: Managed PostgreSQL (Recommended)

**Providers:**
- Supabase (Free tier available)
- Railway (Free tier available)
- Neon (Free tier available)
- AWS RDS
- DigitalOcean Managed Database

**Setup:**
```bash
# 1. Create database on your provider
# 2. Get connection string (format: postgresql://user:pass@host:5432/dbname)
# 3. Add to .env file
```

### Option B: Self-Hosted PostgreSQL

```bash
# Using Docker
docker run -d \
  --name medthread-postgres \
  -e POSTGRES_PASSWORD=your_password \
  -e POSTGRES_DB=medthread \
  -p 5432:5432 \
  -v postgres_data:/var/lib/postgresql/data \
  postgres:14

# Or install directly
sudo apt-get install postgresql-14
sudo -u postgres createdb medthread
sudo -u postgres createuser medthread_user
```

---

## 🔐 Step 2: Environment Configuration

### API Environment (.env)

Create `apps/api/.env`:

```bash
# Database
DATABASE_URL="postgresql://user:password@host:5432/medthread"

# JWT
JWT_SECRET="generate-a-secure-random-string-here"
JWT_EXPIRES_IN="7d"

# App
NODE_ENV="production"
PORT=3001
FRONTEND_URL="https://yourdomain.com"
API_URL="https://api.yourdomain.com"

# SMTP (Optional - choose one provider)
# SendGrid
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT=587
SMTP_USER="apikey"
SMTP_PASSWORD="your-sendgrid-api-key"
SMTP_FROM="noreply@yourdomain.com"
SMTP_FROM_NAME="MedThread"

# Firebase Admin (Optional - for push notifications)
FIREBASE_PROJECT_ID="your-project-id"
FIREBASE_PRIVATE_KEY="your-private-key"
FIREBASE_CLIENT_EMAIL="your-service-account@project.iam.gserviceaccount.com"

# Stripe (Optional - for payments)
STRIPE_SECRET_KEY="sk_live_your-key"
STRIPE_WEBHOOK_SECRET="whsec_your-webhook-secret"

# AWS S3 (Optional - for file uploads)
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="medthread-uploads"

# Redis (Optional - for caching)
REDIS_URL="redis://localhost:6379"

# Google Maps (Optional - for hospital finder)
GOOGLE_MAPS_API_KEY="your-google-maps-api-key"

# Security
CORS_ORIGIN="https://yourdomain.com"
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Monitoring
SENTRY_DSN="your-sentry-dsn"
LOG_LEVEL="info"
```

### Web Environment (.env.local)

Create `apps/web/.env.local`:

```bash
# API
NEXT_PUBLIC_API_URL="https://api.yourdomain.com"

# Firebase (Optional - for push notifications)
NEXT_PUBLIC_FIREBASE_API_KEY="your-api-key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
NEXT_PUBLIC_FIREBASE_APP_ID="your-app-id"
NEXT_PUBLIC_FIREBASE_VAPID_KEY="your-vapid-key"

# Stripe (Optional - for payments)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_your-key"

# Google Maps (Optional - for hospital finder)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="your-maps-api-key"
```

---

## 🔑 Step 3: Generate Secure Secrets

```bash
# Generate JWT secret (32+ characters)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Or use OpenSSL
openssl rand -hex 32
```

---

## 📦 Step 4: Install Dependencies

```bash
# Install all dependencies
npm install

# Or with yarn
yarn install
```

---

## 🗄️ Step 5: Database Migration

```bash
# Navigate to database package
cd packages/database

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed initial data (communities, awards, etc.)
npx prisma db seed

# Return to root
cd ../..
```

---

## 🏗️ Step 6: Build Application

```bash
# Build all packages
npm run build

# Or build individually
cd apps/api && npm run build
cd apps/web && npm run build
```

---

## 🚀 Step 7: Deployment Options

### Option A: Vercel + Railway (Easiest)

**Frontend (Vercel):**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd apps/web
vercel --prod

# Add environment variables in Vercel dashboard
```

**Backend (Railway):**
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Deploy
cd apps/api
railway up

# Add environment variables in Railway dashboard
```

### Option B: Docker Deployment

**Create docker-compose.yml:**
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: medthread
      POSTGRES_USER: medthread
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  api:
    build:
      context: .
      dockerfile: apps/api/Dockerfile
    environment:
      DATABASE_URL: postgresql://medthread:${DB_PASSWORD}@postgres:5432/medthread
      REDIS_URL: redis://redis:6379
    ports:
      - "3001:3001"
    depends_on:
      - postgres
      - redis

  web:
    build:
      context: .
      dockerfile: apps/web/Dockerfile
    environment:
      NEXT_PUBLIC_API_URL: https://api.yourdomain.com
    ports:
      - "3000:3000"
    depends_on:
      - api

volumes:
  postgres_data:
```

**Deploy:**
```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

### Option C: VPS Deployment (DigitalOcean, AWS EC2, etc.)

```bash
# 1. SSH into server
ssh user@your-server-ip

# 2. Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Install PostgreSQL
sudo apt-get install postgresql postgresql-contrib

# 4. Clone repository
git clone https://github.com/yourusername/medthread.git
cd medthread

# 5. Install dependencies
npm install

# 6. Set up environment
cp .env.production.example apps/api/.env
cp .env.production.example apps/web/.env.local
# Edit files with your credentials

# 7. Build
npm run build

# 8. Set up database
cd packages/database
npx prisma generate
npx prisma db push
npx prisma db seed

# 9. Install PM2 for process management
npm install -g pm2

# 10. Start API
cd ../../apps/api
pm2 start npm --name "medthread-api" -- start

# 11. Start Web
cd ../web
pm2 start npm --name "medthread-web" -- start

# 12. Save PM2 configuration
pm2 save
pm2 startup

# 13. Set up Nginx reverse proxy
sudo apt-get install nginx
sudo nano /etc/nginx/sites-available/medthread
```

**Nginx Configuration:**
```nginx
# API
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Web
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Enable site and restart Nginx:**
```bash
sudo ln -s /etc/nginx/sites-available/medthread /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

**Set up SSL with Let's Encrypt:**
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com
```

---

## 🔍 Step 8: Monitoring Setup

### Error Tracking (Sentry)

```bash
# Install Sentry
npm install @sentry/node @sentry/nextjs

# Initialize in apps/api/src/index.ts
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});

# Initialize in apps/web/next.config.js
const { withSentryConfig } = require('@sentry/nextjs');
```

### Uptime Monitoring

**Free Options:**
- UptimeRobot (https://uptimerobot.com)
- Pingdom (https://www.pingdom.com)
- StatusCake (https://www.statuscake.com)

**Setup:**
1. Create account
2. Add monitor for https://yourdomain.com
3. Add monitor for https://api.yourdomain.com/health
4. Set up email/SMS alerts

### Log Aggregation

**Options:**
- Papertrail (free tier)
- Loggly (free tier)
- CloudWatch (AWS)

---

## 🔒 Step 9: Security Checklist

- [ ] All environment variables secured
- [ ] HTTPS enabled everywhere
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] Database credentials secured
- [ ] JWT secret is strong and unique
- [ ] File upload validation enabled
- [ ] SQL injection prevention (Prisma ORM)
- [ ] XSS prevention enabled
- [ ] CSRF protection enabled
- [ ] Helmet.js configured
- [ ] Input sanitization enabled

---

## 🧪 Step 10: Post-Deployment Testing

```bash
# Health check
curl https://api.yourdomain.com/health

# Test registration
curl -X POST https://api.yourdomain.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","name":"Test User"}'

# Test login
curl -X POST https://api.yourdomain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'
```

**Manual Testing:**
1. Visit https://yourdomain.com
2. Register new account
3. Verify email (if SMTP configured)
4. Login
5. Create post
6. Test chat
7. Book appointment
8. Test all unique features

---

## 📊 Step 11: Analytics Setup

### Google Analytics

```bash
# Add to apps/web/src/app/layout.tsx
<Script
  src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
  strategy="afterInteractive"
/>
<Script id="google-analytics" strategy="afterInteractive">
  {`
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
  `}
</Script>
```

---

## 💾 Step 12: Backup Setup

### Database Backups

```bash
# Daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump $DATABASE_URL > /backups/medthread_$DATE.sql
# Keep only last 7 days
find /backups -name "medthread_*.sql" -mtime +7 -delete

# Add to crontab
crontab -e
# Add: 0 2 * * * /path/to/backup-script.sh
```

### File Backups (if using local storage)

```bash
# Backup uploads directory
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz apps/api/uploads/
```

---

## 🚨 Step 13: Rollback Plan

### Quick Rollback

```bash
# If using PM2
pm2 stop all
git checkout previous-stable-tag
npm install
npm run build
pm2 restart all

# If using Docker
docker-compose down
git checkout previous-stable-tag
docker-compose up -d --build

# If using Vercel/Railway
# Use dashboard to rollback to previous deployment
```

---

## 📈 Step 14: Performance Optimization

### Enable Caching

```bash
# Install Redis
npm install redis

# Configure in apps/api/src/index.ts
import { createClient } from 'redis';
const redis = createClient({ url: process.env.REDIS_URL });
```

### Database Optimization

```sql
-- Add indexes for frequently queried fields
CREATE INDEX idx_posts_created_at ON "Post"("createdAt" DESC);
CREATE INDEX idx_posts_author ON "Post"("authorId");
CREATE INDEX idx_comments_post ON "Comment"("postId");
CREATE INDEX idx_appointments_doctor ON "Appointment"("doctorId");
CREATE INDEX idx_appointments_patient ON "Appointment"("patientId");
```

### CDN Setup (Optional)

- Cloudflare (free tier)
- AWS CloudFront
- Fastly

---

## 🎯 Success Metrics

### Week 1 Targets
- [ ] 100+ user registrations
- [ ] 20+ doctor registrations
- [ ] 50+ posts created
- [ ] < 5% error rate
- [ ] > 99% uptime

### Monitor Daily
- Error rates
- Response times
- User registrations
- Active users
- Server resources (CPU, memory, disk)

---

## 🆘 Troubleshooting

### Database Connection Issues
```bash
# Test connection
psql $DATABASE_URL

# Check if database exists
\l

# Check if tables exist
\dt
```

### Build Failures
```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install

# Clear Next.js cache
rm -rf apps/web/.next

# Rebuild
npm run build
```

### Port Already in Use
```bash
# Find process using port
lsof -i :3001

# Kill process
kill -9 <PID>
```

---

## 📞 Support Resources

### Documentation
- [Prisma Docs](https://www.prisma.io/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [Express Docs](https://expressjs.com)
- [Socket.io Docs](https://socket.io/docs)

### Community
- GitHub Issues
- Discord Server
- Stack Overflow

---

## ✅ Launch Checklist

- [ ] Database configured and migrated
- [ ] Environment variables set
- [ ] Application built successfully
- [ ] Deployed to production
- [ ] SSL certificate installed
- [ ] Monitoring configured
- [ ] Backups scheduled
- [ ] Error tracking enabled
- [ ] Analytics configured
- [ ] Manual testing completed
- [ ] Performance optimized
- [ ] Security audit passed

---

## 🎉 You're Live!

**Congratulations! Your MedThread platform is now live in production.**

Next steps:
1. Monitor error logs closely for first 24 hours
2. Gather user feedback
3. Fix critical bugs immediately
4. Plan feature improvements based on usage data

Good luck! 🚀

---

*Last Updated: March 23, 2026*
*Version: 1.0.0*
