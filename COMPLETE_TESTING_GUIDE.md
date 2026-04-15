# Complete Testing Guide - All 10 Features

## Pre-Testing Setup

### 1. Start Both Servers

```bash
# Terminal 1 - API Server
cd apps/api
npm run dev
# Should run on http://localhost:3001

# Terminal 2 - Web Server
cd apps/web
npm run dev
# Should run on http://localhost:3000
```

### 2. Test Credentials

**Admin:**
- Email: admin@medthread.com
- Password: Admin@123

**Doctor (Verified):**
- Email: rifa@gmail.com
- Password: Doctor@123456

**Patient:**
- Email: navin@gmail.com
- Password: Patient@123456

---

## Feature 1: Doctor Reviews - Testing Checklist

### Test 1.1: Create Review
1. Login as patient (navin@gmail.com)
2. Navigate to doctor profile: http://localhost:3000/u/rifa
3. Scroll to "Leave a Review" section
4. Fill in all ratings (1-5 stars)
5. Write review text
6. Click "Submit Review"
7. ✅ Verify review appears in list

### Test 1.2: Edit Review
1. Find your review in the list
2. ✅ Verify "Edit" button is visible (only on your review)
3. Click "Edit"
4. ✅ Verify modal opens with current ratings
5. Change ratings and text
6. Click "Save Changes"
7. ✅ Verify changes persist after page reload

### Test 1.3: Delete Review
1. Find your review
2. Click "Delete"
3. ✅ Verify confirmation dialog appears
4. Confirm deletion
5. ✅ Verify review is removed from list

### Test 1.4: Sort Reviews
1. Use sorting dropdown
2. Test "Most Recent" - ✅ Newest first
3. Test "Highest Rated" - ✅ 5-star reviews first
4. Test "Lowest Rated" - ✅ 1-star reviews first
5. Test "Most Helpful" - ✅ By helpful count

### Test 1.5: Helpful Voting
1. Click "Helpful" on any review
2. ✅ Verify count increases
3. Refresh page
4. ✅ Verify vote persists

---

## Feature 2: Outbreak Alerts - Testing Checklist

### Test 2.1: View Alert History
1. Navigate to: http://localhost:3000/alerts-history
2. ✅ Verify page loads with alerts
3. ✅ Verify severity badges display (LOW, MEDIUM, HIGH, CRITICAL)
4. ✅ Verify timestamps are correct

### Test 2.2: Filter Alerts
1. Click "All" tab - ✅ Shows all alerts
2. Click "Active" tab - ✅ Shows only active alerts
3. Click "Expired" tab - ✅ Shows only expired alerts
4. ✅ Verify counts match in tab labels

### Test 2.3: Share Alert
1. Click "Share" button on any alert
2. ✅ Verify native share dialog opens (mobile) OR
3. ✅ Verify "Link copied" message (desktop)
4. Paste link - ✅ Verify it contains alert details

### Test 2.4: Mark as Read
1. Find an active alert
2. Click "Mark as Read"
3. ✅ Verify success message
4. ✅ Verify alert status updates

### Test 2.5: Create Alert (Admin Only)
1. Login as admin
2. Navigate to: http://localhost:3000/admin/emergency-broadcast
3. Create new alert
4. ✅ Verify it appears in history

---

## Feature 3: Community Discussions - Testing Checklist

### Test 3.1: Pin Post (Moderator)
1. Login as admin
2. Go to homepage
3. Click three dots on any post
4. ✅ Verify "Pin Post" option visible
5. Click "Pin Post"
6. ✅ Verify "Pinned" badge appears
7. ✅ Verify post stays at top

### Test 3.2: Lock Post (Moderator)
1. As admin, click three dots on post
2. Click "Lock Post"
3. ✅ Verify lock status
4. Try to comment
5. ✅ Verify commenting is disabled

### Test 3.3: Bookmark Post
1. Login as any user
2. Click bookmark icon on post
3. ✅ Verify icon fills/changes color
4. Navigate to: http://localhost:3000/bookmarks
5. ✅ Verify post appears in bookmarks

### Test 3.4: Remove Bookmark
1. On bookmarks page, click bookmark icon again
2. ✅ Verify post disappears from list
3. Go back to homepage
4. ✅ Verify bookmark icon is empty

### Test 3.5: Moderator Actions Not Visible to Regular Users
1. Logout admin
2. Login as patient
3. Click three dots on post
4. ✅ Verify NO pin/lock options
5. ✅ Verify only edit/delete (if own post)

---

## Feature 4: Free Medical Advice - Testing Checklist

### Test 4.1: Mark Best Answer
1. Login as patient (post author)
2. Navigate to your post with doctor comments
3. Find a doctor's comment
4. ✅ Verify "Mark Best Answer" button visible
5. Click "Mark Best Answer"
6. ✅ Verify green "Best Answer" badge appears
7. Refresh page
8. ✅ Verify badge persists

### Test 4.2: Best Answer Not Visible to Non-Authors
1. Login as different user
2. View same post
3. ✅ Verify NO "Mark Best Answer" button
4. ✅ Verify "Best Answer" badge still visible

### Test 4.3: Request Consultation
1. Login as patient
2. Find a doctor's comment
3. ✅ Verify "Request Consultation" button visible
4. Click button
5. ✅ Verify modal opens
6. Enter message
7. Click "Send Request"
8. ✅ Verify redirects to chat
9. ✅ Verify message sent to doctor

### Test 4.4: Consultation Request Not on Own Comments
1. Login as doctor
2. View your own comment
3. ✅ Verify NO "Request Consultation" button

---

## Feature 5: Appointment Booking - Testing Checklist

### Test 5.1: Book Appointment
1. Login as patient
2. Navigate to doctor profile
3. Click "Book Appointment"
4. Select date and time
5. Add reason
6. Submit
7. ✅ Verify appointment created
8. ✅ Verify status is "PENDING"

### Test 5.2: Reschedule Appointment
1. Go to your appointments
2. Find pending/approved appointment
3. Click "Reschedule"
4. ✅ Verify modal opens with current details
5. Select new date/time
6. Add reason (optional)
7. Click "Reschedule"
8. ✅ Verify success message
9. ✅ Verify status changes to "PENDING"
10. ✅ Verify new date/time saved

### Test 5.3: Cancel Appointment
1. Find any appointment
2. Click "Cancel"
3. ✅ Verify reason field appears
4. Enter cancellation reason
5. Submit
6. ✅ Verify status changes to "CANCELLED"
7. ✅ Verify reason is saved

### Test 5.4: Doctor Can Cancel Too
1. Login as doctor
2. View your appointments
3. Cancel patient's appointment
4. ✅ Verify cancellation works

---

## Feature 6: Support Groups - Testing Checklist

### Test 6.1: Create Support Group
1. Login as any user
2. Navigate to: http://localhost:3000/support-groups
3. Click "Create Group"
4. Fill in details
5. Submit
6. ✅ Verify group created

### Test 6.2: Join Group
1. Find a group
2. Click "Join Group"
3. ✅ Verify you're added to members
4. ✅ Verify member count increases

### Test 6.3: Leave Group
1. Click "Leave Group"
2. ✅ Verify you're removed
3. ✅ Verify member count decreases

### Test 6.4: Post in Group
1. Join a group
2. Navigate to group page
3. Create a post
4. ✅ Verify post appears in group feed

### Test 6.5: View Members
1. Click "Members" tab
2. ✅ Verify all members listed
3. ✅ Verify member roles shown

---

## Feature 7: Symptom Diary - Testing Checklist

### Test 7.1: Access Health Profile
1. Login as patient
2. Navigate to: http://localhost:3000/health-profile
3. ✅ Verify page loads

### Test 7.2: Log Symptom
1. Fill in symptom form
2. Select severity
3. Add notes
4. Submit
5. ✅ Verify symptom saved

### Test 7.3: View History
1. Navigate to history section
2. ✅ Verify past symptoms listed
3. ✅ Verify dates correct

### Test 7.4: Update Profile
1. Edit health profile
2. Add medical conditions
3. Save
4. ✅ Verify changes persist

---

## Feature 8: Second Opinion - Testing Checklist

### Test 8.1: Request Second Opinion
1. Login as patient
2. Create new post
3. Select "Second Opinion" type (if available)
4. Add medical details
5. Submit
6. ✅ Verify post created

### Test 8.2: Multiple Doctor Responses
1. Login as doctor 1
2. Comment on second opinion post
3. Logout, login as doctor 2
4. Comment on same post
5. ✅ Verify both comments visible

### Test 8.3: View All Opinions
1. Login as patient (post author)
2. View your second opinion post
3. ✅ Verify all doctor responses shown
4. ✅ Verify doctor verification badges

---

## Feature 9: Real-Time Chat - Testing Checklist

### Test 9.1: Send Message
1. Login as patient
2. Navigate to chat
3. Select conversation
4. Type message
5. Send
6. ✅ Verify message appears

### Test 9.2: Receive Message (Real-Time)
1. Open chat in two browsers
2. Login as different users
3. Send message from browser 1
4. ✅ Verify appears in browser 2 instantly

### Test 9.3: Typing Indicator
1. Start typing in browser 1
2. ✅ Verify "typing..." appears in browser 2

### Test 9.4: Online Status
1. Login in browser 1
2. ✅ Verify online indicator in browser 2

---

## Feature 10: Health Timeline - Testing Checklist

### Test 10.1: View Timeline
1. Login as patient
2. Navigate to health profile
3. ✅ Verify timeline section exists

### Test 10.2: Add Medical History
1. Add past diagnosis
2. Add surgery date
3. Save
4. ✅ Verify entries appear

### Test 10.3: View Integrated Data
1. Check timeline
2. ✅ Verify appointments shown
3. ✅ Verify symptoms shown
4. ✅ Verify medical history shown

---

## Cross-Feature Integration Tests

### Integration Test 1: Post → Comment → Consultation
1. Create post as patient
2. Doctor comments
3. Patient marks best answer
4. Patient requests consultation
5. ✅ Verify entire flow works

### Integration Test 2: Appointment → Reschedule → Cancel
1. Book appointment
2. Reschedule it
3. Cancel it
4. ✅ Verify all status changes tracked

### Integration Test 3: Group → Post → Bookmark
1. Join support group
2. Create post in group
3. Bookmark the post
4. ✅ Verify appears in bookmarks

---

## Performance Tests

### Test P1: Page Load Times
1. Measure homepage load
2. ✅ Should load < 3 seconds
3. Measure doctor profile load
4. ✅ Should load < 2 seconds

### Test P2: Real-Time Updates
1. Create post
2. ✅ Should appear in other users' feeds < 1 second
3. Send chat message
4. ✅ Should deliver < 500ms

### Test P3: Large Data Sets
1. Load page with 100+ posts
2. ✅ Should scroll smoothly
3. Load doctor with 50+ reviews
4. ✅ Should render without lag

---

## Security Tests

### Test S1: Authentication
1. Try accessing protected routes without login
2. ✅ Should redirect to login

### Test S2: Authorization
1. Try editing another user's review
2. ✅ Should return 403 Forbidden
3. Try pinning post as regular user
4. ✅ Should return 403 Forbidden

### Test S3: Input Validation
1. Submit empty forms
2. ✅ Should show validation errors
3. Submit invalid data
4. ✅ Should reject with error message

---

## Mobile Responsiveness Tests

### Test M1: Mobile Layout
1. Open on mobile device or resize browser
2. ✅ Verify all pages responsive
3. ✅ Verify buttons accessible
4. ✅ Verify text readable

### Test M2: Touch Interactions
1. Test tap targets
2. ✅ Should be large enough (44x44px minimum)
3. Test swipe gestures
4. ✅ Should work smoothly

---

## Browser Compatibility Tests

### Test B1: Chrome
- ✅ All features work
- ✅ No console errors

### Test B2: Firefox
- ✅ All features work
- ✅ No console errors

### Test B3: Safari
- ✅ All features work
- ✅ No console errors

### Test B4: Edge
- ✅ All features work
- ✅ No console errors

---

## Error Handling Tests

### Test E1: Network Errors
1. Disconnect internet
2. Try to submit form
3. ✅ Should show error message
4. Reconnect
5. ✅ Should allow retry

### Test E2: Server Errors
1. Stop API server
2. Try to load data
3. ✅ Should show error message
4. ✅ Should not crash app

### Test E3: Invalid Data
1. Submit malformed data
2. ✅ Should validate and reject
3. ✅ Should show helpful error

---

## Accessibility Tests

### Test A1: Keyboard Navigation
1. Use Tab key to navigate
2. ✅ All interactive elements accessible
3. Use Enter/Space to activate
4. ✅ All buttons work

### Test A2: Screen Reader
1. Use screen reader
2. ✅ All content readable
3. ✅ All images have alt text
4. ✅ All forms have labels

### Test A3: Color Contrast
1. Check text contrast
2. ✅ All text meets WCAG AA standards
3. ✅ Interactive elements clearly visible

---

## Final Verification Checklist

### Backend
- [ ] All API endpoints respond correctly
- [ ] Authentication works
- [ ] Authorization enforced
- [ ] Database queries optimized
- [ ] Error handling comprehensive
- [ ] Logging in place

### Frontend
- [ ] All pages load correctly
- [ ] All forms submit successfully
- [ ] All buttons work
- [ ] Loading states show
- [ ] Error messages display
- [ ] Success messages show

### Real-Time
- [ ] Socket.io connects
- [ ] Messages deliver instantly
- [ ] Typing indicators work
- [ ] Online status updates
- [ ] Reconnection works

### Security
- [ ] JWT tokens valid
- [ ] Passwords hashed
- [ ] SQL injection prevented
- [ ] XSS protection enabled
- [ ] CSRF protection enabled
- [ ] Rate limiting active

### Performance
- [ ] Pages load quickly
- [ ] Images optimized
- [ ] Code split
- [ ] Lazy loading works
- [ ] Caching enabled

---

## Bug Reporting Template

If you find any issues during testing:

```
**Feature:** [Feature name]
**Test:** [Test number]
**Expected:** [What should happen]
**Actual:** [What actually happened]
**Steps to Reproduce:**
1. Step 1
2. Step 2
3. Step 3

**Screenshots:** [If applicable]
**Browser:** [Chrome/Firefox/Safari/Edge]
**Device:** [Desktop/Mobile/Tablet]
```

---

## Testing Complete! ✅

Once all tests pass:
1. Document any issues found
2. Fix critical bugs
3. Re-test affected features
4. Mark as production-ready
5. Proceed to deployment

**Status:** Ready for comprehensive testing
**Next:** Run through all test cases systematically
