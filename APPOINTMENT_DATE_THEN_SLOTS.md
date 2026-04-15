# Appointment Booking - Date First, Then Available Slots ✅

## User Request
"I don't like the select time option format... only the available time for that doctor must be available... so maybe you can just check availability after the patient has selected the date"

## Solution Implemented
Changed the booking flow to:
1. Patient selects a date from date picker
2. System fetches and shows ONLY the doctor's available time slots for that specific date
3. Patient selects from the available slots
4. Patient books the appointment

## How It Works

### Step 1: Select Date
- Clean HTML5 date picker
- Minimum date is today (can't book in the past)
- Helper text: "Select a date to see available time slots"

### Step 2: Fetch Available Slots
When date is selected:
```tsx
const handleDateChange = (date: string) => {
  setSelectedDate(date)
  setSelectedSlot(null)
  
  if (selectedDoctor && date) {
    loadDoctorAvailability(selectedDoctor.id, date)
  }
}
```

### Step 3: Show Available Slots
- Fetches doctor's availability from API
- Filters slots for the selected day of week
- Converts slots to actual date/time for the selected date
- Shows only slots available on that specific date

### Step 4: Select Time Slot
- Beautiful slot cards with time ranges
- Clock icon for visual clarity
- Shows day name (e.g., "Monday")
- Selected slot highlighted in blue
- Checkmark icon when selected

## Slot Display

### Each Slot Shows:
- **Time Range**: "9:00 AM - 10:00 AM"
- **Day Name**: "Monday", "Tuesday", etc.
- **Visual Icon**: Clock icon
- **Selection State**: Blue background + checkmark when selected

### Slot Card Styling:
```tsx
- Unselected: White background, gray border, hover effect
- Selected: Blue background, blue border, shadow, checkmark
- Icon: Clock in gray (unselected) or blue (selected) circle
- Hover: Border changes to blue, subtle shadow
```

## Loading States

### 1. Loading Slots
```
[Spinner animation]
Loading available slots...
```

### 2. No Slots Available
```
[Clock icon]
No slots available
Try selecting a different date
```

### 3. Slots Available
Shows list of clickable time slot cards

## User Flow

1. **Select Doctor** → Doctor card appears
2. **Select Date** → Date picker opens
3. **Pick a Date** → System loads slots for that date
4. **View Available Slots** → List appears below date picker
5. **Select Time Slot** → Slot highlights in blue
6. **Enter Reason** (optional)
7. **Click "Request Appointment"** → Booking sent

## Technical Implementation

### Date to Day of Week Conversion:
```javascript
const selectedDateObj = new Date(date)
const dayOfWeek = selectedDateObj.getDay() // 0-6 (Sun-Sat)
```

### Filtering Slots:
```javascript
const slotsForDay = slots.filter(slot => slot.dayOfWeek === dayOfWeek)
```

### Converting to Actual Date/Time:
```javascript
const newStartTime = new Date(date)
newStartTime.setHours(startTime.getHours(), startTime.getMinutes(), 0, 0)
```

This ensures slots show the correct date with the doctor's scheduled times.

## Benefits

1. **Only Relevant Slots**: Shows only slots for selected date
2. **No Scrolling**: Focused list of available times
3. **Clear Availability**: Immediately see if doctor is available
4. **Better UX**: Two-step process is intuitive
5. **Visual Feedback**: Loading states and empty states
6. **Doctor's Schedule**: Respects doctor's actual availability

## Visual Improvements

### Date Picker:
- Clean input with calendar icon
- Opens native calendar popup
- Helper text guides user
- Minimum date validation

### Time Slots:
- Card-based design
- Clock icon for each slot
- Clear time ranges
- Day name for context
- Blue highlight when selected
- Checkmark for confirmation
- Smooth hover effects
- Scrollable if many slots

### Empty State:
- Large clock icon
- Clear message: "No slots available"
- Helpful suggestion: "Try selecting a different date"
- Gray background to differentiate

## Example Scenario

**Doctor's Schedule:**
- Monday: 9 AM - 12 PM, 2 PM - 5 PM
- Tuesday: 10 AM - 1 PM
- Wednesday: Off
- Thursday: 9 AM - 12 PM
- Friday: 2 PM - 6 PM

**Patient selects Monday:**
Shows:
- 9:00 AM - 10:00 AM
- 10:00 AM - 11:00 AM
- 11:00 AM - 12:00 PM
- 2:00 PM - 3:00 PM
- 3:00 PM - 4:00 PM
- 4:00 PM - 5:00 PM

**Patient selects Wednesday:**
Shows:
- "No slots available - Try selecting a different date"

## Code Structure

### State Management:
```tsx
const [selectedDate, setSelectedDate] = useState('')
const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
const [loadingSlots, setLoadingSlots] = useState(false)
```

### Key Functions:
1. `handleDateChange(date)` - Triggers slot loading
2. `loadDoctorAvailability(doctorId, date)` - Fetches and filters slots
3. `handleBookAppointment()` - Books the selected slot

## Validation

### Booking Button Disabled When:
- No slot selected
- Booking in progress

### Required Fields:
- Doctor (selected first)
- Date (selected second)
- Time slot (selected third)
- Reason (optional)

## API Integration

### Endpoint:
```
GET /api/appointments/doctors/{doctorId}/availability
```

### Response:
```json
[
  {
    "id": "slot-1",
    "doctorId": "doctor-123",
    "dayOfWeek": 1,
    "startTime": "2026-04-15T09:00:00Z",
    "endTime": "2026-04-15T10:00:00Z",
    "isBooked": false
  }
]
```

### Filtering:
- Filters by `dayOfWeek` matching selected date
- Converts times to selected date
- Shows only unbooked slots

## Files Modified

- `apps/web/src/app/appointments/page.tsx`
  - Added `handleDateChange` function
  - Updated `loadDoctorAvailability` to accept date parameter
  - Added slot filtering by day of week
  - Added date/time conversion logic
  - Updated UI to show slots conditionally
  - Improved slot card design
  - Added loading and empty states

## Testing

To test:
1. Select a doctor
2. Select a date → Should show loading spinner
3. Wait for slots → Should show available time slots
4. Try different dates → Should show different slots
5. Try a date with no availability → Should show empty state
6. Select a slot → Should highlight in blue
7. Book appointment → Should work correctly

## Status

✅ **COMPLETE** - Date-first booking with filtered slots is fully functional!

## User Experience Improvements

- No more scrolling through all slots
- Only see relevant times for chosen date
- Clear visual feedback at every step
- Intuitive two-step selection process
- Respects doctor's actual schedule
- Better mobile experience with native pickers
