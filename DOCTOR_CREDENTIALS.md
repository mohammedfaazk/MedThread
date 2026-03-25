# 🔐 Doctor Credentials

## IMPORTANT: These credentials are permanent and will persist across app restarts

All doctors are **APPROVED** and can access chat immediately.

---

## 🚀 Quick Solution: Bypass Password Verification (Development Only)

**Tired of entering passwords every time?**

Edit `apps/api/.env` and change:
```env
BYPASS_CHAT_PASSWORD="false"
```
To:
```env
BYPASS_CHAT_PASSWORD="true"
```

Then restart the API server. No more password prompts! 🎉

⚠️ **WARNING**: Only use in development. Never enable in production!

---

## Doctor Accounts

### 1. Watson
- **Email**: `watson@gmail.com`
- **Password**: `Watson@123456`
- **Status**: APPROVED ✅

### 2. Dr. Mitchell
- **Email**: `dr.mitchell@medthread.com`
- **Password**: `Mitchell@123456`
- **Status**: APPROVED ✅

### 3. Dr. Rifa Hassan
- **Email**: `rifa@gmail.com`
- **Password**: `Rifa@123456`
- **Status**: APPROVED ✅

### 4. Test Doctor
- **Email**: `test.doctor.1773995866829@example.com`
- **Password**: `TestDoc@123456`
- **Status**: APPROVED ✅

### 5. Login Test Doctor
- **Email**: `login.test.doctor.1773995919045@example.com`
- **Password**: `LoginTest@123456`
- **Status**: APPROVED ✅

---

## Admin Account

- **Email**: `admin@medthread.com`
- **Password**: `Admin@123456`
- **Role**: ADMIN

---

## Password Verification

All passwords are:
- ✅ Properly hashed with bcrypt (12 rounds)
- ✅ Stored in database
- ✅ Verified to work with login
- ✅ Verified to work with chat password verification
- ✅ Unique per doctor
- ✅ Persistent across restarts

---

## Troubleshooting

If you ever encounter password verification issues:

1. **Run the diagnostic script**:
   ```bash
   cd apps/api
   npx tsx diagnose-password-issue.ts
   ```

2. **Reset to unique passwords** (if needed):
   ```bash
   cd apps/api
   npx tsx set-unique-doctor-passwords.ts
   ```

3. **Check doctor verification status**:
   ```bash
   cd apps/api
   npx tsx check-doctor-verification.ts
   ```

---

## Root Cause of Previous Issues

The issue was that every time the app restarted, a script was running that reset all doctor passwords to the same value (`Doctor@123456`). This has been fixed by:

1. ✅ Setting unique passwords for each doctor
2. ✅ Ensuring all doctors are APPROVED
3. ✅ Verifying password hashes work correctly
4. ✅ Testing both login and chat password verification
5. ✅ Documenting all credentials

---

## Security Notes

⚠️ **IMPORTANT**: These are development credentials. In production:
- Use strong, randomly generated passwords
- Implement password reset functionality
- Enable 2FA for doctor accounts
- Use environment variables for sensitive data
- Never commit credentials to version control

---

Last Updated: March 25, 2026
