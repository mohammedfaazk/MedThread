# MedThread - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Setup Database
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push
```

### Step 3: Create Admin User
```bash
cd apps/api
npm run seed:admin
```

**Admin Credentials Created:**
```
Email:    admin@medthread.com
Username: admin
Password: Admin@123456
```

### Step 4: Start the Application
```bash
# Terminal 1 - Start API
cd apps/api
npm run dev

# Terminal 2 - Start Web
cd apps/web
npm run dev
```

### Step 5: Access the Application
- **Main App**: http://localhost:3000
- **Admin Login**: http://localhost:3000/admin/login
- **API Health**: http://localhost:3001/health

## ✅ What's Working

### Doctor Verification System
1. Doctor registers with role="DOCTOR"
2. Doctor submits verification with KYC documents
3. Admin reviews and approves/rejects
4. Approved doctors get "Verified Doctor" badge
5. Only verified doctors can post medical advice

### Admin Dashboard
- View platform statistics
- Manage users (suspend, delete)
- Review doctor verifications
- Moderate content
- View reports

### API Features
- User authentication (JWT)
- Role-based access control
- Doctor verification workflow
- Post/Comment CRUD
- Community management
- Voting system
- Follow/Unfollow users

## 🔑 Test Accounts

### Admin Account
```
Email: admin@medthread.com
Password: Admin@123456
```

### Create Test Doctor
```bash
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "doctor@test.com",
    "username": "testdoctor",
    "password": "Test@123456",
    "role": "DOCTOR"
  }'
```

### Create Test Patient
```bash
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "patient@test.com",
    "username": "testpatient",
    "password": "Test@123456",
    "role": "PATIENT"
  }'
```

## 📋 Doctor Verification Flow

### 1. Doctor Registers
- Go to http://localhost:3000/register
- Select role: "Doctor"
- Fill registration form
- Submit

### 2. Doctor Submits Verification
```bash
POST http://localhost:3001/api/v1/doctor-verification/submit
Authorization: Bearer {doctor_token}

{
  "medicalLicenseNumber": "MD123456",
  "licenseIssuingAuthority": "Medical Council",
  "licenseExpiryDate": "2030-12-31",
  "specialty": "Cardiology",
  "yearsOfExperience": 10,
  "documents": {
    "idProof": "base64_string_or_url",
    "medicalDegree": "base64_string_or_url",
    "licenseDocument": "base64_string_or_url"
  }
}
```

### 3. Admin Reviews
- Login to admin dashboard
- Go to "Doctor Verifications"
- Click on pending request
- Review documents
- Approve or Reject

### 4. Doctor Gets Verified
- Doctor status changes to "APPROVED"
- "Verified Doctor" badge appears
- Can now post medical advice

## 🛠️ Troubleshooting

### Database Connection Error
```bash
# Check if PostgreSQL is running
# Update DATABASE_URL in .env file
DATABASE_URL="postgresql://user:password@localhost:5432/medthread"
```

### Prisma Generate Fails
```bash
# Close all terminals
# Wait a few seconds
# Try again
npm run db:generate
```

### Admin User Already Exists
```bash
# Reset database (WARNING: Deletes all data)
cd packages/database
npx prisma db push --force-reset

# Create admin again
cd ../../apps/api
npm run seed:admin
```

### Port Already in Use
```bash
# Kill process on port 3001 (API)
npx kill-port 3001

# Kill process on port 3000 (Web)
npx kill-port 3000
```

## 📚 Documentation

- **Complete Guide**: `COMPLETE_IMPLEMENTATION_SUMMARY.md`
- **Doctor Verification**: `DOCTOR_VERIFICATION_SYSTEM.md`
- **Admin Guide**: `ADMIN_CREDENTIALS.md`
- **Refactoring Details**: `FIXES_APPLIED.md`

## 🎯 Key Features Implemented

✅ Doctor Verification System
✅ Admin Dashboard
✅ User Authentication (JWT)
✅ Role-Based Access Control
✅ Post/Comment System
✅ Voting System
✅ Community Management
✅ Professional Error Handling
✅ Input Validation
✅ Security Headers
✅ API Documentation

## 🔐 Security Notes

⚠️ **IMPORTANT**:
1. Change admin password after first login
2. Use strong JWT_SECRET in production
3. Never commit .env files
4. Enable HTTPS in production
5. Set up rate limiting

## 📞 Need Help?

1. Check documentation files
2. Review API logs in terminal
3. Use Prisma Studio: `npx prisma studio`
4. Check browser console for errors

## 🎉 You're Ready!

The application is now running with:
- ✅ Professional architecture
- ✅ Complete doctor verification
- ✅ Admin dashboard
- ✅ Secure authentication
- ✅ Production-ready code

**Happy coding! 🚀**
