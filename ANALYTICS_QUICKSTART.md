# Analytics Feature - Quick Start Guide

## 🚀 Setup (5 minutes)

### 1. Run Database Migration

```bash
./scripts/setup-analytics.sh
```

Or manually:

```bash
cd packages/database
npx prisma migrate dev --name add_analytics_models
npx prisma generate
```

### 2. Seed Sample Data (Optional)

```bash
cd packages/database
npx ts-node prisma/seed-analytics.ts
```

### 3. Start Services

```bash
# Terminal 1 - API
cd apps/api
npm run dev

# Terminal 2 - Web
cd apps/web
npm run dev
```

### 4. Access Dashboard

Open: http://localhost:3000/analytics

## ⚡ Real-Time Features

All analytics update in **real-time** via WebSocket:
- ✅ Symptom reports broadcast instantly
- ✅ Health trends update every 6 hours + on new reports
- ✅ Doctor ratings update leaderboard immediately
- ✅ Geographic alerts appear as they're detected
- ✅ Live connection indicator on dashboard

## 📊 Features Overview

### Public Health Intelligence (Real-Time)
- **Trending Symptoms**: Live disease tracking
- **Geographic Alerts**: Instant regional health warnings
- **Health Advisories**: AI-generated prevention tips (updates live)

### Doctor Performance (Real-Time)
- **Leaderboard**: Live rankings update on new ratings
- **Ratings**: Instant patient feedback integration
- **Response Times**: Real-time average calculations

### Platform Metrics (Admin Only)
- **Peak Usage**: Best times for engagement
- **Bottlenecks**: Performance issues
- **Resource Recommendations**: Where to allocate doctors

## 🔌 API Examples

### Track Symptom Report
```bash
curl -X POST http://localhost:3001/api/health-analytics/symptom-report \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "abc123",
    "symptoms": [{"name": "fever", "severity": "moderate"}],
    "age": 30
  }'
```

### Get Trending Symptoms
```bash
curl http://localhost:3001/api/health-analytics/trending?timeWindow=daily&limit=10
```

### Get Doctor Leaderboard
```bash
curl http://localhost:3001/api/doctor-analytics/leaderboard?sortBy=helpfulnessScore
```

### Rate a Doctor
```bash
curl -X POST http://localhost:3001/api/doctor-analytics/rate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "doctorId": "doctor_id_here",
    "rating": 5,
    "helpfulness": 5,
    "feedback": "Very helpful!"
  }'
```

## 🎯 Key Endpoints

| Endpoint | Method | Description | Auth |
|----------|--------|-------------|------|
| `/api/health-analytics/trending` | GET | Get trending symptoms | Public |
| `/api/health-analytics/geographic-alerts` | GET | Get health alerts | Public |
| `/api/doctor-analytics/leaderboard` | GET | Top doctors | Public |
| `/api/doctor-analytics/rate` | POST | Rate doctor | Required |
| `/api/platform-analytics/peak-usage` | GET | Peak times | Admin |
| `/api/platform-analytics/bottlenecks` | GET | Issues | Admin |

## 🔄 Automated Jobs

Analytics are automatically calculated:
- **Daily (1 AM)**: Platform metrics
- **Every 6 hours**: Health trends
- **Real-time**: Symptom reports

## 📱 Frontend Routes

- `/analytics` - Main dashboard
- `/analytics?tab=public-health` - Health intelligence
- `/analytics?tab=doctor-performance` - Doctor metrics
- `/analytics?tab=platform-metrics` - Platform stats (Admin)

## 🛠️ Troubleshooting

### Migration Issues
```bash
cd packages/database
npx prisma migrate reset
npx prisma migrate dev
```

### Missing Data
Run the seed script to populate sample data

### API Not Responding
Check that both API and Web servers are running

## 📚 Full Documentation

See `ANALYTICS_IMPLEMENTATION.md` for complete details.

## 🎨 Customization

### Add New Metrics
1. Update schema in `packages/database/prisma/schema.prisma`
2. Create migration: `npx prisma migrate dev`
3. Add service methods in `apps/api/src/services/`
4. Create API routes in `apps/api/src/routes/`
5. Update frontend components in `apps/web/src/components/analytics/`

### Modify Dashboard
Edit components in `apps/web/src/components/analytics/`:
- `PublicHealthDashboard.tsx`
- `DoctorPerformanceDashboard.tsx`
- `PlatformMetricsDashboard.tsx`

## 🔐 Security Notes

- Admin routes require `ADMIN` role
- Symptom reports can be anonymous
- Research datasets are anonymized
- Geographic data is aggregated

## 📊 Sample Data Structure

### Symptom Report
```json
{
  "sessionId": "session-123",
  "symptoms": [
    {"name": "fever", "severity": "moderate"},
    {"name": "cough", "severity": "mild"}
  ],
  "location": {
    "city": "New York",
    "country": "USA"
  },
  "age": 30,
  "gender": "male",
  "temperature": 101.5,
  "duration": "2 days"
}
```

### Doctor Rating
```json
{
  "doctorId": "doc_123",
  "rating": 5,
  "helpfulness": 5,
  "communication": 4,
  "expertise": 5,
  "feedback": "Very knowledgeable and responsive"
}
```

## 🚀 Next Steps

1. Customize the dashboard UI
2. Add more visualization charts
3. Implement export functionality
4. Set up email alerts for critical health trends
5. Add machine learning predictions

## 💡 Tips

- Use the seeder for testing
- Check cron logs for automated jobs
- Monitor database performance with indexes
- Use pagination for large datasets
- Cache frequently accessed data

## 🤝 Support

For questions or issues:
1. Check `ANALYTICS_IMPLEMENTATION.md`
2. Review API logs
3. Test endpoints with curl/Postman
4. Contact development team
