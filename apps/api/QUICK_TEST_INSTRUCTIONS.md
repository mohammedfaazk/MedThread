# Quick Test Instructions

## Test Password for meghamaryvinu@licet.ac.in

### Run the Test Script

```bash
cd apps/api
npm run test:password
```

### What Happens

1. Script fetches user data from database
2. Shows user information (email, username, role, etc.)
3. Prompts you to choose a password to test:
   - Option 1: `Admin@123456` (default from ADMIN_CREDENTIALS.md)
   - Option 2: `Password@123`
   - Option 3: Custom password

4. Uses bcrypt.compare() to verify the password
5. Shows ✅ if match or ❌ if no match
6. Allows testing another password if first attempt fails

### Default Password from Documentation

According to `ADMIN_CREDENTIALS.md` and `ADMIN_FIX.md`, the default password is:

**`Admin@123456`**

### Example Output

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
╚════════════════════════════════════════════════╝

Common passwords to test:
  1. Admin@123456 (default admin password)
  2. Password@123
  3. Custom password

Enter choice (1-3) or press Enter for option 1: 

🔍 Testing password: "Admin@123456"
⏳ Comparing with bcrypt hash...

══════════════════════════════════════════════════
✅ PASSWORD MATCH! ✅
══════════════════════════════════════════════════
```

### Files Created

1. **test-user-password.ts** - Main test script
2. **PASSWORD_TEST_README.md** - Detailed documentation
3. **QUICK_TEST_INSTRUCTIONS.md** - This file (quick reference)

### Admin Credential Files Found

- ✅ **ADMIN_CREDENTIALS.md** - Documents default password: `Admin@123456`
- ✅ **ADMIN_FIX.md** - Admin reset instructions with same password

Both files confirm the default password is **`Admin@123456`**
