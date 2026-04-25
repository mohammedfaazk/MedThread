# Quick Fix Checklist for 401 Error

## IMMEDIATE ACTIONS

### 1. Verify Both Servers Are Running
```bash
# Check if API is running on port 3001
netstat -ano | findstr :3001

# Check if Web is running on port 3000
netstat -ano | findstr :3000
```

If either is not running:
- API: Run `npm run dev` in `apps/api` directory
- Web: Run `npm run dev` in `apps/web` directory

### 2. Clear Everything and Log In Again
1. Open browser DevTools (F12)
2. Go to Application → Local Storage
3. Delete all entries (or just clear `auth_token` and `user`)
4. Close the browser completely
5. Reopen and log in again with test credentials:
   - Email: `rifa@gmail.com`
   - Password: `Doctor@123456`

### 3. Verify Token is Stored
1. After logging in, open DevTools Console
2. Run: `localStorage.getItem('auth_token')`
3. Should return a long string starting with `eyJ`
4. If it returns `null`, login failed

### 4. Try Creating a Post
1. Click "Create a post" button
2. Fill in the form
3. Click "Post"
4. Check the browser console for logs

### 5. Check API Logs
1. Look at the API server terminal
2. You should see logs like:
   ```
   [AUTH] Token extraction: { ... }
   [AUTH] Token verified successfully for user: ...
   [API] Creating post with data: { ... }
   ```

## If Still Getting 401

### Check the Exact Error
1. Open DevTools Network tab
2. Try to create a post
3. Find the POST request to `/api/v1/posts`
4. Click on it
5. Go to Response tab
6. Copy the error message

### Common Error Messages and Fixes

**"No token provided"**
- Token is not in localStorage
- Fix: Log out and log back in

**"Invalid token"**
- Token is corrupted or wrong secret
- Fix: Clear localStorage and log in again

**"Token expired"**
- Token is older than 7 days
- Fix: Log out and log in again

**"Cannot connect to server"**
- API is not running
- Fix: Start API server with `npm run dev` in `apps/api`

## Test with Simple Request

Open browser console and run:
```javascript
const token = localStorage.getItem('auth_token');
if (!token) {
  console.log('❌ No token found - you need to log in');
} else {
  console.log('✅ Token found:', token.substring(0, 50) + '...');
  
  // Try to create a post
  fetch('http://localhost:3001/api/v1/posts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title: 'Test Post',
      content: 'Test content',
      communityId: 'general',
      type: 'TEXT'
    })
  })
  .then(r => r.json())
  .then(data => console.log('Response:', data))
  .catch(err => console.error('Error:', err));
}
```

## Still Not Working?

1. **Restart everything**:
   - Stop API server (Ctrl+C)
   - Stop Web server (Ctrl+C)
   - Start API: `npm run dev` in `apps/api`
   - Start Web: `npm run dev` in `apps/web`

2. **Check database connection**:
   - API should show "Database connected" on startup
   - If not, check DATABASE_URL in .env

3. **Check JWT_SECRET**:
   - Should be set in `.env` file
   - Current value: `change-this-to-a-secure-random-string-in-production`

4. **Check if you're a verified doctor**:
   - If you're a doctor, you might need verification
   - Check the alert message after login
   - Unverified doctors can't create posts

## Debug Output to Share

If still not working, share:
1. Browser console output (screenshot or copy-paste)
2. API server logs (screenshot or copy-paste)
3. Network tab request/response (screenshot)
4. Result of: `localStorage.getItem('auth_token')`
5. Result of: `localStorage.getItem('user')`
