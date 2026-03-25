# How to Test Appointment Reminders

## Quick Test (Automated)

### Step 1: Create a Test Appointment
```bash
npx tsx apps/api/create-test-appointment-for-reminder.ts
```

This will:
- Create an appointment 23 hours from now
- Set status to APPROVED
- Link a patient and doctor
- Create a conversation

### Step 2: Check Current Status
```bash
npx tsx apps/api/test-appointment-reminders.ts
```

This shows:
- All approved appointments
- Which ones would trigger reminders
- Time until each appointment

### Step 3: Wait for Cron Job
The cron job runs **every hour** automatically. Watch the server logs for:
```
[CRON] Sending appointment reminders...
[CRON] Sent X appointment reminders
```

### Step 4: Verify Notifications
1. Login as the patient
2. Check notifications (bell icon)
3. Should see: "Reminder: Your appointment with Dr. [name] is in 24 hours"

4. Login as the doctor
5. Check notifications
6. Should see: "Reminder: Your appointment with [patient] is in 24 hours"

---

## Manual Test (Via UI)

### Step 1: Create Appointment
1. Go to `http://localhost:3000`
2. Login as a patient (e.g., Megha)
3. Navigate to `/appointments`
4. Click "Book Appointment"
5. Select a verified doctor
6. Set appointment time to **23 hours from now**
7. Submit the form

### Step 2: Wait for Reminders
- **24-hour reminder**: Will be sent within the next hour
- **1-hour reminder**: Will be sent 23 hours later

### Step 3: Check Notifications
Both patient and doctor will receive:
- In-app notification (bell icon)
- Email notification (if email service is configured)

---

## How the System Works

### Cron Job Schedule
- **Frequency**: Every hour (0 * * * *)
- **Location**: `apps/api/src/services/cron-jobs.service.ts`
- **Function**: `sendAppointmentReminders()`

### Reminder Logic
1. **24-Hour Check**:
   - Finds appointments starting in 24 hours
   - Sends notification to patient and doctor
   - Sends email to both

2. **1-Hour Check**:
   - Finds appointments starting in 1 hour
   - Sends notification to patient and doctor
   - Sends email to both

### What Gets Sent
- **In-app notification**: Appears in notification center
- **Email**: Sent to both patient and doctor emails
- **Content**: "Reminder: Your appointment with [name] is in [time]"
- **Link**: Direct link to appointment details

---

## Current Test Results

From the test script:
```
📊 Found 1 approved appointments:

📅 Appointment ID: cmmybomfb0005hepdf5iay9ix
   Patient: Megha
   Doctor: dr.rifa.hassan
   Start Time: 20/3/2026, 7:00:00 pm
   Status: APPROVED
   ⏰ Status: PAST (95.4 hours ago)
```

**Issue**: The existing appointment is in the past, so no reminders will be sent.

**Solution**: Create a new appointment in the future using the script above.

---

## Troubleshooting

### No Reminders Received?

1. **Check appointment time**:
   ```bash
   npx tsx apps/api/test-appointment-reminders.ts
   ```
   - Appointment must be APPROVED
   - Start time must be within 24 hours

2. **Check server logs**:
   - Look for: `[CRON] Sending appointment reminders...`
   - If not found, cron job might not be running

3. **Check notification table**:
   - Notifications should be created in database
   - Type: `APPOINTMENT_REMINDER`

4. **Check email service**:
   - Email service might not be configured
   - Check `.env` for email settings

### Cron Job Not Running?

The cron job starts automatically when the server starts. Check:
```
[CRON] Appointment reminders scheduled (every hour)
```

If not found, the cron service might not be initialized.

---

## Testing Checklist

- [ ] Create test appointment 23 hours in future
- [ ] Verify appointment is APPROVED status
- [ ] Wait for next hour (cron job runs)
- [ ] Check server logs for reminder message
- [ ] Login as patient - check notifications
- [ ] Login as doctor - check notifications
- [ ] Verify notification content is correct
- [ ] Verify notification link works
- [ ] Check emails (if configured)
- [ ] Wait 22 more hours for 1-hour reminder
- [ ] Verify 1-hour reminder is sent

---

## Quick Commands

```bash
# Create test appointment
npx tsx apps/api/create-test-appointment-for-reminder.ts

# Check reminder status
npx tsx apps/api/test-appointment-reminders.ts

# Check server logs (in running dev server)
# Look for: [CRON] Sending appointment reminders...
```
