# How to Access Doctor Feed

## Issue
The doctor-feed page requires you to be logged in as a DOCTOR role.

## Quick Fix - Test Access

### Option 1: Check Your Current Login
1. Open browser console (F12)
2. Type: `localStorage.getItem('user')`
3. Check if `role: "DOCTOR"` is present
4. If not, you need to login as a doctor

### Option 2: Login as a Doctor
Use one of these verified doctors:

**Dr. Rifa Hassan**
- Username: `dr.rifa.hassan`
- Email: `rifa@gmail.com`
- Password: Check database or use password reset

**Dr. Watson**
- Username: `Watson`
- Email: `watson@gmail.com`

**Dr. Mitchell**
- Username: `dr.mitchell`
- Email: `dr.mitchell@medthread.com`

### Option 3: Direct Database Check
Run this to see all doctors:
```bash
npx tsx apps/api/check-doctor-verification.ts
```

## Steps to Access:

1. **Logout** (if currently logged in as patient)
   - Click profile → Logout

2. **Login as Doctor**
   - Go to `/login`
   - Use doctor credentials

3. **Navigate to Doctor Feed**
   - Go to `http://localhost:3000/doctor-feed`
   - OR add a link in the navbar/sidebar

4. **You should see:**
   - "Medical Priority Feed" header
   - Priority filter buttons (All, High, Medium, Low)
   - Posts with priority badges

## If Still Can't Access:

The page might be checking the wrong context. Let me know and I can:
1. Update the page to use JWT auth instead of UserContext
2. Add the doctor-feed link to the doctor dashboard
3. Create a test account for you

## Alternative: Test from Doctor Dashboard

The doctor dashboard should have a link to the priority feed. Check:
- `http://localhost:3000/dashboard/doctor`
- Look for "Priority Feed" or "Medical Feed" link
