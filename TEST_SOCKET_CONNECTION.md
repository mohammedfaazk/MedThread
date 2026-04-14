# Socket.io Connection Test Guide

## Quick Test Commands

### 1. Start the Backend Server
```bash
cd apps/api
npm run dev
```
Server should start on port 3001

### 2. Start the Frontend Server
```bash
cd apps/web
npm run dev
```
Frontend should start on port 3000

### 3. Test Socket Connection

Open browser console (F12) and navigate to http://localhost:3000

You should see:
```
[PostFeed] Socket connected: <socket-id>
```

### 4. Test Real-Time Post Creation

#### Option A: Using Two Browser Windows
1. Open http://localhost:3000 in two different browser windows
2. Login to different accounts in each
3. Create a post in one window
4. Watch it appear instantly in the other window

#### Option B: Using Browser Console
In the browser console, you can manually emit a test event:

```javascript
// This simulates a new post being created
const testPost = {
  id: 'test-' + Date.now(),
  title: 'Test Real-Time Post',
  content: 'This is a test post to verify socket.io is working',
  author: { username: 'test_user', role: 'PATIENT' },
  community: { name: 'general' },
  priority: 'HIGH',
  priorityScore: 95,
  createdAt: new Date(),
  upvotes: 0,
  downvotes: 0,
  tags: [],
  _count: { comments: 0 }
};

// Note: This won't actually work from client side as the server emits the event
// But you can check if socket is connected:
console.log('Socket connected:', window.io?.connected);
```

### 5. Verify Priority Sorting

Navigate to the home feed and check:
- Posts with 🔴 RED badges appear first (HIGH priority)
- Posts with 🟡 AMBER badges appear next (MEDIUM priority)
- Posts with 🟢 GREEN badges appear last (LOW priority)
- Each post has a colored left border matching its priority

### 6. Test Trends Page

Navigate to http://localhost:3000/trends

Verify:
- Map loads with markers
- Country dropdown is populated
- Hovering over markers shows tooltips
- Stats cards display data
- Selecting a country zooms the map

## Expected Console Output

### Backend (apps/api)
```
🏥 MedThread API running on port 3001
User connected: <socket-id>
[API] Priority analysis complete: { postId: '...', priorityLevel: 'HIGH', urgencyScore: 92 }
[Socket] Emitted new_post event for post: <post-id>
```

### Frontend (apps/web)
```
[PostFeed] Socket connected: <socket-id>
[PostFeed] Received new post: { id: '...', title: '...', priority: 'HIGH' }
```

## Troubleshooting

### Socket Not Connecting
1. Check backend is running on port 3001
2. Check CORS settings in `apps/api/src/index.ts`
3. Verify socket.io-client version matches server version
4. Check browser console for connection errors

### Posts Not Appearing in Real-Time
1. Verify socket connection indicator shows green "Live" dot
2. Check browser console for socket events
3. Verify backend is emitting events (check server logs)
4. Try refreshing the page

### Map Not Loading
1. Check if leaflet CSS is imported
2. Verify react-leaflet is installed
3. Check browser console for errors
4. Ensure component is dynamically imported with `ssr: false`

### Priority Not Showing
1. Check if GROQ_API_KEY is set in backend .env
2. Verify post-priority.service is running
3. Check backend logs for priority analysis errors
4. Mock data should still work with fallback priorities

## Manual API Testing

### Test Priority Assignment
```bash
# Create a post with urgent symptoms
curl -X POST http://localhost:3001/api/v1/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Severe chest pain and difficulty breathing",
    "content": "I have been experiencing severe chest pain for 2 hours",
    "communityId": "general"
  }'
```

### Test Get Posts with Priority
```bash
curl http://localhost:3001/api/v1/posts
```

Should return posts sorted by priority (HIGH → MEDIUM → LOW)

### Test Trends API
```bash
# Get global COVID-19 stats
curl https://disease.sh/v3/covid-19/all

# Get country-specific data
curl https://disease.sh/v3/covid-19/countries/USA

# Get all countries
curl https://disease.sh/v3/covid-19/countries?sort=cases
```

## Success Criteria

✅ Socket connects on page load (green indicator)
✅ New posts appear instantly in other windows
✅ Posts are sorted by priority (HIGH → MEDIUM → LOW)
✅ Priority badges show correct colors and labels
✅ Left border colors match priority
✅ Trends map loads with real data
✅ Hover tooltips show detailed stats
✅ Country selection zooms map
✅ No TypeScript errors
✅ No console errors

## Performance Checks

- Socket connection should establish in <1 second
- New posts should appear in <500ms
- Map should load in <2 seconds
- API calls should complete in <1 second
- No memory leaks (check with browser DevTools)

## Security Notes

- Socket.io uses WebSocket with polling fallback
- CORS is configured for localhost only
- Authentication tokens are required for post creation
- API rate limiting is in place (production)
- No sensitive data in socket events

---

**All tests passing = All fixes working correctly! 🎉**
