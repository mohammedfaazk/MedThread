# Email Provider Setup Guide

## Overview

The MedThread email service supports multiple email providers:
- SendGrid (Recommended for production)
- AWS SES (Amazon Simple Email Service)
- SMTP (Generic SMTP server)
- Console (Development only - logs to console)

## Configuration

Set the `EMAIL_PROVIDER` environment variable to choose your provider:

```bash
EMAIL_PROVIDER=sendgrid  # or 'ses', 'smtp', 'console'
```

---

## Option 1: SendGrid (Recommended)

SendGrid is a reliable, easy-to-use email service with excellent deliverability.

### Setup Steps

1. **Create SendGrid Account**
   - Go to https://sendgrid.com
   - Sign up for a free account (100 emails/day free tier)
   - Verify your email address

2. **Create API Key**
   - Navigate to Settings > API Keys
   - Click "Create API Key"
   - Choose "Full Access" or "Restricted Access" (with Mail Send permission)
   - Copy the API key (you won't see it again!)

3. **Verify Sender Identity**
   - Go to Settings > Sender Authentication
   - Verify a single sender email OR
   - Authenticate your domain (recommended for production)

4. **Install SendGrid Package**
   ```bash
   npm install @sendgrid/mail
   ```

5. **Configure Environment Variables**
   ```bash
   EMAIL_PROVIDER=sendgrid
   SENDGRID_API_KEY=your_api_key_here
   EMAIL_FROM=noreply@yourdomain.com
   ```

6. **Uncomment SendGrid Code**
   - Open `apps/api/src/services/email.service.ts`
   - Uncomment the SendGrid implementation in `sendWithSendGrid()` method

### Testing

```bash
# Test email sending
curl -X POST http://localhost:3001/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"to":"test@example.com","subject":"Test","html":"<p>Test email</p>"}'
```

---

## Option 2: AWS SES

AWS SES is cost-effective for high-volume email sending.

### Setup Steps

1. **Create AWS Account**
   - Go to https://aws.amazon.com
   - Sign up or log in to your account

2. **Enable SES**
   - Navigate to Amazon SES in AWS Console
   - Choose your region (e.g., us-east-1)
   - Request production access (starts in sandbox mode)

3. **Verify Email Addresses**
   - Go to Verified Identities
   - Add and verify sender email address
   - Verify recipient emails (if in sandbox mode)

4. **Create IAM User**
   - Go to IAM > Users > Add User
   - Enable "Programmatic access"
   - Attach policy: `AmazonSESFullAccess`
   - Save Access Key ID and Secret Access Key

5. **Install AWS SDK**
   ```bash
   npm install @aws-sdk/client-ses
   ```

6. **Configure Environment Variables**
   ```bash
   EMAIL_PROVIDER=ses
   AWS_ACCESS_KEY_ID=your_access_key
   AWS_SECRET_ACCESS_KEY=your_secret_key
   AWS_REGION=us-east-1
   EMAIL_FROM=noreply@yourdomain.com
   ```

7. **Uncomment SES Code**
   - Open `apps/api/src/services/email.service.ts`
   - Uncomment the AWS SES implementation in `sendWithSES()` method

### Production Access

To send to any email address (not just verified ones):
- Go to SES > Account Dashboard
- Click "Request production access"
- Fill out the form explaining your use case
- Wait for approval (usually 24-48 hours)

---

## Option 3: SMTP

Use any SMTP server (Gmail, Outlook, custom server).

### Setup Steps

1. **Get SMTP Credentials**
   - Gmail: Enable "Less secure app access" or use App Password
   - Outlook: Use your account credentials
   - Custom: Get SMTP host, port, username, password from your provider

2. **Install Nodemailer**
   ```bash
   npm install nodemailer
   ```

3. **Configure Environment Variables**
   ```bash
   EMAIL_PROVIDER=smtp
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   EMAIL_FROM=your-email@gmail.com
   ```

4. **Uncomment SMTP Code**
   - Open `apps/api/src/services/email.service.ts`
   - Uncomment the Nodemailer implementation in `sendWithSMTP()` method

### Gmail Setup

1. Enable 2-Factor Authentication
2. Generate App Password:
   - Go to Google Account > Security
   - Select "App passwords"
   - Generate password for "Mail"
   - Use this as `SMTP_PASS`

---

## Option 4: Console (Development)

For local development, emails are logged to console.

### Setup

```bash
EMAIL_PROVIDER=console
# or simply don't set EMAIL_PROVIDER
```

No additional configuration needed. Emails will be logged to the console.

---

## Environment Variables Reference

```bash
# Required for all providers
EMAIL_PROVIDER=sendgrid|ses|smtp|console
EMAIL_FROM=noreply@yourdomain.com

# SendGrid
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx

# AWS SES
AWS_ACCESS_KEY_ID=AKIAxxxxxxxxxxxxx
AWS_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
AWS_REGION=us-east-1

# SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-password

# Frontend URL (for email links)
FRONTEND_URL=https://yourdomain.com
```

---

## Email Templates

The following email templates are available:

1. **Doctor Verification**
   - `sendVerificationApprovedEmail()` - Approval notification
   - `sendVerificationRejectedEmail()` - Rejection with reason

2. **Consultations**
   - `sendConsultationRequestEmail()` - New request notification

3. **Appointments**
   - `sendAppointmentReminderEmail()` - 24h and 1h reminders

4. **CME Credits**
   - `sendCmeCreditsEarnedEmail()` - Credits earned notification

5. **License Management**
   - License expiry reminders (30 days, 7 days)
   - Account suspension notifications

6. **Welcome**
   - `sendWelcomeEmail()` - New user welcome

---

## Testing Email Delivery

### Test Script

Create `apps/api/src/scripts/test-email.ts`:

```typescript
import { emailService } from '../services/email.service'

async function testEmail() {
  try {
    await emailService.sendEmail({
      to: 'test@example.com',
      subject: 'Test Email from MedThread',
      html: '<h1>Test Email</h1><p>If you receive this, email is working!</p>',
      text: 'Test Email - If you receive this, email is working!'
    })
    console.log('✅ Email sent successfully!')
  } catch (error) {
    console.error('❌ Email failed:', error)
  }
}

testEmail()
```

Run:
```bash
npx ts-node apps/api/src/scripts/test-email.ts
```

---

## Troubleshooting

### SendGrid Issues

**Problem:** "Sender identity not verified"
- **Solution:** Verify your sender email in SendGrid dashboard

**Problem:** "API key invalid"
- **Solution:** Regenerate API key and update environment variable

### AWS SES Issues

**Problem:** "Email address not verified"
- **Solution:** Verify recipient email in SES console (sandbox mode)

**Problem:** "Request production access"
- **Solution:** Submit production access request in SES dashboard

### SMTP Issues

**Problem:** "Authentication failed"
- **Solution:** Use App Password instead of regular password (Gmail)

**Problem:** "Connection timeout"
- **Solution:** Check SMTP_HOST and SMTP_PORT are correct

### General Issues

**Problem:** Emails going to spam
- **Solution:** 
  - Set up SPF, DKIM, and DMARC records
  - Use verified domain
  - Avoid spam trigger words
  - Include unsubscribe link

**Problem:** Emails not sending
- **Solution:**
  - Check environment variables are set
  - Verify email service is running
  - Check logs for error messages
  - Test with console provider first

---

## Production Checklist

- [ ] Choose production email provider (SendGrid or AWS SES recommended)
- [ ] Set up and verify sender domain
- [ ] Configure SPF, DKIM, and DMARC records
- [ ] Test all email templates
- [ ] Set up email monitoring/alerts
- [ ] Configure rate limiting
- [ ] Add unsubscribe functionality
- [ ] Set up email analytics
- [ ] Test spam score
- [ ] Configure bounce handling
- [ ] Set up email logs/tracking

---

## Cost Comparison

### SendGrid
- Free: 100 emails/day
- Essentials: $19.95/month (50,000 emails)
- Pro: $89.95/month (100,000 emails)

### AWS SES
- $0.10 per 1,000 emails
- First 62,000 emails free (if sent from EC2)
- Very cost-effective for high volume

### SMTP (Gmail)
- Free: 500 emails/day
- Google Workspace: 2,000 emails/day per user

---

## Support

For issues or questions:
- Check logs in `apps/api/logs/`
- Review email service code in `apps/api/src/services/email.service.ts`
- Test with console provider first
- Contact your email provider's support

