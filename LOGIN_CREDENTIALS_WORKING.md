# ✅ Working Login Credentials - MedThread

**Last Updated:** April 14, 2026  
**Status:** ✅ ALL ACCOUNTS VERIFIED AND WORKING

---

## 🔐 Test Accounts

### 1. ADMIN Account
```
Email:    admin@medthread.com
Password: Admin@123456
Username: admin
Role:     ADMIN
```

**Access:**
- Full platform management
- User verification and management
- Content moderation
- Analytics dashboard
- System configuration
- Emergency broadcasts

**Login URL:** http://localhost:3000/login

---

### 2. DOCTOR Account
```
Email:    rifa@gmail.com
Password: Doctor@123456
Username: dr.rifa.hassan
Role:     DOCTOR
```

**Details:**
- Verification Status: APPROVED
- Specialty: General Medicine
- License Number: DOC123456

**Access:**
- Doctor dashboard
- Patient consultations
- Appointment management
- Doctor analytics
- Chat with patients
- Post responses

**Login URL:** http://localhost:3000/login

---

### 3. PATIENT Account
```
Email:    navin@gmail.com
Password: Patient@123456
Username: navin
Role:     PATIENT
```

**Access:**
- Health profile management
- Create posts and discussions
- Search and book doctors
- Chat with doctors
- Join communities
- Symptom checker
- Health analytics

**Login URL:** http://localhost:3000/login

---

## 🧪 API Testing

### Test Login via API

**Admin Login:**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@medthread.com","password":"Admin@123456"}'
```

**Doctor Login:**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"rifa@gmail.com","password":"Doctor@123456"}'
```

**Patient Login:**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"navin@gmail.com","password":"Patient@123456"}'
```

### PowerShell Testing
```powershell
# Admin Login
$body = @{email='admin@medthread.com';password='Admin@123456'} | ConvertTo-Json
Invoke-RestMethod -Uri 'http://localhost:3001/api/auth/login' -Method Post -Body $body -ContentType 'application/json'

# Doctor Login
$body = @{email='rifa@gmail.com';password='Doctor@123456'} | ConvertTo-Json
Invoke-RestMethod -Uri 'http://localhost:3001/api/auth/login' -Method Post -Body $body -ContentType 'application/json'

# Patient Login
$body = @{email='navin@gmail.com';password='Patient@123456'} | ConvertTo-Json
Invoke-RestMethod -Uri 'http://localhost:3001/api/auth/login' -Method Post -Body $body -ContentType 'application/json'
```

---

## 🔧 Reset Passwords

If you need to reset passwords, run:

```bash
cd apps/api
npx tsx create-standard-users.ts
```

This script will:
- ✅ Update all passwords to the standard ones
- ✅ Test each login to verify it works
- ✅ Display the credentials

---

## ✅ Verification Results

**Last Test:** April 14, 2026

| Email | Password | Role | Status |
|-------|----------|------|--------|
| admin@medthread.com | Admin@123456 | ADMIN | ✅ WORKING |
| rifa@gmail.com | Doctor@123456 | DOCTOR | ✅ WORKING |
| navin@gmail.com | Patient@123456 | PATIENT | ✅ WORKING |

All accounts tested and verified working via API login endpoint.

---

## 🚨 Troubleshooting

### If login still fails:

1. **Check API is running:**
   ```bash
   curl http://localhost:3001/health
   ```

2. **Reset passwords:**
   ```bash
   cd apps/api
   npx tsx create-standard-users.ts
   ```

3. **Check database connection:**
   ```bash
   cd apps/api
   npx prisma db pull
   ```

4. **Clear browser cache and cookies**

5. **Check console for errors** (F12 in browser)

---

## 📝 Notes

- All passwords use bcrypt hashing with 12 salt rounds
- JWT tokens expire after 7 days
- Email verification is disabled for test accounts
- Doctor account is pre-approved for immediate access

---

**Status:** ✅ ALL SYSTEMS OPERATIONAL
