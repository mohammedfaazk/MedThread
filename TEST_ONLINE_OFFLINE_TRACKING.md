# 🧪 Test Online/Offline Tracking

## ✅ What's Fixed

Active users now shows who is CURRENTLY ONLINE (last 15 minutes), not just "logged in today". When users logout, they're properly tracked and removed from the online count after 15 minutes.

## 🚀 Quick Test (5 Steps)

### Step 1: Check Current Online Users
```javascript
fetch('http://localhost:3001/api/admin-analytics/active-users?period=online', {
  headers: { 'Authorization': 'Bearer ' + localStorage.getItem('auth_token') }
})
.then(r => r.json())
.then(data => {
  console.log('👥 Currently Online:', data.data.total);
  console.log('📊 Breakdown:', data.data);
});
```

Note the current count.

### Step 2: Login as Navin
1. Logout if already logged in
2. Login with Navin's credentials
3. Watch API console for:
```
✅ Updated user activity timestamp for: navin
✅ Created activity log for: navin
✅ Emitted real-time analytics event for: navin
```

### Step 3: Check Online Users Again
```javascript
fetch('http://localhost:3001/api/admin-analytics/active-users?period=online', {
  headers: { 'Authorization': 'Bearer ' + localStorage.getItem('auth_token') }
})
.then(r => r.json())
.then(data => {
  console.log('👥 Currently Online:', data.data.total);
  console.log('📊 Breakdown:', data.data);
});
```

**Expected**: Count should increase by 1 (Navin is now online)

### Step 4: Logout as Navin
1. Click logout
2. Watch API console for:
```
✅ Created logout activity log for: navin
✅ Emitted user inactive event for: navin
```

### Step 5: Check Online Users After 15 Minutes
Wait 15 minutes, then:
```javascript
fetch('http://localhost:3001/api/admin-analytics/active-users?period=online', {
  headers: { 'Authorization': 'Bearer ' + localStorage.getItem('auth_token') }
})
.then(r => r.json())
.then(data => {
  console.log('👥 Currently Online:', data.data.total);
  console.log('📊 Breakdown:', data.data);
});
```

**Expected**: Count should be back to original (Navin is no longer online)

---

## 📊 Understanding the Results

### Scenario 1: User Just Logged In
```javascript
{
  "success": true,
  "data": {
    "doctors": 0,
    "patients": 1,  // Navin
    "total": 1,
    "period": "online",
    "description": "Currently online (last 15 minutes)",
    "threshold": "15 minutes"
  }
}
```

### Scenario 2: User Logged Out 5 Minutes Ago
```javascript
{
  "success": true,
  "data": {
    "doctors": 0,
    "patients": 1,  // Still shows Navin (< 15 min)
    "total": 1,
    "period": "online",
    "description": "Currently online (last 15 minutes)",
    "threshold": "15 minutes"
  }
}
```

### Scenario 3: User Logged Out 20 Minutes Ago
```javascript
{
  "success": true,
  "data": {
    "doctors": 0,
    "patients": 0,  // Navin no longer counted (> 15 min)
    "total": 0,
    "period": "online",
    "description": "Currently online (last 15 minutes)",
    "threshold": "15 minutes"
  }
}
```

---

## 🔍 Detailed Verification

### Check Activity Logs in Database
```sql
-- See Navin's recent login/logout activity
SELECT 
  u.username,
  ual."activityType",
  ual."createdAt",
  NOW() - ual."createdAt" as "time_ago"
FROM "UserActivityLog" ual
JOIN "User" u ON u.id = ual."userId"
WHERE u.username = 'navin'
  AND ual."activityType" IN ('LOGIN', 'LOGOUT')
ORDER BY ual."createdAt" DESC
LIMIT 10;
```

**Expected Output:**
```
username | activityType | createdAt           | time_ago
---------|--------------|---------------------|----------
navin    | LOGOUT       | 2026-04-17 15:45:00 | 00:05:00
navin    | LOGIN        | 2026-04-17 14:30:00 | 01:20:00
```

### Check User's Last Activity
```sql
-- Check when Navin was last active
SELECT 
  username,
  role,
  "updatedAt",
  NOW() - "updatedAt" as "time_since_activity"
FROM "User"
WHERE username = 'navin';
```

**Expected Output:**
```
username | role    | updatedAt           | time_since_activity
---------|---------|---------------------|--------------------
navin    | PATIENT | 2026-04-17 14:30:00 | 01:20:00
```

---

## 🎯 Test Different Periods

### Test 1: Currently Online (15 minutes)
```javascript
fetch('http://localhost:3001/api/admin-analytics/active-users?period=online', {
  headers: { 'Authorization': 'Bearer ' + localStorage.getItem('auth_token') }
}).then(r => r.json()).then(d => console.log('Online:', d.data.total));
```

### Test 2: Active Today
```javascript
fetch('http://localhost:3001/api/admin-analytics/active-users?period=today', {
  headers: { 'Authorization': 'Bearer ' + localStorage.getItem('auth_token') }
}).then(r => r.json()).then(d => console.log('Today:', d.data.total));
```

### Test 3: Active Last 7 Days
```javascript
fetch('http://localhost:3001/api/admin-analytics/active-users?period=7days', {
  headers: { 'Authorization': 'Bearer ' + localStorage.getItem('auth_token') }
}).then(r => r.json()).then(d => console.log('7 Days:', d.data.total));
```

### Expected Pattern:
```
Online: 1      (just logged in)
Today: 5       (logged in today)
7 Days: 25     (logged in this week)
```

---

## 🧪 Advanced Testing

### Test Multiple Users
1. Have User A login → Check count (should increase)
2. Have User B login → Check count (should increase)
3. Have User A logout → Wait 15 min → Check count (should decrease)
4. Have User B logout → Wait 15 min → Check count (should decrease)

### Test Edge Cases

**Case 1: User Logs In and Out Quickly**
1. Login
2. Immediately logout
3. Check online count
**Expected**: User still shows as online for 15 minutes

**Case 2: User Logs In Multiple Times**
1. Login as Navin
2. Logout
3. Login again
4. Check online count
**Expected**: Shows as online (updatedAt is recent)

**Case 3: User Stays Logged In**
1. Login as Navin
2. Don't logout
3. Wait 20 minutes
4. Check online count
**Expected**: No longer shows as online (updatedAt is old)

---

## 📈 Real-World Scenarios

### Scenario 1: Morning Rush
```
8:00 AM - 5 users login
8:15 AM - Check online: 5 users
8:30 AM - Check online: 0 users (if all logged out)
```

### Scenario 2: Active Session
```
2:00 PM - User logs in
2:05 PM - Check online: 1 user
2:10 PM - Check online: 1 user
2:14 PM - Check online: 1 user
2:16 PM - Check online: 0 users (>15 min, no activity)
```

### Scenario 3: Logout Tracking
```
3:00 PM - User logs in
3:30 PM - User logs out
3:31 PM - Check online: 1 user (still within 15 min)
3:46 PM - Check online: 0 users (>15 min since login)
```

---

## 🔧 Troubleshooting

### Problem: Count doesn't decrease after logout

**Check 1**: Has 15 minutes passed?
```javascript
// Check user's last activity
fetch('http://localhost:3001/api/admin-analytics/active-users?period=online', {
  headers: { 'Authorization': 'Bearer ' + localStorage.getItem('auth_token') }
}).then(r => r.json()).then(console.log);
```

**Check 2**: Was logout tracked?
```sql
SELECT * FROM "UserActivityLog" 
WHERE "activityType" = 'LOGOUT' 
ORDER BY "createdAt" DESC LIMIT 5;
```

**Check 3**: Check API console
Look for: `✅ Created logout activity log for: username`

### Problem: User shows as offline immediately after login

**Cause**: Using wrong period parameter

**Solution**: Use `period=online` not `period=today`

### Problem: No logout logs in database

**Cause**: Frontend not calling logout endpoint

**Solution**: Verify frontend calls `/api/v1/auth/logout` with auth token

---

## ✅ Success Indicators

### Working Correctly If:
1. ✅ Login increases online count
2. ✅ Logout creates activity log
3. ✅ After 15 minutes, count decreases
4. ✅ Console shows login/logout messages
5. ✅ Database has LOGIN and LOGOUT entries
6. ✅ Real-time events are emitted

### Not Working If:
1. ❌ Count never decreases
2. ❌ No logout logs in database
3. ❌ No console messages on logout
4. ❌ Count shows same for all periods

---

## 💡 Pro Tips

### Tip 1: Use Different Periods for Different Insights
- `online` - Who's here RIGHT NOW
- `today` - Daily active users
- `7days` - Weekly engagement
- `30days` - Monthly retention

### Tip 2: Monitor Console Logs
Watch the API console to see real-time activity:
```
✅ Updated user activity timestamp for: navin
✅ Created activity log for: navin
✅ Emitted real-time analytics event for: navin
👥 Active Users (online): 1 (0 doctors, 1 patients)
```

### Tip 3: Compare Periods
```javascript
Promise.all([
  fetch('...?period=online').then(r => r.json()),
  fetch('...?period=today').then(r => r.json()),
  fetch('...?period=7days').then(r => r.json())
]).then(([online, today, week]) => {
  console.log('Online:', online.data.total);
  console.log('Today:', today.data.total);
  console.log('Week:', week.data.total);
});
```

---

## 🎊 Success!

If you see:
- ✅ Count increases when users login
- ✅ Logout creates activity log
- ✅ Count decreases after 15 minutes
- ✅ Console shows proper messages

Then online/offline tracking is working perfectly! 🚀

---

**Ready to test?** Login, logout, and watch the active users count update correctly!
