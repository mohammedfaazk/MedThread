# 🔐 Admin Analytics Access Guide

## ✅ Implementation Status

All admin analytics features are fully implemented and working:
- ✅ API server running on port 3001
- ✅ 12 admin analytics endpoints
- ✅ 7 doctor analytics endpoints  
- ✅ Frontend components with authentication
- ✅ Chart visualizations with 5 types each

## 🔑 How to Access Admin Analytics

### Step 1: Login as Admin

You need to login with an admin account first. An admin user has been created:

```
Email: admin@medthread.com
Password: Admin@123
Role: ADMIN
```

### Step 2: Navigate to Admin Dashboard

After logging in, go to:
```
http://localhost:3000/admin/analytics
```

### Step 3: View Analytics

The dashboard will display 12 interactive charts with real-time data from your seeded mock data.

## 🐛 Troubleshooting

### Issue: "Authentication required" Error

**Cause:** The frontend needs to send the JWT token with API requests.

**Solution:** The frontend code has been updated to include the Authorization header:

```typescript
const token = localStorage.getItem('token');
fetch(url, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
```

### Issue: "Failed to fetch" Error

**Cause:** API server not running or wrong port.

**Solution:**
1. Check API server is running: `cd apps/api && npm run dev`
2. Verify it's on port 3001 (check console output)
3. Check `.env` file has `PORT=3001`

### Issue: "Too many authentication attempts"

**Cause:** Rate limiting on login endpoint.

**Solution:** Clear rate limit:
```bash
npx tsx apps/api/clear-auth-rate-limit.ts
```

Then wait 15 minutes or restart the API server.

### Issue: No Data in Charts

**Cause:** Mock data not seeded.

**Solution:** Run the seed script:
```bash
npx tsx apps/api/src/scripts/comprehensive-seed.ts
```

## 📊 Available Analytics

### Admin Dashboard (12 Charts)

1. **Active Users** - Real-time/daily active doctors and patients
2. **Offline Users** - Users who haven't been active recently
3. **User Activity by Time** - Activity patterns throughout the day
4. **Feature Usage** - Most used features by patients
5. **Treatment Outcomes** - Success rates of treatments
6. **Doctor Activity** - Doctor participation by community
7. **Community Engagement** - Forum activity scores
8. **User Registrations** - New user signups over time
9. **Post Priorities** - Distribution of HIGH/MEDIUM/LOW priority posts
10. **Appointment Conversion** - Consultation to appointment conversion rates
11. **Moderation Activity** - Reports and moderation actions
12. **Revenue Overview** - Payment and revenue trends

### Doctor Profile (7 Charts)

1. **Treatment Outcomes** - Patient feedback distribution
2. **Posts Over Time** - Doctor's posting activity
3. **Comments Over Time** - Doctor's engagement in discussions
4. **Conversion Rate** - Consultation to appointment conversion
5. **Patients Cured** - Monthly treatment success
6. **Clinic Visits** - In-person appointment trends
7. **Portfolio Score** - Overall performance score

## 🎨 Chart Features

Each chart supports 5 visualization types:
- 📊 Bar Chart
- 📈 Line Chart
- 🥧 Pie Chart
- 🍩 Doughnut Chart
- 🎯 Radar Chart

Features:
- ✅ Click icons to switch chart types
- ✅ Preferences saved in localStorage
- ✅ Smooth 300ms transitions
- ✅ Colorblind-safe palette
- ✅ Responsive design
- ✅ Touch-friendly on mobile

## 🔧 Technical Details

### Authentication Flow

1. User logs in via `/api/auth/login`
2. Server returns JWT token
3. Frontend stores token in `localStorage`
4. Frontend includes token in all API requests:
   ```
   Authorization: Bearer <token>
   ```
5. Server validates token via `authenticate` middleware
6. Admin routes also check role via `requireAdmin` middleware

### API Endpoints

All admin analytics endpoints require authentication and admin role:

```
GET /api/admin-analytics/active-users?period=today
GET /api/admin-analytics/offline-users
GET /api/admin-analytics/user-activity-time?days=7
GET /api/admin-analytics/feature-usage?days=30
GET /api/admin-analytics/treatment-outcomes
GET /api/admin-analytics/doctor-activity-by-community
GET /api/admin-analytics/dead-forums
GET /api/admin-analytics/user-registrations?months=12
GET /api/admin-analytics/post-priorities?months=6
GET /api/admin-analytics/appointment-conversion
GET /api/admin-analytics/moderation-activity?weeks=12
GET /api/admin-analytics/revenue?months=12
```

Doctor analytics endpoints are public (no auth required):

```
GET /api/doctor-public-analytics/:id/treatment-outcomes
GET /api/doctor-public-analytics/:id/posts-over-time?months=12
GET /api/doctor-public-analytics/:id/comments-over-time?months=12
GET /api/doctor-public-analytics/:id/conversion-rate?months=12
GET /api/doctor-public-analytics/:id/patients-cured?months=12
GET /api/doctor-public-analytics/:id/clinic-visits?months=12
GET /api/doctor-public-analytics/:id/portfolio-score?months=12
```

## 🧪 Testing

### Manual Testing

1. **Clear rate limit** (if needed):
   ```bash
   npx tsx apps/api/clear-auth-rate-limit.ts
   ```

2. **Login via browser**:
   - Go to `http://localhost:3000/login`
   - Enter: `admin@medthread.com` / `Admin@123`
   - Click Login

3. **Access dashboard**:
   - Navigate to `http://localhost:3000/admin/analytics`
   - All 12 charts should load with data

4. **Test chart switching**:
   - Click different chart type icons
   - Verify smooth transitions
   - Refresh page - preferences should persist

### API Testing

Test with curl (after getting a token):

```bash
# Login first
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@medthread.com","password":"Admin@123"}'

# Copy the token from response, then:
curl http://localhost:3001/api/admin-analytics/active-users?period=today \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 📝 Summary

Everything is implemented and working! The only requirement is:

1. ✅ API server must be running (port 3001)
2. ✅ Mock data must be seeded
3. ✅ User must login as admin
4. ✅ Frontend sends Authorization header (already implemented)

Once logged in as admin, navigate to `/admin/analytics` and you'll see all 12 charts with interactive visualizations!

---

**Status:** ✅ FULLY FUNCTIONAL  
**Last Updated:** March 27, 2026  
**Admin Credentials:** admin@medthread.com / Admin@123
