# Quick Start: Area-Wise Doctor Replies

## 🚀 5-Minute Setup Guide

### For Doctors

1. **Add Your Clinic** (2 minutes)
   ```
   Dashboard → Clinic Management → Add Clinic
   - Enter clinic name and address
   - Click "Use my current location" for coordinates
   - Set operating hours
   - Mark as primary
   - Save
   ```

2. **Set Availability** (1 minute)
   ```
   - Check: Telemedicine Available
   - Check: In-Person Available
   - Check: Emergency Available (if applicable)
   - Enter insurance providers
   - Save Availability
   ```

3. **Done!** Your clinic now appears in patient searches with distance and availability info.

### For Patients

1. **View Doctor Replies** (1 minute)
   ```
   - Open any post with doctor replies
   - Click "Allow" when prompted for location
   - Doctors automatically sorted by distance
   ```

2. **Apply Filters** (30 seconds)
   ```
   - Select distance radius (e.g., Within 10 km)
   - Check: Telemedicine Available
   - Enter your insurance provider
   - Results update instantly
   ```

3. **Get Directions** (30 seconds)
   ```
   - Click "Get Directions" on any doctor
   - Opens Google Maps with route
   - Navigate to clinic
   ```

---

## 📋 Key Features at a Glance

### Patient Features
✅ Distance-based sorting  
✅ Radius filtering (1-50 km)  
✅ Telemedicine/In-Person filters  
✅ Emergency availability filter  
✅ Insurance provider matching  
✅ One-click directions  
✅ Real-time clinic status  

### Doctor Features
✅ Multiple clinic locations  
✅ Custom operating hours  
✅ Availability settings  
✅ Insurance provider list  
✅ Primary clinic designation  
✅ Easy coordinate entry  

---

## 🔗 Quick Links

### API Endpoints
```
GET  /api/posts/:postId/replies/doctors  # Get replies with location
POST /api/doctors/clinics                # Add clinic
PUT  /api/doctors/availability           # Update availability
GET  /api/doctors/clinics                # List your clinics
```

### Frontend Components
```tsx
<AreaWiseDoctorReplies postId="123" />      // Patient view
<DoctorClinicManagement />                   // Doctor dashboard
```

---

## 💡 Pro Tips

### For Patients
- Grant location permission for best results
- Start with broad filters, then narrow down
- Check clinic hours before visiting
- Save directions for later

### For Doctors
- Add all your clinic locations
- Keep hours updated (especially holidays)
- Enable emergency only if you truly handle emergencies
- List all insurance providers you accept

---

## 🐛 Common Issues

**Location not working?**
→ Check browser permissions, enable GPS

**Distance not showing?**
→ Grant location permission, refresh page

**Clinic not appearing?**
→ Verify coordinates are valid, check hours are set

**Filters not working?**
→ Try removing some filters, refresh page

---

## 📊 What Gets Displayed

### Patient Sees
- Doctor name, specialty, experience
- Clinic name and address
- Distance from patient (e.g., "2.5km")
- Current status ("Open" or "Closed")
- Availability badges (Telemedicine, In-Person, Emergency)
- Insurance providers accepted
- Phone number
- "Get Directions" button

### Doctor Manages
- Clinic details (name, address, coordinates)
- Operating hours (per day of week)
- Availability settings (telemedicine, in-person, emergency)
- Insurance providers list
- Primary clinic flag

---

## ✅ Checklist

### Doctor Setup
- [ ] Add at least one clinic
- [ ] Set operating hours for all days
- [ ] Mark primary clinic
- [ ] Configure availability settings
- [ ] List insurance providers
- [ ] Test "Get Directions" yourself

### Patient Usage
- [ ] Grant location permission
- [ ] View doctor replies
- [ ] Try different filters
- [ ] Check clinic hours
- [ ] Use "Get Directions"
- [ ] Verify insurance accepted

---

## 📞 Need Help?

- Read full guide: `AREA_WISE_DOCTOR_REPLIES_USAGE_GUIDE.md`
- Technical details: `AREA_WISE_DOCTOR_REPLIES_IMPLEMENTATION.md`
- Feature summary: `FEATURE_COMPLETION_SUMMARY.md`

---

**Status:** ✅ Production Ready  
**Version:** 1.0.0  
**Last Updated:** February 24, 2026
