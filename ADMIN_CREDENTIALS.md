# MedThread Admin Credentials

## Default Admin Account

After running the seed script, use these credentials to access the admin dashboard:

```
╔════════════════════════════════════════╗
║   DEFAULT ADMIN CREDENTIALS            ║
╠════════════════════════════════════════╣
║  Email:    admin@medthread.com         ║
║  Username: admin                       ║
║  Password: Admin@123456                ║
╚════════════════════════════════════════╝
```

## How to Create Admin User

### Method 1: Automatic Seed (Recommended)
```bash
cd apps/api
npm run seed:admin
```

This creates the default admin user with credentials above.

### Method 2: Interactive Creation
```bash
cd apps/api
npm run create:admin
```

This allows you to set custom credentials interactively.

## Admin Dashboard Access

1. **Start the application**:
   ```bash
   # Terminal 1 - API
   cd apps/api
   npm run dev

   # Terminal 2 - Web
   cd apps/web
   npm run dev
   ```

2. **Access admin login**:
   ```
   http://localhost:3000/admin/login
   ```

3. **Login with credentials above**

## Admin Capabilities

### Doctor Verification Management
- ✅ View pending doctor verification requests
- ✅ Review KYC documents and medical licenses
- ✅ Approve or reject verification requests
- ✅ Suspend verified doctors
- ✅ View verification statistics

### User Management
- ✅ View all users with filters
- ✅ Search users by username/email
- ✅ Suspend/unsuspend user accounts
- ✅ Delete user accounts
- ✅ View user activity and statistics

### Content Moderation
- ✅ View reported posts and comments
- ✅ Approve or reject reports
- ✅ Remove inappropriate content
- ✅ Ban users for violations

### Platform Analytics
- ✅ View platform statistics
- ✅ Monitor user growth
- ✅ Track content creation
- ✅ Doctor verification metrics

## Security Notes

⚠️ **IMPORTANT SECURITY MEASURES**:

1. **Change Default Password**: 
   - Login immediately after setup
   - Change password to a strong, unique password
   - Use password manager

2. **Secure Environment Variables**:
   - Never commit `.env` files
   - Use strong JWT_SECRET in production
   - Rotate secrets regularly

3. **Access Control**:
   - Only create admin accounts for trusted personnel
   - Monitor admin activity logs
   - Use 2FA (to be implemented)

4. **Production Deployment**:
   - Disable seed script in production
   - Use environment-specific admin creation
   - Implement IP whitelisting for admin routes

## API Endpoints for Admin

### Authentication
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@medthread.com",
  "password": "Admin@123456"
}
```

### Get Platform Stats
```http
GET /api/v1/admin/stats
Authorization: Bearer {admin_token}
```

### Get Pending Doctor Verifications
```http
GET /api/v1/doctor-verification/pending
Authorization: Bearer {admin_token}
```

### Approve Doctor
```http
POST /api/v1/doctor-verification/{userId}/approve
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "notes": "All documents verified"
}
```

### Reject Doctor
```http
POST /api/v1/doctor-verification/{userId}/reject
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "reason": "License could not be verified"
}
```

## Troubleshooting

### Admin User Already Exists
If you see "Admin user already exists", the admin is already created. Use the default credentials or reset the database:

```bash
cd packages/database
npx prisma db push --force-reset
cd ../../apps/api
npm run seed:admin
```

### Cannot Login
1. Check if API is running on port 3001
2. Verify database connection
3. Check browser console for errors
4. Verify credentials are correct

### Forgot Admin Password
Run the seed script again to reset:
```bash
cd packages/database
npx prisma db push --force-reset
cd ../../apps/api
npm run seed:admin
```

## Next Steps

1. ✅ Login with admin credentials
2. ✅ Change default password
3. ✅ Explore admin dashboard
4. ✅ Test doctor verification workflow
5. ✅ Configure email notifications (optional)
6. ✅ Set up monitoring and logging

## Support

For admin-related issues:
- Check API logs: `apps/api/logs/`
- Review database: `npx prisma studio`
- Contact: support@medthread.com
