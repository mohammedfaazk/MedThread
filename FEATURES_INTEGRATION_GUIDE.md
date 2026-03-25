# MedThread Features Integration Guide

## ✅ Implemented Features Status

### 1. Medical Safety & Verification
- **Service**: `medical-verification.service.ts`
- **API Routes**: `/api/v1/medical-verification`
- **Endpoints**:
  - `POST /verify-content` - Verify medical content accuracy
  - `POST /check-drug-interactions` - Check drug interactions
  - `POST /detect-emergency` - Detect emergency situations
  - `GET /accuracy-score/:postId` - Get medical accuracy score

### 2. Content Moderation
- **Service**: `content-moderation.service.ts`
- **API Routes**: `/api/v1/content-moderation`
- **Endpoints**:
  - `POST /moderate` - Moderate content
  - `POST /analyze-sentiment` - Analyze sentiment
  - `GET /queue` - Get moderation queue
  - `POST /flag/:postId` - Flag content

### 3. Liability Protection
- **Service**: `liability-protection.service.ts`
- **API Routes**: `/api/v1/liability`
- **Endpoints**:
  - `POST /generate-waiver` - Generate liability waiver
  - `POST /accept-waiver` - Accept waiver
  - `GET /check-waiver/:doctorId/:patientId/:interactionType` - Check if waiver required
  - `GET /disclaimer/:type` - Get disclaimer
  - `GET /doctor-status/:doctorId` - Validate doctor status
  - `GET /liability-report/:doctorId` - Generate liability report

### 4. Enhanced Search
- **Service**: `search.service.ts`
- **API Routes**: `/api/v1/search`
- **Endpoints**:
  - `GET /doctors` - Search doctors with filters
  - `GET /posts` - Search posts
  - `GET /symptoms` - Search symptoms
  - `GET /autocomplete` - Autocomplete suggestions
  - `POST /history` - Save search history
  - `GET /history` - Get search history

### 5. Backup & Recovery
- **Service**: `backup.service.ts`
- **API Routes**: `/api/v1/backup`
- **Endpoints**:
  - `POST /full` - Create full backup
  - `POST /incremental` - Create incremental backup
  - `POST /restore/:backupId` - Restore from backup
  - `GET /status` - Get backup status
  - `POST /cleanup` - Cleanup old backups

### 6. Performance Monitoring
- **Service**: `performance-monitor.service.ts`
- **API Routes**: `/api/v1/performance`
- **Endpoints**:
  - `GET /health` - Health check
  - `GET /metrics` - Get performance metrics
  - `GET /stats/:metricName` - Get metric statistics

### 7. Enhanced Notifications
- **Service**: `notification.service.ts`
- **API Routes**: `/api/v1/notifications`
- **Endpoints**:
  - `POST /send` - Send notification
  - `POST /subscribe-device` - Subscribe device
  - `POST /unsubscribe-device` - Unsubscribe device
  - `GET /unread-count` - Get unread count
  - `POST /batch-send` - Batch send notifications
  - `POST /urgent-medical` - Send urgent medical alert
  - `POST /appointment-reminder` - Send appointment reminder

### 8. Rate Limiting
- **Middleware**: `rateLimiter.ts`
- **Limiters**:
  - `generalRateLimit` - 100 req/15min
  - `authRateLimit` - 5 req/15min
  - `postingRateLimit` - 5 req/min
  - `searchRateLimit` - 30 req/min
  - `medicalAIRateLimit` - 10 req/min
  - `uploadRateLimit` - 3 req/min

### 9. Offline Sync
- **Service**: `offlineSync.ts`
- **Features**:
  - Queue actions offline
  - Auto-sync when online
  - Draft saving
  - Conflict resolution
  - Retry mechanism

### 10. Advanced Caching
- **Service**: `cache.ts`
- **Features**:
  - Redis support with fallback
  - Memory cache
  - Pattern invalidation
  - Cache warming
  - Statistics

## 🔧 Integration Steps

### Step 1: Register Routes in Main App
```typescript
// apps/api/src/index.ts or main.ts
import featureRoutes from './routes';
app.use(featureRoutes);
```

### Step 2: Add Middleware
```typescript
// Add rate limiting to routes
app.use('/api/v1/posts', rateLimiters.posting.middleware());
app.use('/api/v1/search', rateLimiters.search.middleware());
app.use('/api/v1/auth', rateLimiters.auth.middleware());
```

### Step 3: Initialize Services
```typescript
// In app startup
import { performanceMonitorService } from './services/performance-monitor.service';
import { offlineSyncManager } from '@/lib/offlineSync';

// Start monitoring
performanceMonitorService.monitorSystemResources();

// Initialize offline sync
// Already auto-initialized in browser
```

### Step 4: Add Frontend Components
```typescript
// In layout or root component
import { OfflineSyncIndicator } from '@/components/features/OfflineSyncIndicator';
import { EnhancedSearch } from '@/components/features/EnhancedSearch';

export default function RootLayout() {
  return (
    <>
      <OfflineSyncIndicator />
      {/* Other components */}
    </>
  );
}
```

### Step 5: Integrate Medical Verification
```typescript
// In post/comment creation
import { MedicalVerificationBadge } from '@/components/features/MedicalVerificationBadge';

const response = await fetch('/api/v1/medical-verification/verify-content', {
  method: 'POST',
  body: JSON.stringify({ content, authorRole })
});
const verification = await response.json();

// Display badge
<MedicalVerificationBadge {...verification} />
```

### Step 6: Integrate Liability Waivers
```typescript
// Before doctor-patient interaction
import { LiabilityWaiverModal } from '@/components/features/LiabilityWaiverModal';

const [showWaiver, setShowWaiver] = useState(false);

// Check if waiver needed
const response = await fetch(
  `/api/v1/liability/check-waiver/${doctorId}/${patientId}/${interactionType}`
);
const { required } = await response.json();

if (required) {
  <LiabilityWaiverModal
    doctorId={doctorId}
    patientId={patientId}
    interactionType={interactionType}
    onAccept={() => proceedWithInteraction()}
    onReject={() => cancelInteraction()}
  />
}
```

## 📊 Database Models Added

All models are now in `packages/database/prisma/schema.prisma`:
- `MedicalVerification`
- `ContentModeration`
- `AutoFlag`
- `LiabilityWaiver`
- `UserDevice`
- `SearchHistory`
- `BackupRecord`
- `PerformanceMetric`
- `HealthCheck`
- `PerformanceAlert`

## 🚀 Next Steps

1. **Run Database Migration**:
   ```bash
   npx prisma db push --schema=packages/database/prisma/schema.prisma
   ```

2. **Test API Endpoints**:
   - Use Postman or curl to test each endpoint
   - Verify authentication middleware works

3. **Frontend Integration**:
   - Add components to existing pages
   - Test offline functionality
   - Verify notifications work

4. **Performance Testing**:
   - Monitor health checks
   - Test rate limiting
   - Verify caching works

5. **Production Deployment**:
   - Set up backup scheduling
   - Configure Redis for caching
   - Enable Firebase notifications
   - Set up monitoring alerts

## 📝 Configuration

### Environment Variables Needed
```
OPENAI_API_KEY or GROQ_API_KEY
FIREBASE_PROJECT_ID
FIREBASE_PRIVATE_KEY
FIREBASE_CLIENT_EMAIL
REDIS_URL
BACKUP_PATH
DATABASE_URL
```

### Rate Limiting Configuration
Adjust in `rateLimiter.ts`:
- `windowMs`: Time window in milliseconds
- `maxRequests`: Max requests per window
- `keyGenerator`: How to identify users

### Cache Configuration
Adjust in `cache.ts`:
- `defaultTTL`: Default cache time-to-live
- Redis connection string

## 🐛 Troubleshooting

### Services Not Working
- Check database models are created: `npx prisma db push`
- Verify environment variables are set
- Check API routes are registered

### Notifications Not Sending
- Verify Firebase credentials
- Check UserDevice records exist
- Review notification preferences

### Offline Sync Issues
- Check IndexedDB in browser DevTools
- Verify API endpoints are accessible
- Check network status detection

### Performance Issues
- Monitor health check endpoint
- Review performance metrics
- Check database query times
- Verify caching is working

## 📞 Support

For issues or questions:
1. Check the service implementation
2. Review API route handlers
3. Check browser console for errors
4. Review server logs
5. Verify database connectivity
