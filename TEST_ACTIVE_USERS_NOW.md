# 🧪 Test Active Users - Quick Guide

## ✅ What's Fixed

When users log in, they now:
1. Update their `updatedAt` timestamp
2. Create an activity log entry
3. Emit a real-time event to admin dashboard
4. Show up in the Active Users graph

## 🚀 Test It Now (3 Steps)

### Step 1: Have Navin Login
1. Open your app: `http://localhost:3000`
2. If Navin is logged in, logout first
3. Login with Navin's credentials
4. Watch the API server console

**Expected Console Output:**
```
🔐 Login attempt: { email: 'navin@example.com', ... }
✅ User found: { email: 'navin@example.com', username: 'navin', role: 'PATIENT' }
🔍 Comparing password...
🔐 Password validation result: ✅ VALID
✅ Updated user activity timestamp for: navin
✅ Created activity log for: navin
✅ Emitted real-time analytics event for: navin
```

### Step 2: Check Admin Dashboard
1. Open admin dashboard: `http://localhost:3000/admin/analytics`
2. Look at the **Active Users** section
3. You should see:
   - Doctors: X
   - Patients: Y (should include Navin if he's a patient)
   - Total: X + Y

### Step 3: Verify with API Call
Open browser console (F12) and run:

```javascript
fetch('http://localhost:3001/api/admin-analytics/active-users?period=today', {
  headers: { 'Authorization': 'Bearer ' + localStorage.getItem('auth_token') }
})
.then(r => r.json())
.then(data => {
  console.log('✅ Active Users:', data);
  console.log('📊 Total:', data.data.total);
  console.log('👨‍⚕️ Doctors:', data.data.doctors);
  console.log('🏥 Patients:', data.data.patients);
});
```

**Expected Output:**
```javascript
✅ Active Users: {
  success: true,
  data: {
    doctors: 0,
    patients: 1,  // Navin is here!
    total: 1,
    period: "today"
  }
}
📊 Total: 1
👨‍⚕️ Doctors: 0
🏥 Patients: 1
```

## 🔍 Detailed Verification

### Check Database Directly
Run this SQL query:

```sql
-- Check Navin's last activity
SELECT 
  username, 
  email, 
  role, 
  "updatedAt",
  NOW() - "updatedAt" as "time_since_activity"
FROM "User" 
WHERE email = 'navin@example.com';
```

**Expected Result:**
- `updatedAt` should be very recent (within last few minutes)
- `time_since_activity` should be very small (e.g., "00:00:30")

### Check Activity Logs
```sql
-- Check Navin's recent activity logs
SELECT 
  "activityType",
  "hourOfDay",
  "dayOfWeek",
  "createdAt",
  metadata
FROM "UserActivityLog" 
WHERE "userId" = (SELECT id FROM "User" WHERE email = 'navin@example.com')
ORDER BY "createdAt" DESC 
LIMIT 5;
```

**Expected Result:**
- Should see a recent LOGIN entry
- `createdAt` should match the login time
- `metadata` should contain role, email, username

## 📊 Test Different Time Periods

### Today's Active Users
```javascript
fetch('http://localhost:3001/api/admin-analytics/active-users?period=today', {
  headers: { 'Authorization': 'Bearer ' + localStorage.getItem('auth_token') }
}).then(r => r.json()).then(console.log);
```

### Last 7 Days
```javascript
fetch('http://localhost:3001/api/admin-analytics/active-users?period=7days', {
  headers: { 'Authorization': 'Bearer ' + localStorage.getItem('auth_token') }
}).then(r => r.json()).then(console.log);
```

### Last 30 Days
```javascript
fetch('http://localhost:3001/api/admin-analytics/active-users?period=30days', {
  headers: { 'Authorization': 'Bearer ' + localStorage.getItem('auth_token') }
}).then(r => r.json()).then(console.log);
```

## 🎯 Success Indicators

### ✅ Working Correctly If:
1. API console shows success messages when Navin logs in
2. Admin dashboard shows increased active user count
3. API endpoint returns correct data
4. Database shows recent `updatedAt` timestamp
5. Activity log entry exists for the login

### ❌ Not Working If:
1. No console logs appear when Navin logs in
2. Active user count doesn't change
3. API returns 0 active users
4. `updatedAt` is old (more than a few minutes ago)
5. No activity log entries

## 🔧 Troubleshooting

### Problem: No console logs when logging in

**Solution**: API server might not have restarted
```bash
# Check if API server is running
# Should see: "🏥 MedThread API running on port 3001"
```

### Problem: Active users still showing 0

**Solution 1**: Hard refresh admin dashboard
- Windows: `Ctrl + Shift + R`
- Mac: `Cmd + Shift + R`

**Solution 2**: Check if you're logged in as admin
```javascript
// In browser console
console.log(localStorage.getItem('auth_token'));
console.log(localStorage.getItem('user'));
```

**Solution 3**: Verify the endpoint manually
```bash
# Replace <token> with your admin token
curl -H "Authorization: Bearer <token>" \
  http://localhost:3001/api/admin-analytics/active-users?period=today
```

### Problem: Database not updating

**Solution**: Check API server logs for errors
```bash
# Look for error messages in the API console
# Should NOT see: "⚠️ Failed to update user activity"
```

## 🎉 Expected Behavior

### Before Fix:
- Navin logs in → Nothing happens
- Active users graph → Shows 0 or old data
- Admin dashboard → No change

### After Fix:
- Navin logs in → Console shows success messages
- Active users graph → Immediately shows Navin as active
- Admin dashboard → Updates in real-time (or on refresh)
- Database → `updatedAt` is current
- Activity log → New LOGIN entry created

## 📝 Test Checklist

- [ ] API server is running on port 3001
- [ ] Navin can login successfully
- [ ] Console shows success messages
- [ ] Admin dashboard shows active users
- [ ] API endpoint returns correct data
- [ ] Database `updatedAt` is recent
- [ ] Activity log entry exists
- [ ] No errors in console

## 🎊 Success!

If all checks pass, the active users tracking is working correctly!

Now any user who logs in will:
- ✅ Be tracked as active
- ✅ Show up in admin analytics
- ✅ Create activity logs
- ✅ Emit real-time events

---

**Ready to test?** Have Navin login and watch the magic happen! ✨
