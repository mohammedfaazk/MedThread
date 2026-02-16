# Admin Login Guide - MedThread

## ✅ Admin Account Status
Your admin account is already created and ready to use!

---

## 🔑 Admin Credentials

```
Email:    admin@medthread.com
Username: admin
Password: Admin@123456
```

---

## 📝 How to Access Admin Dashboard

### Step 1: Go to Login Page
Open your browser and navigate to:
```
http://localhost:3000/login
```

### Step 2: Login with Admin Credentials
- **Email**: `admin@medthread.com`
- **Password**: `Admin@123456`

### Step 3: Access Admin Dashboard
After logging in, navigate to:
```
http://localhost:3000/admin
```

Or click on your profile and look for "Admin Dashboard" link (if available in the UI).

---

## 🎯 What You Can Do in Admin Dashboard

### Doctor Verification Management
- ✅ View all pending doctor verification requests
- ✅ Review uploaded documents (ID proof, medical license, degree)
- ✅ Approve doctor verifications
- ✅ Reject verifications with reason
- ✅ View verification statistics

### Dashboard Features
- **Stats Overview**: Total doctors, pending verifications, approval rate
- **Pending Requests**: List of all doctors waiting for verification
- **Document Review**: View and download uploaded documents
- **Approval/Rejection**: One-click approve or reject with notes

---

## 🔍 Troubleshooting

### Issue: "Access denied. Admin only."
**Solution**: Make sure you're logged in with the admin account credentials above.

### Issue: Can't see admin dashboard
**Solution**: 
1. Make sure you're logged in
2. Navigate directly to `http://localhost:3000/admin`
3. Check browser console for errors

### Issue: "Failed to load data"
**Solution**:
1. Make sure API server is running on port 3001
2. Check API logs for errors
3. Verify database connection

### Issue: Forgot admin password
**Solution**: Reset the admin user by running:
```bash
cd packages/database
npx prisma db push --force-reset
cd ../../apps/api
npx tsx src/scripts/seed-admin.ts
```

---

## 🔐 Security Recommendations

### After First Login:
1. ✅ Change the default password immediately
2. ✅ Use a strong, unique password
3. ✅ Store credentials securely (password manager)
4. ✅ Don't share admin credentials

### For Production:
1. ✅ Disable seed script
2. ✅ Use environment-specific admin creation
3. ✅ Enable 2FA (when implemented)
4. ✅ Monitor admin activity logs
5. ✅ Use IP whitelisting for admin routes

---

## 📊 Admin Dashboard Features

### Statistics Dashboard
- Total doctors registered
- Pending verifications count
- Approved doctors count
- Approval rate percentage
- Recent approvals

### Doctor Verification Review
For each pending doctor, you can see:
- Username and email
- Specialty and sub-specialty
- Years of experience
- Medical license number
- License issuing authority
- License expiry date
- Hospital affiliation
- Clinic address
- Uploaded documents:
  - Profile photo / ID proof
  - Medical license document
  - Medical degree (if uploaded)

### Actions Available
- **Approve**: Approve the doctor's verification
  - Add optional approval notes
  - Doctor gets APPROVED status
  - Can now use verified doctor features
  
- **Reject**: Reject the verification
  - Must provide rejection reason (min 10 characters)
  - Doctor gets REJECTED status
  - Doctor receives notification with reason

---

## 🚀 Quick Start

1. **Open browser**: http://localhost:3000/login
2. **Login**: Use admin credentials above
3. **Go to admin**: http://localhost:3000/admin
4. **Review doctors**: Click "Review" on any pending verification
5. **Approve/Reject**: Make your decision with notes

---

## 📞 Support

If you encounter any issues:
1. Check API server logs in terminal
2. Check browser console for errors
3. Verify database connection
4. Check that both servers are running:
   - API: http://localhost:3001
   - Web: http://localhost:3000

---

## ✅ Current Status

- ✅ Admin user created
- ✅ Admin dashboard built
- ✅ API endpoints working
- ✅ Servers running
- ✅ Ready to use!

**You can now login and start verifying doctors!**
