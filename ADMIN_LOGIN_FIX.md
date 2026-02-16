# Admin Login Fix - Recreate Admin User

## Issue
Cannot log into admin dashboard after database sync.

## Root Cause
After running `prisma db push`, the database was synced and the admin user was likely removed or doesn't exist.

## Solution: Create Admin User

Run the seed-admin script to create a new admin user:

```bash
# From the root of the project
cd apps/api

# Run the seed script
npx tsx src/scripts/seed-admin.ts
```

## Default Admin Credentials

After running the script, you'll get:

```
Email:    admin@medthread.com
Username: admin
Password: Admin@123456
```

## How to Login

1. **Go to the login page**: `http://localhost:3000/login`
2. **Enter credentials**:
   - Email: `admin@medthread.com`
   - Password: `Admin@123456`
3. **After login**, navigate to: `http://localhost:3000/admin`

## Important Notes

⚠️ **Change the default password after first login!**

The admin dashboard checks:
- User must be logged in (have valid JWT token)
- User role must be `ADMIN`
- If not admin, redirects to home page with "Access denied" message

## Verification

To verify the admin user was created:

```bash
# Connect to your database and check
# For PostgreSQL:
SELECT id, username, email, role FROM "User" WHERE role = 'ADMIN';
```

You should see the admin user listed.

## Alternative: Create Admin via API

If the script doesn't work, you can create an admin user directly via the database or use the create-admin script:

```bash
cd apps/api
npx tsx src/scripts/create-admin.ts
```

## Troubleshooting

### "Admin user already exists"
If you see this message, the admin user exists. Try logging in with the default credentials.

### "Access denied. Admin only."
This means you're logged in but not as an admin. Make sure:
1. You logged in with the admin credentials
2. The user's role in the database is `ADMIN`
3. Clear localStorage and log in again

### Can't find the admin page
The admin dashboard is at: `http://localhost:3000/admin`

## Related Files
- `apps/api/src/scripts/seed-admin.ts` - Creates admin user
- `apps/web/src/app/admin/page.tsx` - Admin dashboard
- `ADMIN_CREDENTIALS.md` - Admin credentials documentation
