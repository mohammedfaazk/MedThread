# Fix Admin Credentials - Quick Guide

## Problem
Admin credentials are invalid and you cannot log in.

## Solution - Choose One Method

### Method 1: Quick Reset (Recommended)
```bash
# From project root
node check-admin.js
```
This will show you the current admin status.

If admin doesn't exist or password is wrong:
```bash
node reset-admin.js
```

This will:
- Delete any existing admin
- Create new admin with default credentials
- Test the credentials

**Default Credentials:**
- Email: `admin@medthread.com`
- Password: `Admin@123456`

---

### Method 2: Using API Seed Script
```bash
cd apps/api
npm run seed:admin
```

---

### Method 3: Interactive Creation
```bash
cd apps/api
npm run create:admin
```
Follow the prompts to create custom admin credentials.

---

### Method 4: Direct Database Reset
```bash
# Reset database and recreate admin
cd packages/database
npx prisma db push --force-reset
cd ../../apps/api
npm run seed:admin
```

⚠️ **WARNING**: This will delete ALL data!

---

## After Reset

1. **Start your servers:**
```bash
# Terminal 1 - API
cd apps/api
npm run dev

# Terminal 2 - Web
cd apps/web
npm run dev
```

2. **Login:**
- Go to: `http://localhost:3000/login`
- Email: `admin@medthread.com`
- Password: `Admin@123456`

3. **Verify it works:**
- You should be redirected to `/admin` dashboard
- Check localStorage for user data with role='ADMIN'

---

## Troubleshooting

### Still Can't Login?

**Check 1: Is API running?**
```bash
curl http://localhost:3001/health
```
Should return: `{"status":"ok"}`

**Check 2: Test login API directly**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@medthread.com","password":"Admin@123456"}'
```

Should return token and user data.

**Check 3: Check database**
```bash
cd packages/database
npx prisma studio
```
Look for user with:
- email: `admin@medthread.com`
- role: `ADMIN`

**Check 4: Verify password hash**
```bash
node check-admin.js
```
This will test if the password matches.

---

## Common Issues

### Issue: "Email already registered"
**Solution:** Run `node reset-admin.js` to delete and recreate

### Issue: "Invalid email or password"
**Possible causes:**
1. Wrong password - Use `Admin@123456` (case-sensitive)
2. Wrong email - Use `admin@medthread.com` (lowercase)
3. Password hash mismatch - Run `node reset-admin.js`

### Issue: "Account suspended"
**Solution:**
```bash
# Unsuspend admin via Prisma Studio
cd packages/database
npx prisma studio
# Find admin user, set isSuspended = false
```

### Issue: Admin exists but wrong role
**Solution:** Run `node reset-admin.js`

---

## Scripts Created

1. **check-admin.js** - Check current admin status
2. **reset-admin.js** - Reset admin to default credentials
3. **apps/api/src/scripts/seed-admin.ts** - Seed admin (npm script)
4. **apps/api/src/scripts/create-admin.ts** - Interactive creation

---

## Quick Commands Reference

```bash
# Check admin status
node check-admin.js

# Reset admin credentials
node reset-admin.js

# Seed admin (from apps/api)
npm run seed:admin

# Create custom admin (from apps/api)
npm run create:admin

# Open database viewer
cd packages/database && npx prisma studio
```

---

## Default Credentials (After Reset)

```
╔════════════════════════════════════════╗
║   ADMIN CREDENTIALS                    ║
╠════════════════════════════════════════╣
║  Email:    admin@medthread.com         ║
║  Password: Admin@123456                ║
╚════════════════════════════════════════╝
```

**Login URL:** http://localhost:3000/login

---

## Need More Help?

1. Check API logs for errors
2. Check browser console for errors
3. Verify database connection in `.env`
4. Make sure all dependencies are installed: `npm install`
