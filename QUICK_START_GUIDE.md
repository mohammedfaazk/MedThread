# 🚀 MedThread Quick Start Guide

## Overview

MedThread is now 100% complete with all 52 implementation steps finished. This guide will help you get started quickly.

---

## ✅ What's Been Completed

### Core Features
- ✅ Medical threads with AI symptom analysis
- ✅ Thread replies with voting system
- ✅ Doctor verification with document upload
- ✅ Complete appointment system
- ✅ Consultation funnel with payment
- ✅ Professional profile management
- ✅ CME credits tracking
- ✅ Health insights dashboard
- ✅ Email notifications
- ✅ Conversion analytics

---

## 🏃 Quick Start (Development)

### 1. Install Dependencies

```bash
# Install all packages
npm install

# Or with yarn
yarn install
```

### 2. Set Up Environment Variables

Create `.env` files in both `apps/api` and `apps/web`:

**apps/api/.env:**
```bash
DATABASE_URL="postgresql://user:password@localhost:5432/medthread"
JWT_SECRET="your-secret-key-change-in-production"
SUPABASE_URL="your-supabase-url"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Email (Development - logs to console)
EMAIL_PROVIDER=console
EMAIL_FROM="noreply@medthread.com"

# Frontend URL
FRONTEND_URL="http://localhost:3000"
```

**apps/web/.env.local:**
```bash
NEXT_PUBLIC_API_URL="http://localhost:3001"
NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
```

### 3. Set Up Database

```bash
# Run Prisma migrations
cd packages/database
npx prisma migrate dev
npx prisma generate
```

### 4. Start Development Servers

```bash
# Terminal 1: Start API server
cd apps/api
npm run dev

# Terminal 2: Start web app
cd apps/web
npm run dev
```

### 5. Access the Application

- **Web App:** http://localhost:3000
- **API:** http://localhost:3001
- **API Docs:** http://localhost:3001/api-docs (if configured)

---

## 🎯 Key Features & Routes

### Patient Features
- `/symptom-checker` - AI-powered symptom analysis
- `/threads` - Browse medical discussions
- `/appointments` - Book appointments
- `/appointments/history` - View appointment history
- `/dashboard/patient` - Patient dashboard

### Doctor Features
- `/dashboard/doctor` - Doctor dashboard
- `/dashboard/doctor/profile/edit` - Edit professional profile
- `/dashboard/doctor/consultations` - Manage consultation requests
- `/dashboard/doctor/cme` - CME credits tracking
- `/dashboard/doctor/insights` - Health insights
- `/dashboard/doctor/conversions` - Conversion analytics
- `/doctor/[username]` - Public doctor profile

### Admin Features
- KYC document verification
- User management
- System analytics

---

## 📧 Email Configuration (Production)

### Option 1: SendGrid (Recommended)

```bash
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.your_api_key
EMAIL_FROM=noreply@yourdomain.com
```

See `EMAIL_PROVIDER_SETUP.md` for detailed setup instructions.

### Option 2: AWS SES

```bash
EMAIL_PROVIDER=ses
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=us-east-1
EMAIL_FROM=noreply@yourdomain.com
```

### Option 3: SMTP

```bash
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=your-email@gmail.com
```

---

## 💳 Payment Configuration (Stripe)

### 1. Get Stripe Keys

1. Sign up at https://stripe.com
2. Get your API keys from Dashboard > Developers > API keys

### 2. Configure Environment

```bash
# Backend
STRIPE_SECRET_KEY=sk_test_...

# Frontend
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### 3. Test Payment Flow

1. Go to doctor profile
2. Click "Book Consultation"
3. Fill out consultation form
4. Use test card: `4242 4242 4242 4242`
5. Any future expiry date
6. Any 3-digit CVC

---

## 🗄️ File Upload Configuration

### Local Storage (Default)

Files are stored in `apps/api/uploads/` directory.

### AWS S3 (Production)

```bash
FILE_STORAGE=s3
AWS_S3_BUCKET=your-bucket-name
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=us-east-1
```

### Cloudinary (Alternative)

```bash
FILE_STORAGE=cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## ⏰ Cron Jobs Setup

The following automated tasks are available:

### 1. License Expiry Checks (Daily at 9 AM)
- Checks for expiring medical licenses
- Sends reminders at 30 days and 7 days
- Auto-suspends expired licenses

### 2. Appointment Reminders (Every Hour)
- Sends 24-hour reminders
- Sends 1-hour reminders
- Notifies both doctor and patient

### 3. CME Auto-Award (Daily at Midnight)
- Awards CME credits for quality replies
- Updates doctor statistics

### Enable Cron Jobs

Uncomment the cron job setup in `apps/api/src/services/cron-jobs.service.ts`:

```typescript
const cron = require('node-cron');

// Run license check daily at 9 AM
cron.schedule('0 9 * * *', async () => {
  await cronJobsService.checkExpiringLicenses();
});

// Run appointment reminders every hour
cron.schedule('0 * * * *', async () => {
  await cronJobsService.sendAppointmentReminders();
});

// Run CME auto-award daily at midnight
cron.schedule('0 0 * * *', async () => {
  await cronJobsService.autoAwardCmeCredits();
});
```

---

## 🧪 Testing

### Test User Accounts

Create test accounts for different roles:

```bash
# Patient Account
Email: patient@test.com
Password: Test123!

# Doctor Account
Email: doctor@test.com
Password: Test123!
Role: DOCTOR
```

### Test Scenarios

1. **Symptom Checker**
   - Go to `/symptom-checker`
   - Enter symptoms
   - View AI analysis

2. **Consultation Flow**
   - Browse doctor profiles
   - Click "Book Consultation"
   - Complete 3-step form
   - Doctor receives notification
   - Doctor accepts and schedules
   - Appointment created

3. **Appointment Management**
   - View appointments
   - Cancel appointment
   - Reschedule appointment
   - View history

4. **Profile Management**
   - Edit doctor profile
   - Add education/certifications
   - Export as PDF
   - Share profile

---

## 📊 API Endpoints Reference

### Threads
- `GET /api/threads` - List threads
- `POST /api/threads` - Create thread
- `PATCH /api/threads/:id/resolve` - Resolve thread
- `GET /api/threads/:id/ai-analysis` - Get AI analysis
- `POST /api/threads/symptom-checker` - Analyze symptoms

### Replies
- `POST /api/replies` - Create reply
- `POST /api/replies/:id/upvote` - Upvote reply
- `POST /api/replies/:id/downvote` - Downvote reply
- `POST /api/replies/:id/helpful` - Mark helpful
- `POST /api/replies/:id/best-answer` - Mark best answer

### Appointments
- `GET /api/appointments/doctors/:doctorId/availability` - Get availability
- `POST /api/appointments/book` - Book appointment
- `POST /api/appointments/:id/cancel` - Cancel appointment
- `POST /api/appointments/:id/reschedule` - Reschedule appointment
- `GET /api/appointments` - List appointments

### Consultation Funnel
- `POST /api/consultation-funnel/request` - Create consultation request
- `POST /api/consultation-funnel/:id/respond` - Doctor responds
- `GET /api/consultation-funnel/doctor/:id/requests` - Get doctor's requests
- `GET /api/consultation-funnel/doctor/:id/metrics` - Get conversion metrics

### Payment
- `POST /api/payment/create-intent` - Create payment intent
- `POST /api/payment/confirm` - Confirm payment
- `GET /api/payment/consultation-fee/:type` - Get consultation fee

### File Upload
- `POST /api/upload/avatar` - Upload avatar
- `POST /api/upload/document` - Upload document
- `POST /api/upload/verification-documents` - Upload KYC docs

---

## 🐛 Troubleshooting

### Database Connection Issues

```bash
# Check PostgreSQL is running
pg_isready

# Reset database
npx prisma migrate reset

# Regenerate Prisma client
npx prisma generate
```

### Email Not Sending

1. Check `EMAIL_PROVIDER` is set correctly
2. Verify API keys are correct
3. Check logs for error messages
4. Test with `EMAIL_PROVIDER=console` first

### Payment Issues

1. Verify Stripe keys are correct
2. Use test card numbers from Stripe docs
3. Check Stripe dashboard for errors
4. Ensure webhook endpoints are configured

### File Upload Issues

1. Check `uploads/` directory exists and is writable
2. Verify AWS credentials if using S3
3. Check file size limits
4. Review error logs

---

## 📚 Additional Documentation

- `ALL_52_STEPS_COMPLETE.md` - Complete feature list
- `EMAIL_PROVIDER_SETUP.md` - Detailed email setup
- `IMPLEMENTATION_STATUS_FINAL.md` - Implementation details
- `PERSON_2_PROGRESS_REPORT.md` - Development progress

---

## 🚀 Deployment

### Vercel (Frontend)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd apps/web
vercel
```

### Railway/Heroku (Backend)

```bash
# Set environment variables in dashboard
# Deploy via Git push or CLI
```

### Docker (Full Stack)

```bash
# Build and run
docker-compose up -d
```

---

## 🎉 You're Ready!

All 52 steps are complete and the application is production-ready. Start the development servers and explore the features!

For questions or issues, refer to the comprehensive documentation files included in the project.

**Happy coding! 🚀**

