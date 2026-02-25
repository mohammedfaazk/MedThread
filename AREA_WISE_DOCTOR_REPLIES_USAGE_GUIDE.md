# Area-Wise Doctor Replies - Usage Guide

## 🎯 Overview

This feature allows patients to view doctor replies organized by geographic location with distance-based sorting, availability indicators, and comprehensive filtering options.

## 👥 For Patients

### Viewing Doctor Replies

1. **Navigate to a Post**
   - Open any post where doctors have replied
   - The system will automatically detect doctor replies

2. **Grant Location Permission (Optional)**
   - When prompted, click "Allow" to share your location
   - This enables distance-based sorting and radius filtering
   - If denied, doctors will be sorted alphabetically

3. **View Doctor Information**
   Each doctor reply shows:
   - Doctor's name, specialty, and years of experience
   - Verification badge (if verified)
   - Reply content and timestamp
   - Clinic name and address
   - Distance from you (if location granted)
   - Current clinic status (Open/Closed)
   - Availability badges:
     - 🟢 Telemedicine Available
     - 🔵 In-Person Consultation
     - 🔴 Emergency Available (animated)
   - Insurance providers accepted
   - Phone number
   - "Get Directions" button

4. **Apply Filters**
   Use the filter panel to narrow down results:
   
   **Distance Filter** (requires location permission)
   - Within 1 km
   - Within 5 km
   - Within 10 km
   - Within 25 km
   - Within 50 km
   
   **Consultation Type**
   - ☑️ Telemedicine Available
   - ☑️ In-Person Only
   
   **Availability**
   - ☑️ Emergency Available
   
   **Insurance**
   - Enter your insurance provider name
   - System will show only doctors accepting that insurance

5. **Get Directions**
   - Click "Get Directions" button on any clinic
   - Opens Google Maps with route to clinic
   - Works on both desktop and mobile

### Example Workflow

```
1. User opens post: "Need advice on persistent headache"
2. Sees 15 doctor replies
3. Grants location permission
4. Doctors automatically sorted by distance
5. Applies filters:
   - Within 10 km
   - Emergency Available
   - Insurance: Blue Cross
6. Sees 3 matching doctors
7. Clicks "Get Directions" for nearest doctor
8. Navigates to clinic
```

## 👨‍⚕️ For Doctors

### Setting Up Your Clinic

1. **Navigate to Clinic Management**
   - Go to your doctor dashboard
   - Click "Clinic Management" or similar menu item

2. **Add Your First Clinic**
   - Click "Add Clinic" button
   - Fill in required information:
     - Clinic Name *
     - Address *
     - City *
     - Country *
     - State (optional)
     - Phone (optional)
     - Latitude * (use "Use my current location" button)
     - Longitude *
   
3. **Set Clinic Hours**
   For each day of the week:
   - Check the box if clinic is open
   - Set opening time (e.g., 09:00)
   - Set closing time (e.g., 17:00)
   - Uncheck if closed that day

4. **Mark as Primary**
   - Check "Set as primary clinic" for your main location
   - This clinic will be shown first in your replies
   - Only one clinic can be primary

5. **Save Clinic**
   - Click "Add Clinic"
   - Clinic is now visible to patients

### Setting Availability

1. **Configure Consultation Types**
   - ☑️ Telemedicine Available - Check if you offer video/phone consultations
   - ☑️ In-Person Consultation Available - Check if you see patients at clinic
   - ☑️ Emergency Availability - Check if you handle urgent cases

2. **Specify Insurance**
   - Enter insurance providers you accept (comma-separated)
   - Example: "Blue Cross, Aetna, United Healthcare"
   - OR check "Accept All Major Insurance"

3. **Save Settings**
   - Click "Save Availability"
   - Changes take effect immediately

### Managing Multiple Clinics

You can add up to 5 clinic locations:

1. **Add Additional Clinics**
   - Click "Add Clinic" again
   - Fill in details for second location
   - Set different hours if needed

2. **Primary Clinic**
   - Only one clinic can be marked as primary
   - Primary clinic shows first in your replies
   - To change primary, edit clinic settings

3. **View All Clinics**
   - All your clinics are listed in the dashboard
   - Each shows:
     - Clinic name and address
     - Primary badge (if applicable)
     - Operating hours
     - Edit/Delete buttons

### Best Practices

1. **Keep Information Updated**
   - Update hours for holidays
   - Mark emergency availability accurately
   - Keep phone number current

2. **Accurate Location**
   - Use precise coordinates for best results
   - Patients rely on distance calculations
   - Test "Get Directions" yourself

3. **Insurance Information**
   - List all accepted insurance providers
   - Update when you add new providers
   - Be specific (e.g., "Blue Cross Blue Shield PPO")

4. **Availability Flags**
   - Only enable emergency if you truly handle emergencies
   - Update telemedicine status if you start/stop offering it
   - Disable in-person if temporarily closed

## 🔧 Technical Details

### API Endpoints

#### Get Doctor Replies with Location
```http
GET /api/posts/:postId/replies/doctors
```

**Query Parameters:**
- `lat` (optional): Patient latitude
- `lng` (optional): Patient longitude
- `radius` (optional): Filter radius in km (1, 5, 10, 25, 50)
- `telemedicine` (optional): Filter for telemedicine (true/false)
- `inPersonOnly` (optional): Filter for in-person only (true/false)
- `emergency` (optional): Filter for emergency availability (true/false)
- `insurance` (optional): Filter by insurance provider name
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 20, max: 50)

**Response:**
```json
{
  "success": true,
  "data": {
    "replies": [
      {
        "id": "reply-123",
        "content": "Based on your symptoms...",
        "createdAt": "2026-02-24T10:30:00Z",
        "upvotes": 15,
        "score": 15,
        "doctor": {
          "id": "doctor-456",
          "username": "dr_smith",
          "specialty": "Cardiology",
          "yearsOfExperience": 10,
          "clinic": {
            "id": 1,
            "name": "City Medical Center",
            "address": "123 Main St",
            "city": "Mumbai",
            "latitude": 19.0760,
            "longitude": 72.8777,
            "phone": "+91-22-12345678",
            "distance": {
              "km": 2.5,
              "formatted": "2.5km"
            }
          },
          "availability": {
            "telemedicineAvailable": true,
            "inPersonAvailable": true,
            "emergencyAvailable": false,
            "insuranceAccepted": ["Blue Cross", "Aetna"],
            "acceptsAllInsurance": false
          },
          "clinicStatus": {
            "isOpen": true,
            "opensAt": "09:00",
            "closesAt": "17:00"
          }
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 15,
      "totalPages": 1
    }
  }
}
```

#### Create Clinic
```http
POST /api/doctors/clinics
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "clinicName": "City Medical Center",
  "address": "123 Main St",
  "city": "Mumbai",
  "state": "Maharashtra",
  "country": "India",
  "postalCode": "400001",
  "latitude": 19.0760,
  "longitude": 72.8777,
  "phone": "+91-22-12345678",
  "isPrimary": true,
  "hours": [
    {
      "dayOfWeek": 1,
      "openTime": "09:00",
      "closeTime": "17:00",
      "isClosed": false
    },
    {
      "dayOfWeek": 2,
      "openTime": "09:00",
      "closeTime": "17:00",
      "isClosed": false
    }
    // ... for all 7 days (0=Sunday, 6=Saturday)
  ]
}
```

#### Update Availability
```http
PUT /api/doctors/availability
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "telemedicineAvailable": true,
  "inPersonAvailable": true,
  "emergencyAvailable": false,
  "insuranceAccepted": ["Blue Cross", "Aetna", "United Healthcare"],
  "acceptsAllInsurance": false
}
```

#### Get Doctor's Clinics
```http
GET /api/doctors/clinics
Authorization: Bearer <token>
```

### Frontend Components

#### AreaWiseDoctorReplies
```tsx
import AreaWiseDoctorReplies from '@/components/AreaWiseDoctorReplies';

<AreaWiseDoctorReplies postId="post-123" />
```

#### DoctorClinicManagement
```tsx
import DoctorClinicManagement from '@/components/DoctorClinicManagement';

<DoctorClinicManagement />
```

## 🔒 Privacy & Security

### Patient Privacy
- Location data is only used for distance calculation
- Precise coordinates are never stored without consent
- Location permission can be denied - feature still works
- No tracking of patient location history

### Doctor Privacy
- Clinic addresses are public (necessary for patients to visit)
- Personal home addresses should NOT be used
- Only clinic/office locations should be added
- Phone numbers are optional

### Data Security
- All API endpoints require authentication for modifications
- Role-based access control (only doctors can add clinics)
- Input validation on all coordinates
- SQL injection prevention
- Rate limiting on API calls

## 📱 Mobile Usage

### For Patients
- Responsive design works on all screen sizes
- Native geolocation uses device GPS
- "Get Directions" opens native maps app
- Touch-friendly filter controls
- Optimized for mobile data usage

### For Doctors
- Full clinic management on mobile
- Geolocation button for easy coordinate entry
- Mobile-friendly forms
- Touch-optimized time pickers

## 🐛 Troubleshooting

### Location Not Working
**Problem:** "Location access denied" message
**Solution:**
1. Check browser location permissions
2. Enable location services on device
3. Try refreshing the page
4. Feature still works without location (alphabetical sorting)

### Distance Not Showing
**Problem:** No distance displayed on doctor replies
**Solution:**
1. Grant location permission
2. Ensure GPS is enabled
3. Check if doctor has added clinic location
4. Refresh the page

### Clinic Not Appearing
**Problem:** Added clinic but not showing in replies
**Solution:**
1. Verify clinic was saved successfully
2. Check if coordinates are valid
3. Ensure clinic has operating hours set
4. Try logging out and back in

### Filters Not Working
**Problem:** Filters don't change results
**Solution:**
1. Check if any doctors match filter criteria
2. Try removing some filters
3. Verify location permission for radius filter
4. Refresh the page

## 📊 Analytics & Insights

### For Platform Admins
Track these metrics:
- Location permission grant rate
- Most used filters
- Average distance to selected doctors
- Conversion rate (view → directions → appointment)
- Popular clinic locations
- Peak usage times

### For Doctors
Monitor:
- Reply views by location
- Distance of patients viewing your replies
- Filter combinations used to find you
- Directions requests to your clinic
- Insurance filter matches

## 🎓 Tips & Best Practices

### For Patients
1. **Grant Location Permission** - Get the most relevant results
2. **Use Filters Wisely** - Start broad, then narrow down
3. **Check Clinic Hours** - Verify they're open before visiting
4. **Save Directions** - Bookmark or save route for later
5. **Verify Insurance** - Call clinic to confirm before visit

### For Doctors
1. **Complete Your Profile** - Add all clinic locations
2. **Keep Hours Updated** - Especially for holidays
3. **Be Accurate** - Patients rely on your information
4. **Respond Promptly** - Higher visibility for active doctors
5. **Update Availability** - Reflect current consultation options

## 🚀 Future Enhancements

Planned features:
- Direct appointment booking from replies
- Real-time availability updates
- Waiting time estimates
- Multi-language support
- Doctor ratings by location
- Route optimization
- Integration with calendar systems
- Push notifications for nearby doctors

## 📞 Support

For issues or questions:
- Check this guide first
- Review troubleshooting section
- Contact platform support
- Report bugs through feedback form

---

**Version:** 1.0.0  
**Last Updated:** February 24, 2026  
**Status:** Production Ready ✅
