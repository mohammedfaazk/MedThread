# Password Verification Test Script

## Overview
This script tests password verification for the user `meghamaryvinu@licet.ac.in` by fetching their password hash from the database and comparing it with test passwords using bcrypt.

## What It Does

1. **Fetches User Data**: Retrieves the user's information from the database including:
   - Email, username, role
   - Password hash
   - Account status (verified, suspended)
   - Creation date

2. **Tests Password**: Uses bcrypt.compare() to verify if a given password matches the stored hash

3. **Interactive Testing**: Allows you to test multiple passwords interactively

## How to Run

### From apps/api directory:

```bash
cd apps/api
npm run test:password
```

### Or directly with tsx:

```bash
cd apps/api
tsx test-user-password.ts
```

## Password Options

When you run the script, you'll be prompted to choose:

1. **Admin@123456** - Default admin password (from ADMIN_CREDENTIALS.md)
2. **Password@123** - Common alternative password
3. **Custom password** - Enter your own password to test

## Expected Output

### If User Exists:
```
🔐 Password Verification Test
══════════════════════════════════════════════════

📧 Looking up user: meghamaryvinu@licet.ac.in...

✅ User found!

╔════════════════════════════════════════════════╗
║              USER INFORMATION                  ║
╠════════════════════════════════════════════════╣
║  Email:      meghamaryvinu@licet.ac.in         ║
║  Username:   meghamaryvinu                     ║
║  Role:       PATIENT                           ║
║  Verified:   true                              ║
║  Suspended:  false                             ║
║  Created:    2024-01-15                        ║
╚════════════════════════════════════════════════╝

Password Hash: $2b$12$abcdefghijklmnopqrstu...

🔍 Testing password: "Admin@123456"
⏳ Comparing with bcrypt hash...

══════════════════════════════════════════════════
✅ PASSWORD MATCH! ✅

The password "Admin@123456" is CORRECT for meghamaryvinu@licet.ac.in
══════════════════════════════════════════════════
```

### If User Not Found:
```
❌ User not found: meghamaryvinu@licet.ac.in

Available users in database:
   1. admin@medthread.com (admin) - ADMIN
   2. doctor1@example.com (doctor1) - DOCTOR
   ...
```

## Admin Credential Files

The script checks for documented passwords in:
- `ADMIN_CREDENTIALS.md` - Default admin password: **Admin@123456**
- `ADMIN_FIX.md` - Admin reset instructions

According to these files, the default password for admin accounts is: **Admin@123456**

## Requirements

- Node.js and npm installed
- Database connection configured in `.env`
- Prisma client generated
- bcrypt package installed (already in dependencies)

## Troubleshooting

### Database Connection Error
```bash
# Check if DATABASE_URL is set in .env
cat ../../.env | grep DATABASE_URL

# Test database connection
cd ../../packages/database
npx prisma studio
```

### User Not Found
- Verify the email address is correct
- Check if the user exists in the database using Prisma Studio
- The script will list available users if the target user is not found

### Module Not Found
```bash
# Install dependencies
npm install

# Generate Prisma client
cd ../../packages/database
npx prisma generate
```

## Script Location

- **Script**: `apps/api/test-user-password.ts`
- **Run from**: `apps/api/` directory
- **npm script**: `npm run test:password`

## Security Note

⚠️ This script is for testing purposes only. Never commit actual passwords to version control. The default password `Admin@123456` should be changed immediately after first login in production environments.
