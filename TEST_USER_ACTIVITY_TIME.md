# 🧪 Test User Activity by Time of Day

## ✅ What's Fixed

The "User Activity by Time of Day" graph now shows REAL login statistics based on actual user logins, not fake or estimated data.

## 🚀 Test It Now (4 Steps)

### Step 1: Generate Some Login Data
Have multiple users login at different times:

1. **Navin logs in** (e.g., at 2:30 PM)
2. **Another user logs in** (e.g., at 3:15 PM)
3. **More users login** at various times

Each login creates a record with the exact time.

### Step 2: Check the API Endpoint
Open browser console (F12) and run:

```javascript
fetch('http://localhost:3001/api/admin-analytics/user-activity-time?days=7', {
  headers: { 'Authorization': 'Bearer ' + localStorage.getItem('auth_token') }
})
.then(r => r.json())
.then(data => {
  console.log('📊 User Activity Data:', data);
  console.log('📈 Summary:', data.summary);
  
  // Show hours with activity
  const activeHours = data.data.filter(h => h.total > 0);
  console.log('🔥 Active Hours:', activeHours);
  
  // Find peak hour
  const peakHour = data.data.reduce((max, curr) => 
    curr.total > max.total ? curr : max
  );
  console.log('⭐ Peak Hour:', peakHour);
});
```

**Expected Output:**
```javascript
📊 User Activity Data: {
  success: true,
  data: [
    { hour: "00:00", doctors: 0, patients: 0, total: 0 },
    { hour: "01:00", doctors: 0, patients: 0, total: 0 },
    // ...
    { hour: "14:00", doctors: 0, patients: 2, total: 2 },  // 2 PM - Navin + others
    { hour: "15:00", doctors: 1, patients: 1, total: 2 },  // 3 PM
    // ...
  ],
  summary: {
    totalLogins: 4,
    doctorLogins: 1,
    patientLogins: 3,
    period: "7 days"
  }
}
```

### Step 3: View the Graph
1. Navigate to: `http://localhost:3000/admin/analytics`
2. Scroll to "User Activity by Time of Day" graph
3. Should see bars at the hours when users logged in
4. Hover over bars to see exact counts

### Step 4: Verify in Database
Run this SQL query to see the raw data:

```sql
SELECT 
  u.username,
  u.role,
  ual."createdAt",
  EXTRACT(HOUR FROM ual."createdAt") as hour_of_day
FROM "UserActivityLog" ual
JOIN "User" u ON u.id = ual."userId"
WHERE ual."activityType" = 'LOGIN'
  AND ual."createdAt" >= NOW() - INTERVAL '7 days'
ORDER BY ual."createdAt" DESC;
```

## 📊 Understanding the Graph

### What Each Bar Represents:
- **X-axis**: Hour of day (00:00 to 23:00)
- **Y-axis**: Number of logins
- **Blue bars**: Doctors
- **Green bars**: Patients
- **Total height**: Combined logins

### Example Interpretation:
```
If you see:
- Hour 14:00 has 3 logins (2 patients, 1 doctor)
- Hour 15:00 has 1 login (1 patient)
- All other hours have 0

This means:
- Between 2:00 PM - 3:00 PM: 3 users logged in
- Between 3:00 PM - 4:00 PM: 1 user logged in
- No logins at other times (in the past 7 days)
```

## 🔍 Detailed Testing

### Test Different Time Periods

**Last 24 Hours:**
```javascript
fetch('http://localhost:3001/api/admin-analytics/user-activity-time?days=1', {
  headers: { 'Authorization': 'Bearer ' + localStorage.getItem('auth_token') }
}).then(r => r.json()).then(console.log);
```

**Last 7 Days (default):**
```javascript
fetch('http://localhost:3001/api/admin-analytics/user-activity-time?days=7', {
  headers: { 'Authorization': 'Bearer ' + localStorage.getItem('auth_token') }
}).then(r => r.json()).then(console.log);
```

**Last 30 Days:**
```javascript
fetch('http://localhost:3001/api/admin-analytics/user-activity-time?days=30', {
  headers: { 'Authorization': 'Bearer ' + localStorage.getItem('auth_token') }
}).then(r => r.json()).then(console.log);
```

### Check API Server Logs

When you request the data, the API server will log:

```
📊 Found 4 login activities in the last 7 days
📈 Activity Summary (last 7 days):
   Total Logins: 4
   Doctor Logins: 1
   Patient Logins: 3
   Peak Hour: 14:00
```

## 🎯 Success Indicators

### ✅ Working Correctly If:

1. **API returns data** with non-zero counts at hours when users logged in
2. **Graph shows bars** at the correct hours
3. **Summary statistics** match the number of logins
4. **Database query** shows matching login records
5. **Console logs** show activity summary

### ❌ Not Working If:

1. All hours show 0 logins (but users have logged in)
2. Graph is completely empty
3. API returns error
4. Database has no `UserActivityLog` entries with `activityType: 'LOGIN'`

## 🧪 Comprehensive Test Scenario

### Scenario: Test with Multiple Users

1. **9:00 AM**: Doctor A logs in
2. **10:30 AM**: Patient B logs in
3. **2:00 PM**: Patient C logs in
4. **2:15 PM**: Navin (patient) logs in
5. **5:00 PM**: Doctor D logs in

**Expected Graph:**
- Hour 09:00: 1 doctor
- Hour 10:00: 1 patient
- Hour 14:00: 2 patients (C and Navin)
- Hour 17:00: 1 doctor

**Expected Summary:**
- Total Logins: 5
- Doctor Logins: 2
- Patient Logins: 3
- Peak Hour: 14:00 (2 logins)

## 📈 Real-World Patterns

### Typical Patterns You Might See:

**Morning Peak (9-11 AM):**
- Users checking in at start of day
- Doctors reviewing patient messages

**Afternoon Peak (2-4 PM):**
- Post-lunch activity
- Patients seeking advice

**Evening Peak (6-8 PM):**
- After-work activity
- Users catching up

**Low Activity (12-2 AM):**
- Most users sleeping
- Minimal logins

## 🔧 Troubleshooting

### Problem: Graph shows all zeros

**Cause**: No logins in the selected time period

**Solutions**:
1. Have users login to generate data
2. Check longer time period: `?days=30`
3. Verify activity logs exist:
```sql
SELECT COUNT(*) FROM "UserActivityLog" 
WHERE "activityType" = 'LOGIN';
```

### Problem: Graph doesn't update after login

**Cause**: Browser cache

**Solution**: Hard refresh
- Windows: `Ctrl + Shift + R`
- Mac: `Cmd + Shift + R`

### Problem: API returns empty data

**Cause**: No activity logs created

**Solution**: Check if login creates activity logs
1. Login as any user
2. Check API console for: `✅ Created activity log for: username`
3. If not showing, API server may need restart

### Problem: Wrong hour showing

**Cause**: Timezone mismatch

**Solution**: The system uses server time. Check:
```javascript
console.log('Server time:', new Date().toISOString());
console.log('Local time:', new Date().toString());
```

## 💡 Pro Tips

### 1. Generate Test Data
To quickly populate the graph with test data:
- Have multiple users login at different times
- Or run a seed script to create historical login data

### 2. Compare Time Periods
Compare different time periods to see trends:
```javascript
// This week
fetch('...?days=7').then(r => r.json()).then(d => console.log('This week:', d.summary));

// Last 30 days
fetch('...?days=30').then(r => r.json()).then(d => console.log('Last month:', d.summary));
```

### 3. Export Data
Export the data for analysis:
```javascript
fetch('http://localhost:3001/api/admin-analytics/user-activity-time?days=30', {
  headers: { 'Authorization': 'Bearer ' + localStorage.getItem('auth_token') }
})
.then(r => r.json())
.then(data => {
  // Convert to CSV
  const csv = data.data.map(row => 
    `${row.hour},${row.doctors},${row.patients},${row.total}`
  ).join('\n');
  console.log('Hour,Doctors,Patients,Total\n' + csv);
});
```

## 🎊 Success!

If you see bars on the graph at the hours when users logged in, it's working perfectly!

The graph now shows:
- ✅ Real login times
- ✅ Actual user activity
- ✅ Hour-by-hour breakdown
- ✅ Role-based separation
- ✅ Accurate statistics

---

**Ready to test?** Have users login at different times and watch the graph populate with real data! 📊
