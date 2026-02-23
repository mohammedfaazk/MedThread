# MedThread System Maintenance Guide

## Ensuring Login Works After Restart

The login system is designed to work reliably across restarts. Here's what's in place:

### 1. Database Connection Pooling
- **Location**: `apps/api/.env`
- **Configuration**: `DATABASE_URL` includes `pgbouncer=true&connection_limit=5`
- **Purpose**: Prevents "max clients reached" errors

### 2. Password Field
- **Field Name**: `passwordHash` (not `password`)
- **All auth operations use this field correctly**

### 3. Graceful Shutdown
- **Location**: `packages/database/src/index.ts`
- **Purpose**: Properly disconnects from database on shutdown

## Health Check

Run this anytime to verify system health:

```bash
cd apps/api
npx tsx health-check.ts
```

This checks:
- ✅ Database connection
- ✅ All users have passwords
- ✅ Admin user credentials
- ✅ API server status
- ✅ Login endpoint functionality

## Fix User Passwords

If any users are missing passwords (rare), run:

```bash
cd apps/api
npx tsx fix-all-user-passwords.ts
```

This will:
- Find users without passwords
- Set default passwords based on role:
  - Admin: `Admin@123456`
  - Doctor: `Doctor@123456`
  - Patient: `Patient@123456`

## Reset Specific User Password

```bash
cd apps/api
npx tsx reset-user-password.ts <email> <new-password>
```

Example:
```bash
npx tsx reset-user-password.ts doctor@example.com Doctor@123456
```

## Starting the System

### Start API Server
```bash
cd apps/api
npm run dev
```

### Start Web App
```bash
cd apps/web
npm run dev
```

### Check Both Are Running
```bash
# API should be on port 3001
curl http://localhost:3001/health

# Web app should be on port 3000 (or 3003 if 3000 is taken)
```

## Default Credentials

### Admin
- Email: `admin@medthread.com`
- Password: `Admin@123456`
- Access: http://localhost:3000/admin

## Troubleshooting

### "Invalid email or password"

1. **Check user exists**:
   ```bash
   cd apps/api
   npx tsx check-admin-user.ts
   ```

2. **Verify password**:
   - Make sure you're using the correct password you set
   - Passwords are case-sensitive
   - Check for extra spaces

3. **Check API logs**:
   - Look at the terminal running `npm run dev` in `apps/api`
   - Errors will show there

### "Max clients reached"

This should not happen anymore due to connection pooling, but if it does:

1. **Restart API server**:
   ```bash
   # Stop the server (Ctrl+C)
   # Start again
   npm run dev
   ```

2. **Check DATABASE_URL**:
   - Should include `pgbouncer=true&connection_limit=5`

### Port Already in Use

If you see "EADDRINUSE" error:

**Windows**:
```bash
# Find process using port 3001
netstat -ano | findstr :3001

# Kill the process (replace PID with actual number)
taskkill /F /PID <PID>
```

**Mac/Linux**:
```bash
# Find and kill process
lsof -ti:3001 | xargs kill -9
```

### Database Connection Failed

1. **Check .env file**:
   - `apps/api/.env` should have valid `DATABASE_URL`

2. **Test connection**:
   ```bash
   cd packages/database
   npx prisma db pull
   ```

3. **Check Supabase**:
   - Make sure your Supabase project is running
   - Check connection string is correct

## Best Practices

### 1. Never Commit Passwords
- `.env` files are in `.gitignore`
- Never commit actual passwords to git

### 2. Change Default Passwords
- After first login, users should change their passwords
- Especially important for admin accounts

### 3. Regular Health Checks
- Run `health-check.ts` periodically
- Especially after deployments or updates

### 4. Backup Database
- Regular backups of Supabase database
- Export important data periodically

### 5. Monitor Logs
- Check API logs for errors
- Look for authentication failures
- Monitor database connection issues

## Files Reference

### Password Management
- `apps/api/check-admin-user.ts` - Check admin credentials
- `apps/api/fix-all-user-passwords.ts` - Fix missing passwords
- `apps/api/reset-user-password.ts` - Reset specific user
- `apps/api/health-check.ts` - Complete system check

### Configuration
- `apps/api/.env` - API environment variables
- `apps/api/src/services/auth.service.ts` - Login logic
- `packages/database/src/index.ts` - Database client

### Documentation
- `ADMIN_CREDENTIALS.md` - Admin account info
- `SYSTEM_MAINTENANCE.md` - This file

## Support

If you encounter issues:

1. Run health check first
2. Check API logs
3. Verify database connection
4. Review this guide
5. Check individual user passwords if needed

Remember: The system is designed to work reliably. Most issues are due to:
- Wrong password being used
- Database connection problems
- Port conflicts
- Missing environment variables
