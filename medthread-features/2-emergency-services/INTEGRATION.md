# Emergency Services - Integration Guide

## Step 1: Install Dependencies

```bash
npm install leaflet react-leaflet axios
npm install --save-dev @types/leaflet
```

## Step 2: Add CSS Import

In your main CSS file or `main.tsx`:

```css
@import 'leaflet/dist/leaflet.css';
```

Or in your component:

```tsx
import 'leaflet/dist/leaflet.css';
```

## Step 3: Copy Files to Your Project

```
your-project/
├── src/
│   ├── features/
│   │   └── emergency-services/
│   │       ├── components/
│   │       │   ├── Emergency.tsx
│   │       │   ├── Map.tsx
│   │       │   ├── HospitalList.tsx
│   │       │   └── HospitalCard.tsx
│   │       ├── services/
│   │       │   ├── hospitalService.ts
│   │       │   └── emergencyDetector.ts
│   │       ├── config/
│   │       │   └── constants.ts
│   │       ├── hooks/
│   │       │   └── useTranslation.ts
│   │       └── types/
│   │           └── health.ts
```

## Step 4: Update Import Paths

Update all imports from `@/` to relative paths or your project's alias.

## Step 5: Add Emergency Route

```tsx
import { Emergency } from './features/emergency-services/components/Emergency';

<Routes>
  <Route path="/emergency" element={<Emergency />} />
</Routes>
```

## Usage Examples

### Basic Emergency Page

```tsx
import { Emergency } from '@/features/emergency-services/components/Emergency';

export function EmergencyPage() {
  return <Emergency />;
}
```

### Using Hospital Service Directly

```tsx
import { hospitalService } from '@/features/emergency-services/services/hospitalService';

// Find hospitals near coordinates
const hospitals = await hospitalService.findNearbyHospitals(
  19.0760, // latitude
  72.8777  // longitude
);

console.log(hospitals);
// [
//   {
//     id: 123,
//     name: 'City Hospital',
//     lat: 19.0800,
//     lng: 72.8800,
//     distance: 0.5,
//     phone: '+91-22-12345678',
//     address: '123 Main St',
//     emergency: true
//   }
// ]
```

### Standalone Map Component

```tsx
import { Map } from '@/features/emergency-services/components/Map';
import { useState } from 'react';

export function HospitalMap() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const userLocation = { lat: 19.0760, lng: 72.8777 };
  const hospitals = [/* your hospital data */];

  return (
    <div style={{ height: '400px' }}>
      <Map
        userLocation={userLocation}
        hospitals={hospitals}
        selectedHospitalId={selectedId}
        onSelectHospital={setSelectedId}
      />
    </div>
  );
}
```

### Hospital List Only

```tsx
import { HospitalList } from '@/features/emergency-services/components/HospitalList';

export function NearbyHospitals() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const hospitals = [/* your hospital data */];

  return (
    <HospitalList
      hospitals={hospitals}
      selectedHospitalId={selectedId}
      onSelectHospital={(hospital) => setSelectedId(hospital.id)}
      loading={false}
    />
  );
}
```

## Customization

### Change Default Location

Edit `Emergency.tsx`:

```typescript
const DEFAULT_LOCATION = { 
  lat: YOUR_LAT, 
  lng: YOUR_LNG 
};
```

### Modify Search Radius

Edit `services/hospitalService.ts`:

```typescript
// Change 50000 (50km) to your desired radius in meters
node["amenity"="hospital"](around:50000,${lat},${lng});
```

### Add More First Aid Topics

Edit `Emergency.tsx`:

```typescript
const firstAidSteps = [
  // ... existing topics
  {
    title: 'Your Topic',
    steps: ['Step 1', 'Step 2', 'Step 3']
  }
];
```

### Customize Map Markers

Edit `Map.tsx`:

```typescript
const CustomIcon = L.icon({
  iconUrl: 'path/to/your/icon.png',
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
```

### Change Emergency Number

Edit the call button in `Emergency.tsx`:

```tsx
onClick={() => handleCall('YOUR_NUMBER')}
```

## API Details

### Overpass API

The hospital service uses OpenStreetMap's Overpass API:
- **Endpoint**: `https://overpass-api.de/api/interpreter`
- **Rate Limit**: Fair use policy (don't spam)
- **Query Language**: Overpass QL
- **No API Key Required**

### Query Structure

```javascript
[out:json];
(
  node["amenity"="hospital"](around:50000,lat,lng);
  way["amenity"="hospital"](around:50000,lat,lng);
  node["amenity"="clinic"](around:50000,lat,lng);
);
out center;
```

## Troubleshooting

### Map Not Displaying

1. Check Leaflet CSS is imported
2. Ensure map container has explicit height:
```css
.map-container {
  height: 400px;
  width: 100%;
}
```

### No Hospitals Found

1. Check internet connection
2. Verify coordinates are valid
3. Try increasing search radius
4. Check browser console for API errors

### Location Not Working

1. Enable location permissions in browser
2. Use HTTPS (required for geolocation)
3. Check fallback to IP-based location
4. Verify default location is set

### Marker Icons Not Showing

1. Ensure Leaflet CSS is loaded
2. Check marker icon paths are correct
3. Import default icon fix from `Map.tsx`

## Performance Tips

1. **Cache Results**: Store hospital data in state/localStorage
```tsx
const [cachedHospitals, setCachedHospitals] = useState(() => {
  const cached = localStorage.getItem('hospitals');
  return cached ? JSON.parse(cached) : [];
});
```

2. **Debounce Location Updates**: Don't fetch on every location change
```tsx
const debouncedFetch = debounce(fetchHospitals, 1000);
```

3. **Limit Results**: Show only closest 10-20 hospitals
```tsx
const limitedHospitals = hospitals.slice(0, 20);
```

## Mobile Optimization

The Emergency page is mobile-optimized with:
- Touch-friendly buttons (min 44x44px)
- Responsive map height
- Scrollable hospital list
- Direct phone calling links
- Google Maps integration for directions

## Accessibility

- Keyboard navigation supported
- ARIA labels on interactive elements
- High contrast emergency button
- Screen reader friendly

## Security Notes

- No API keys required
- User location not stored on server
- Hospital data from public OpenStreetMap
- Phone numbers are public information

## Browser Compatibility

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (iOS 10+)
- Mobile browsers: Optimized for touch

## Legal Considerations

- OpenStreetMap data is © OpenStreetMap contributors
- Attribution required (included in map)
- Use under ODbL license
- Hospital data accuracy not guaranteed
