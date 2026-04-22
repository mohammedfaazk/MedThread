# Find Hospitals Feature - Real India Hospital Data ✅

## What Was Implemented

The Find Hospitals page now fetches REAL hospital data from OpenStreetMap for locations in India based on user's GPS location or pincode.

## Key Features

### 1. Real Hospital Data
- Fetches actual hospitals from OpenStreetMap Overpass API
- Shows real hospitals, clinics, and medical facilities in India
- Data includes: name, address, phone, distance, specialties
- Up to 50 nearest hospitals displayed, sorted by distance

### 2. Location Detection
- Automatically detects user's GPS location
- Falls back to Delhi if location access denied
- Shows user's position with blue marker on map

### 3. Pincode Search
- Enter any 6-digit Indian pincode
- Geocodes pincode to coordinates using Nominatim
- Fetches hospitals near that pincode
- Example: 560001 (Bangalore), 400001 (Mumbai), 110001 (Delhi)

### 4. Search Radius Control
- Choose radius: 2km, 5km, 10km, or 20km
- Larger radius = more hospitals
- Adjustable based on urban/rural area

### 5. Interactive Map
- Shows ALL found hospitals with markers
- Red markers = Emergency hospitals
- Green markers = Regular clinics/hospitals
- Blue marker = Your location
- Click markers for hospital details
- Auto-zooms to fit all hospitals

### 6. Filter by Name/Specialty
- Search bar filters results in real-time
- Filter by hospital name or specialty
- Works on already-loaded hospitals

### 7. Functional Buttons
- "Get Directions" → Opens Google Maps with route
- "Call Now" → Triggers phone call to hospital

## How It Works

1. **On Page Load:**
   - Requests user's GPS location
   - If granted: Fetches hospitals within 5km radius
   - If denied: Shows pincode search option

2. **Pincode Search:**
   - User enters 6-digit pincode
   - System geocodes pincode to lat/lng
   - Fetches hospitals within selected radius
   - Displays results on map and list

3. **Data Fetching:**
   - Uses Overpass API (OpenStreetMap data)
   - Queries for amenity=hospital and amenity=clinic
   - Calculates distance using Haversine formula
   - Sorts by nearest first

4. **Map Display:**
   - Leaflet map with OpenStreetMap tiles
   - Custom markers for hospitals and user
   - Popups show hospital details
   - Auto-fits bounds to show all results

## Example Usage

### Search by Current Location
1. Go to `/find-hospitals`
2. Allow location access
3. See nearby hospitals automatically

### Search by Pincode
1. Enter pincode: `560001` (Bangalore)
2. Select radius: `10 km`
3. Click "Search"
4. See all hospitals in that area

### Popular Pincodes to Try
- 560001 - Bangalore, Karnataka
- 400001 - Mumbai, Maharashtra  
- 110001 - Delhi
- 600001 - Chennai, Tamil Nadu
- 700001 - Kolkata, West Bengal
- 500001 - Hyderabad, Telangana

## Data Sources

- **Hospital Data:** OpenStreetMap Overpass API
- **Geocoding:** Nominatim (OSM)
- **Maps:** Leaflet + OpenStreetMap tiles
- **Coverage:** All of India

## Features

✅ Real hospital data from OpenStreetMap
✅ GPS location detection
✅ Pincode search for any Indian location
✅ Adjustable search radius (2-20km)
✅ Interactive map with markers
✅ Distance calculation
✅ Filter by name/specialty
✅ Get directions to hospital
✅ Call hospital directly
✅ Emergency vs regular hospital indicators
✅ Sorted by distance (nearest first)
✅ Shows up to 50 hospitals
✅ Loading states
✅ Error handling

## Technical Details

### APIs Used
1. **Overpass API** - Fetches hospital data
   - Endpoint: `https://overpass-api.de/api/interpreter`
   - Queries OSM database for hospitals/clinics
   - Free, no API key required

2. **Nominatim** - Geocodes pincodes
   - Endpoint: `https://nominatim.openstreetmap.org/search`
   - Converts pincode to coordinates
   - Free, no API key required

### Distance Calculation
- Uses Haversine formula
- Calculates great-circle distance
- Accurate for Earth's curvature
- Returns distance in kilometers

### Hospital Data Fields
- Name (from OSM tags)
- Address (constructed from addr:* tags)
- Phone (from phone or contact:phone tags)
- Emergency status (from emergency tag)
- Specialties (from healthcare:speciality tags)
- Coordinates (lat/lng)

## Files Modified

1. `apps/web/src/app/find-hospitals/page.tsx`
   - Added real-time hospital fetching
   - Implemented pincode search
   - Added radius selector
   - Integrated Overpass API
   - Added distance calculation
   - Implemented geocoding

2. `apps/web/src/components/HospitalMap.tsx`
   - Interactive Leaflet map
   - Custom markers
   - Popup information
   - Auto-bounds fitting

## Testing

1. **Test with GPS:**
   - Allow location access
   - Should show nearby hospitals automatically

2. **Test with Pincode:**
   - Enter: 560001
   - Radius: 10 km
   - Click Search
   - Should show Bangalore hospitals

3. **Test Filtering:**
   - Type hospital name in search
   - Results filter in real-time

4. **Test Map:**
   - Click hospital markers
   - See popup with details
   - Map should show all hospitals

5. **Test Buttons:**
   - Click "Get Directions" → Opens Google Maps
   - Click "Call Now" → Triggers phone call

## Notes

- OpenStreetMap data quality varies by region
- Urban areas have more complete data
- Some hospitals may not have phone numbers
- Address formatting depends on OSM data completeness
- Free APIs have rate limits (reasonable for normal use)
