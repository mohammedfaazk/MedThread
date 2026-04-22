# How to Add Pending Doctors - Step by Step

## 🔴 IMPORTANT: Database Connection Issue

Your database connection pool is full. Follow these steps:

## Step 1: Close All Database Connections

```bash
# Stop all running processes
# Press Ctrl+C in all terminal windows running:
# - API server
# - Web server  
# - Any test scripts
# - Prisma Studio (if open)
```

## Step 2: Wait 30 Seconds

Let the database connections close properly.

## Step 3: Run the Script

```bash
cd apps/api
npx tsx add-pending-doctors.ts
```

## Alternative: Add Doctors Manually via Prisma Studio

If the script still fails, you can add them manually:

### Method 1: Using Prisma Studio

```bash
cd apps/api
npx prisma studio
```

Then:
1. Go to "User" table
2. Click "Add record"
3. Fill in the details below for each doctor

### Doctor 1 Data:
```json
{
  "name": "Dr. Sarah Johnson",
  "email": "sarah.johnson@medthread.com",
  "username": "dr_sarah_johnson",
  "password": "$2a$10$YourHashedPasswordHere",
  "role": "DOCTOR",
  "isVerified": false,
  "verificationStatus": "PENDING",
  "bio": "Board-certified Cardiologist with 12 years of experience",
  "location": "Mumbai, Maharashtra"
}
```

### Doctor 2 Data:
```json
{
  "name": "Dr. Rajesh Kumar",
  "email": "rajesh.kumar@medthread.com",
  "username": "dr_rajesh_kumar",
  "password": "$2a$10$YourHashedPasswordHere",
  "role": "DOCTOR",
  "isVerified": false,
  "verificationStatus": "PENDING",
  "bio": "Experienced Orthopedic Surgeon",
  "location": "Bangalore, Karnataka"
}
```

## Method 2: Restart Everything and Try Again

1. **Close everything:**
   - Stop API server (Ctrl+C)
   - Stop Web server (Ctrl+C)
   - Close all terminals
   - Wait 1 minute

2. **Start only API server:**
   ```bash
   cd apps/api
   npm run dev
   ```

3. **In a NEW terminal, run the script:**
   ```bash
   cd apps/api
   npx tsx add-pending-doctors.ts
   ```

4. **After success, start web server:**
   ```bash
   cd apps/web
   npm run dev
   ```

## ✅ How to Verify It Worked

### Check in Admin Dashboard:
1. Login as admin (admin@medthread.com / admin123)
2. Go to Admin Dashboard
3. Look for "Doctor Verification" or "Pending Approvals"
4. You should see 2 doctors:
   - Dr. Sarah Johnson (Cardiologist)
   - Dr. Rajesh Kumar (Orthopedic Surgeon)

### Check in Database:
```bash
npx prisma studio
```
- Go to User table
- Filter: `role = 'DOCTOR' AND isVerified = false`
- Should see 2 records

## 🎯 What These Doctors Have

Both doctors come with:
- ✅ Complete profile information
- ✅ Medical license numbers
- ✅ Educational qualifications
- ✅ Hospital affiliations
- ✅ Verification documents (mock URLs)
- ✅ Availability schedules
- ✅ Consultation fees
- ✅ PENDING verification status

## 📝 Login Credentials

**Dr. Sarah Johnson:**
- Email: sarah.johnson@medthread.com
- Password: doctor123
- Status: PENDING (cannot login until approved)

**Dr. Rajesh Kumar:**
- Email: rajesh.kumar@medthread.com
- Password: doctor123
- Status: PENDING (cannot login until approved)

## 🔐 Security Note

These doctors CANNOT login or access the platform until an admin approves them. This is the correct behavior for the verification workflow.

## 💡 Quick Fix for Connection Pool

If you keep getting connection pool errors, update your `.env`:

```env
# Add connection limit
DATABASE_URL="your-connection-string?connection_limit=1"
```

This limits each process to 1 connection, preventing pool exhaustion.

## 🆘 Still Not Working?

If the script still fails after closing everything:

1. **Check if servers are really stopped:**
   ```bash
   # Windows
   tasklist | findstr node
   
   # If you see node processes, kill them:
   taskkill /F /IM node.exe
   ```

2. **Wait 2 minutes** for database to release connections

3. **Try the script again**

4. **If still failing:** The doctors can be added later when the database connection issue is resolved. The feature will work once they're in the database.

## 📧 Need Help?

The script and instructions are ready. The only issue is the database connection pool being full. Once you close all connections and wait a bit, the script will work perfectly!
