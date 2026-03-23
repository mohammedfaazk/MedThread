# Quick Start Guide - Critical Features 🚀

**Ready to test the new safety features!**

---

## ⚡ Quick Test (2 minutes)

### 1. Start the Application
```bash
# From project root
npm run dev
```

This starts both API (port 3001) and Web (port 3000)

### 2. Run the Test Suite
```bash
# In a new terminal
node scripts/test-critical-features.js
```

This will test:
- ✅ File structure
- ✅ Emergency detection logic
- ✅ API endpoints
- ✅ Web pages accessibility

### 3. Manual Testing

**Test Medical Disclaimers:**
1. Visit http://localhost:3000
   - Look for orange disclaimer banner
   - Look for red emergency banner with hotline numbers

2. Visit http://localhost:3000/doctor-feed
   - Look for disclaimer at top

3. Visit http://localhost:3000/terms
   - Verify full terms page loads

4. Visit http://localhost:3000/signup
   - Scroll to bottom
   - Verify two consent checkboxes
   - Try submitting without checking - should be disabled
   - Check both boxes - submit should enable

**Test Emergency Detection:**
1. Login as a doctor
2. Try creating a post with: "I am having chest pain and can't breathe"
3. You should see a full-screen emergency alert modal
4. Verify emergency hotline numbers are displayed
5. Check the confirmation box and click Continue

---

## 🎯 What to Look For

### Medical Disclaimers ✅
- [ ] Orange disclaimer banner on homepage
- [ ] Red emergency banner with 112 hotline
- [ ] Disclaimer on doctor feed page
- [ ] Full terms page at /terms
- [ ] Consent checkboxes on signup
- [ ] Submit disabled until both checked

### Emergency Detection ✅
- [ ] Emergency modal appears for critical keywords
- [ ] Hotline numbers are clickable (tel: links)
- [ ] Mental health crisis numbers shown
- [ ] User must confirm before continuing
- [ ] Post still creates after confirmation

---

## 🧪 Test Emergency Keywords

Try creating posts/comments with these:

**IMMEDIATE (Full Modal):**
- "I want to kill myself"
- "I am having chest pain and can't breathe"
- "I think I'm having a heart attack"

**MENTAL_HEALTH (Full Modal):**
- "I have been cutting myself"
- "I am having suicidal thoughts"
- "I want to hurt myself"

**HIGH (Warning Banner):**
- "I have severe abdominal pain"
- "I am vomiting blood"
- "I have a high fever of 104"

**NORMAL (No Alert):**
- "I have a mild headache"
- "I am feeling tired lately"
- "I have a small rash"

---

## 📊 Expected Results

### Test Suite Output:
```
╔════════════════════════════════════════════════════════════╗
║     MedThread Critical Features Test Suite                ║
║     Testing Medical Disclaimers & Emergency Detection     ║
╚════════════════════════════════════════════════════════════╝

============================================================
📁 Testing File Structure
============================================================

✅ apps/web/src/components/MedicalDisclaimer.tsx
✅ apps/web/src/components/EmergencyAlert.tsx
✅ apps/web/src/app/terms/page.tsx
✅ apps/api/src/constants/emergency-keywords.ts
✅ apps/api/src/services/emergency-detection.service.ts

📊 Results: 5 passed, 0 failed

============================================================
🚨 Testing Emergency Detection System
============================================================

Test: IMMEDIATE - Suicide
Content: "I want to kill myself and end my life"
Detected Level: IMMEDIATE
Confidence: 100.0%
Keywords: suicide, kill myself, end my life
✅ Level detection: PASS
✅ Alert decision: PASS

[... more tests ...]

📊 Results: 10 passed, 0 failed

============================================================
📊 Final Results
============================================================

File Structure:       ✅ PASS
Emergency Detection:  ✅ PASS
API Endpoints:        ✅ PASS
Web Pages:            ✅ PASS

🎉 ALL TESTS PASSED! Critical features are working correctly.
```

---

## 🐛 Troubleshooting

### "API not accessible"
```bash
# Make sure API is running
cd apps/api
npm run dev
```

### "Web server not running"
```bash
# Make sure web app is running
cd apps/web
npm run dev
```

### "Module not found" errors
```bash
# Install dependencies
npm install
```

### Emergency detection not working
```bash
# Check if service is imported correctly
# Look for console errors in browser
# Check API response in Network tab
```

---

## 📝 Next Steps After Testing

### If All Tests Pass:
1. ✅ Commit changes to git
2. ✅ Deploy to staging environment
3. ✅ Test on staging
4. ✅ Deploy to production
5. ✅ Monitor audit logs for emergency detections

### If Tests Fail:
1. Review error messages
2. Check file paths
3. Verify imports
4. Check browser console
5. Review API logs

---

## 🚀 Deployment Checklist

Before deploying to production:

- [ ] All tests pass locally
- [ ] Medical disclaimers visible on all key pages
- [ ] Emergency detection working correctly
- [ ] Terms of Service page accessible
- [ ] Signup consent flow working
- [ ] Emergency hotline numbers correct for your region
- [ ] Audit logging working
- [ ] No console errors
- [ ] Mobile responsive design tested
- [ ] Cross-browser testing done

---

## 📞 Emergency Hotlines by Country

Make sure these are correct for your target audience:

**India:**
- Emergency: 112
- Ambulance: 102
- Mental Health: 9152987821

**US:**
- Emergency: 911
- Suicide Prevention: 988

**UK:**
- Emergency: 999
- NHS: 111
- Samaritans: 116123

Update in: `apps/api/src/constants/emergency-keywords.ts`

---

## 💡 Tips

1. **Test with real users** - Get feedback on disclaimer clarity
2. **Monitor audit logs** - Check for emergency detections
3. **Adjust keywords** - Add/remove based on false positives
4. **Update hotlines** - Keep emergency numbers current
5. **Legal review** - Have terms reviewed by legal counsel

---

## ✅ Success Criteria

You're ready for production when:

- ✅ All automated tests pass
- ✅ Manual testing complete
- ✅ No console errors
- ✅ Disclaimers clear and visible
- ✅ Emergency detection accurate
- ✅ Mobile experience good
- ✅ Legal team approved terms
- ✅ Emergency hotlines verified

---

## 🎉 You're Done!

The critical safety features are now implemented:
- Medical disclaimers protect you legally
- Emergency detection protects users
- Terms of Service establish clear boundaries
- Consent flow ensures user understanding

**Your platform is now safer and legally protected!**

Next: Implement Phase 2 features (Push Notifications, Search, Appointments)

