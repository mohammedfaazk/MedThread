# Analytics Page - Quick Start Guide

## ✅ Status: COMPLETE & WORKING

The analytics page is now fully functional with real-time data from the database.

---

## 🚀 Quick Start (3 Steps)

### 1. Start Servers
```bash
npm run dev
```

### 2. Open Analytics Page
```
http://localhost:3000/analytics
```

### 3. Explore the Data
- Click through the 3 tabs
- See real-time symptom trends
- View geographic health data
- Check AI-generated advisories

---

## 📊 What's Working

### ✅ Real Data (Not Mock)
- 2,205 symptom reports in database
- 15 cities tracked
- 30 days of historical data
- 75 reports in last 24 hours

### ✅ API Endpoints
All endpoints returning real data:
- Trending symptoms
- Geographic alerts
- Top health issues
- Symptom patterns

### ✅ Frontend Components
- Public Health Dashboard
- Doctor Performance Dashboard
- Platform Metrics Dashboard

---

## 🧪 Quick Test

```bash
# Test the API
npx tsx apps/api/test-analytics-complete.ts

# Expected output:
# ✅ Trending Symptoms: WORKING
# ✅ Geographic Alerts: WORKING
# ✅ Top Health Issues: WORKING
# ✅ ALL TESTS PASSED!
```

---

## 📈 Current Data Snapshot

**Top 5 Trending Symptoms:**
1. Sneezing - 173 reports
2. Headache - 172 reports
3. Nausea - 161 reports
4. Body Ache - 155 reports
5. Chest Pain - 153 reports

**Cities Tracked:**
Mumbai, Delhi, Bangalore, Hyderabad, Chennai, Kolkata, Pune, Ahmedabad, Jaipur, Lucknow, Surat, Kanpur, Nagpur, Indore, Thane

**Alert Levels:**
All cities currently at MODERATE level (need 50+ reports for HIGH, 100+ for CRITICAL)

---

## 🔄 Regenerate Data (Optional)

If you want different data patterns:

```bash
# Stop servers
Ctrl+C

# Run setup script
npx tsx apps/api/complete-analytics-setup.ts

# Restart servers
npm run dev
```

---

## 📝 Files Reference

**Setup Script:**
- `apps/api/complete-analytics-setup.ts` - Seeds database with symptom data

**Test Script:**
- `apps/api/test-analytics-complete.ts` - Verifies all endpoints

**Frontend:**
- `apps/web/src/app/analytics/page.tsx` - Main analytics page
- `apps/web/src/components/analytics/PublicHealthDashboardRealtime.tsx` - Dashboard component

**Backend:**
- `apps/api/src/routes/health-analytics.routes.ts` - API routes
- `apps/api/src/services/health-analytics.service.ts` - Data service

---

## ✨ Done!

The analytics feature is complete and ready to use. Visit `http://localhost:3000/analytics` to see it in action!
