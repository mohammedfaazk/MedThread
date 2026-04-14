# MedThread Dashboard Testing Guide

## Quick Start Testing

### 1. Start the Development Servers

```bash
# Terminal 1 - Start API Server
cd apps/api
npm run dev

# Terminal 2 - Start Web Server
cd apps/web
npm run dev
```

### 2. Access the Application

- Frontend: http://localhost:3000
- API: http://localhost:3001

---

## Feature Testing Checklist

### ✅ Priority System Testing

1. **View Posts with Priority Badges**
   - Navigate to homepage
   - Verify posts show priority badges: 🔴 HIGH, 🟡 MEDIUM, 🟢 LOW
   - Check colored left borders match priority

2. **Priority Section Headers**
   - Scroll through feed
   - Verify section headers appear:
     - 🔴 URGENT POSTS (count)
     - 🟡 NEEDS ATTENTION (count)
     - 🟢 GENERAL DISCUSSION (count)
   - Confirm posts are grouped correctly

3. **Priority Sorting**
   - Verify posts appear in order: HIGH → MEDIUM → LOW
   - Within each priority, higher scores appear first

### ✅ Real-Time Updates Testing

1. **Socket Connection**
   - Check for green "Live" indicator in feed
   - Open browser console, verify socket connection logs

2. **Create New Post**
   - Login as a user
   - Create a new post with urgent content (e.g., "chest pain")
   - Watch for real-time appearance in feed
   - Verify post appears at correct priority position

3. **Multi-User Testing**
   - Open two browser windows (different users)
   - Create post in one window
   - Verify it appears in other window without refresh

### ✅ Doctor Proximity Notifications Testing

1. **Setup**
   - Login as a doctor account
   - Ensure user has location data (pincode, city, state)
   - Open browser console to see logs

2. **Create HIGH Priority Post**
   - Login as patient (different window)
   - Create post with emergency content
   - Example: "Severe chest pain radiating to left arm"

3. **Verify Doctor Notification**
   - Check doctor's window for notification banner
   - Should show:
     - Priority level (🔴 HIGH or 🟡 MEDIUM)
     - Proximity (same area/city/state)
     - Post title
     - "View Post" button
   - Verify browser notification (if permission granted)

4. **Test Proximity Matching**
   - Create posts from patients with:
     - Same pincode → "same area" notification
     - Same city → "same city" notification
     - Same state → "same state" notification
   - Verify only nearby doctors receive notifications

### ✅ Mock Data Testing

1. **View Existing Posts**
   - Homepage should show 10 posts
   - Priority distribution:
     - 3 HIGH priority posts
     - 3 MEDIUM priority posts
     - 4 LOW priority posts

2. **Check Post Details**
   - Click on any post
   - Verify comments are displayed
   - Check author information (doctors have specialty)

3. **Verify User Locations**
   - All mock users should have Chennai, Tamil Nadu location
   - Doctors: 3 verified doctors with specialties
   - Patients: 2 regular users

### ✅ Priority Detection Testing

1. **Automatic Priority Analysis**
   - Create post with emergency keywords:
     - "chest pain", "can't breathe", "stroke"
   - Verify HIGH priority assigned

2. **Medium Priority Keywords**
   - Create post with:
     - "fever", "infection", "chronic condition"
   - Verify MEDIUM priority assigned

3. **Low Priority Content**
   - Create post about:
     - "vitamin supplements", "diet advice"
   - Verify LOW priority assigned

4. **Fix Priority Button**
   - As post author, click menu (⋯)
   - Select "Fix Priority"
   - Verify priority re-analysis works

### ✅ Global Health Trends Testing

1. **Navigate to Trends Page**
   - Go to /trends
   - Verify interactive map loads

2. **Test Map Features**
   - Hover over countries to see tooltips
   - Check tooltip shows:
     - Country name
     - Active cases
     - Deaths
     - Recovered
     - Cases per million
     - Tests done
     - Last updated date

3. **Test Filters**
   - Use country dropdown filter
   - Click disease filter buttons
   - Verify data updates accordingly

4. **Check Summary Cards**
   - Verify 4 stat cards display:
     - Total Cases
     - Active Cases
     - Recovery Rate
     - Tests

---

## Expected Console Logs

### Frontend (Browser Console)

```
[PostFeed] Socket connected: <socket-id>
[PostFeed] Registered user location: { pincode: '600001', city: 'Chennai', state: 'Tamil Nadu' }
[PostFeed] Received new post: { id: '...', title: '...', priority: 'HIGH' }
[PostFeed] Received nearby urgent post notification: { ... }
```

### Backend (Terminal)

```
[Socket] User <user-id> joined room: user_<user-id>
[Socket] User <user-id> registered location: 600001, Chennai, Tamil Nadu
[API] Priority analysis complete: { priorityLevel: 'HIGH', urgencyScore: 95 }
[Socket] Found 3 nearby doctors for HIGH priority post
[Socket] Sent proximity notifications to 3 doctors
[Socket] Emitted new_post event for post: <post-id>
```

---

## Common Issues & Solutions

### Issue: Socket not connecting
**Solution**: 
- Check API server is running on port 3001
- Verify CORS settings in `apps/api/src/index.ts`
- Check browser console for connection errors

### Issue: Priority not detected
**Solution**:
- Verify Groq API key in `.env` file
- Check `GROQ_API_KEY` environment variable
- Review keyword fallback in `post-priority.service.ts`

### Issue: Notifications not appearing
**Solution**:
- Ensure user has location data (pincode, city, state)
- Check socket room joining in console logs
- Verify priority is HIGH or MEDIUM (LOW doesn't trigger)
- Confirm doctor and patient are in same location

### Issue: Posts not sorted correctly
**Solution**:
- Check `PRIORITY_ORDER` constant in code
- Verify priority structure: `{ priorityLevel: 'HIGH', urgencyScore: 95 }`
- Review sorting logic in `posts.routes.ts`

### Issue: Section headers not showing
**Solution**:
- Verify posts have `priorityLevel` field
- Check PostFeed grouping logic
- Ensure posts array is not empty

---

## API Endpoints to Test

### Get Posts
```bash
curl http://localhost:3001/api/v1/posts
```

### Create Post
```bash
curl -X POST http://localhost:3001/api/v1/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "title": "Severe chest pain",
    "content": "I have severe chest pain radiating to my left arm",
    "communityId": "heart_health",
    "tags": ["chest-pain", "emergency"]
  }'
```

### Fix Priority
```bash
curl -X POST http://localhost:3001/api/fix-priorities/post/<post-id> \
  -H "Authorization: Bearer <token>"
```

### Analyze All Posts
```bash
curl -X POST http://localhost:3001/api/analyze-all-posts \
  -H "Authorization: Bearer <token>"
```

---

## Performance Benchmarks

### Expected Response Times
- Get Posts: < 200ms
- Create Post: < 500ms (including priority analysis)
- Socket Event Emission: < 50ms
- Priority Analysis: < 2s (Groq API)

### Socket Performance
- Connection Time: < 1s
- Event Latency: < 100ms
- Reconnection Time: < 3s

---

## Browser Compatibility

### Tested Browsers
- ✅ Chrome 120+
- ✅ Firefox 120+
- ✅ Safari 17+
- ✅ Edge 120+

### Required Features
- WebSocket support
- Notification API (optional)
- LocalStorage
- ES6+ JavaScript

---

## Mobile Testing

### Responsive Design
- Test on mobile viewport (375px width)
- Verify section headers are readable
- Check notification banners fit screen
- Test touch interactions

### Mobile-Specific Features
- Push notifications (if supported)
- Offline mode (service worker)
- Touch gestures

---

## Production Deployment Checklist

### Environment Variables
- [ ] `GROQ_API_KEY` set
- [ ] `DATABASE_URL` configured
- [ ] `NEXT_PUBLIC_API_URL` points to production API
- [ ] `CORS_ORIGIN` restricted to production domain

### Security
- [ ] Rate limiting enabled
- [ ] CSRF protection active
- [ ] Input sanitization working
- [ ] Authentication required for sensitive endpoints

### Performance
- [ ] Build optimization complete
- [ ] Static assets cached
- [ ] Database indexes created
- [ ] Socket.io scaled (if needed)

### Monitoring
- [ ] Error logging configured
- [ ] Analytics tracking active
- [ ] Socket connection monitoring
- [ ] API response time tracking

---

## Success Criteria

### All Features Working
- ✅ Posts display with correct priorities
- ✅ Section headers group posts correctly
- ✅ Real-time updates work across users
- ✅ Doctor proximity notifications trigger
- ✅ Priority detection is accurate
- ✅ Mock data loads correctly
- ✅ Global trends map displays data

### User Experience
- ✅ Fast page loads (< 3s)
- ✅ Smooth animations
- ✅ Clear visual hierarchy
- ✅ Intuitive navigation
- ✅ Responsive design

### Technical Quality
- ✅ No console errors
- ✅ No TypeScript errors
- ✅ Clean code structure
- ✅ Proper error handling
- ✅ Comprehensive logging

---

**Testing Date**: April 11, 2026  
**Version**: 1.0.0  
**Status**: Ready for Testing ✅
