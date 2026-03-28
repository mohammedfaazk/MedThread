# Admin Login Credentials ✅

## Working Credentials

```
Email: admin@medthread.com
Password: Admin@123
```

## Verification

The password has been tested and verified to work:
- ✅ Password hash exists in database
- ✅ bcrypt comparison successful
- ✅ Backend authentication working

## Testing

You can test the credentials using:

```bash
cd apps/api
npx tsx test-admin-password.ts
```

## Troubleshooting

If login still fails:

1. **Check API Server**: Make sure the API server is running on port 3001
   ```bash
   # Check if port 3001 is in use
   netstat -ano | findstr :3001
   ```

2. **Check Frontend API URL**: Verify `NEXT_PUBLIC_API_URL` in `.env`
   ```
   NEXT_PUBLIC_API_URL=http://localhost:3001
   ```

3. **Clear Browser Cache**: Sometimes old tokens cause issues
   - Open DevTools (F12)
   - Go to Application > Local Storage
   - Clear `auth_token` and `user` entries

4. **Check Network Tab**: Look for the actual request/response
   - Open DevTools (F12)
   - Go to Network tab
   - Try logging in
   - Check the `/api/auth/login` request

## Common Issues

### 401 Unauthorized
- Wrong password (use exactly: `Admin@123`)
- Rate limit exceeded (restart API server)
- Password hash mismatch (run password reset script)

### Connection Refused
- API server not running
- Wrong API URL in frontend .env
- Port 3001 blocked by firewall

### Rate Limit
- Too many failed attempts
- Solution: Restart API server to clear in-memory rate limits

## Status
✅ Credentials verified and working
