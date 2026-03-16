# Emergency Services

Emergency page with hospital locator, GPS navigation, first aid guide, and 108 emergency calling.

## Features

- 🚨 One-tap emergency call (108)
- 🗺️ Interactive map with nearby hospitals
- 📍 GPS location detection with IP fallback
- 🏥 Hospital list with distance, phone, directions
- 📚 First aid guide for common emergencies
- 🌐 OpenStreetMap integration via Overpass API
- 📱 Responsive design for mobile devices

## Components

- `Emergency.tsx` - Main emergency screen
- `Map.tsx` - Interactive Leaflet map
- `HospitalList.tsx` - List of nearby facilities
- `HospitalCard.tsx` - Individual hospital card with actions

## Services

- `hospitalService.ts` - Hospital search using Overpass API
- `emergencyDetector.ts` - Emergency protocol definitions

## Dependencies

```bash
npm install leaflet react-leaflet axios
npm install --save-dev @types/leaflet
```

## Integration Example

```tsx
import { Emergency } from './emergency-services/components/Emergency';

function App() {
  return (
    <Routes>
      <Route path="/emergency" element={<Emergency />} />
    </Routes>
  );
}
```

## CSS Requirements

Add to your main CSS file:
```css
@import 'leaflet/dist/leaflet.css';
```

## Features Breakdown

### 1. Emergency Call Button
- Animated ripple effect
- Direct tel: link to 108
- Prominent red design

### 2. Hospital Locator
- Uses Overpass API to find hospitals/clinics within 50km
- Calculates distance using Haversine formula
- Sorts by proximity
- Shows on interactive map

### 3. GPS Location
- Primary: Browser Geolocation API
- Fallback: IP-based location (ipapi.co)
- Default: Mumbai coordinates if both fail

### 4. First Aid Guide
- Expandable accordion for common emergencies
- Bleeding, Choking, Burns protocols
- Step-by-step instructions

## Customization

Edit `emergencyDetector.ts` to add more emergency protocols:
```typescript
const emergencyProtocols = {
  YOUR_EMERGENCY: {
    condition: 'Emergency Name',
    immediateActions: ['Step 1', 'Step 2'],
    callAmbulance: true,
    warningMessage: 'Warning text'
  }
}
```

## Map Markers

- Red marker: User location
- Blue markers: Hospitals
- Violet marker: Selected hospital

## API Usage

Uses free OpenStreetMap Overpass API - no API key required.
Rate limit: Be respectful, cache results when possible.
