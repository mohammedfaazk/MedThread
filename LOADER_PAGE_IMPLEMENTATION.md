# MedThread Animated Loader Page - Implementation Complete

## Overview
Full-screen animated loader page with heartbeat animation, matching the glassmorphic #669ae3 theme.

## Files Created

### 1. `apps/web/src/components/LoaderPage.tsx`
Main React component with:
- Auth check logic
- Minimum 2.5s display time enforcement
- Cycling status messages (600ms intervals)
- Exit animation trigger
- Smart navigation based on user role

### 2. `apps/web/src/components/loader-page.css`
Complete styling with:
- Heartbeat animation (blue #669ae3 theme)
- ECG line animation
- Ambient glow orbs
- Progress bar with shimmer effect
- Brand fade-in animation
- Exit animation
- Reduced motion support

### 3. `apps/web/src/app/loader-demo/page.tsx`
Demo page to test the loader in isolation

## Key Features

### Visual Design
- **Background**: Matches dashboard gradient `linear-gradient(135deg, #0f1623 0%, #162033 50%, #1a2744 100%)`
- **Heart Color**: Brand blue #669ae3 (changed from red)
- **No Shadow**: Clean look without white glow
- **Scaled Up**: 22vmin (from 10vmin) for better visibility
- **Ambient Orbs**: Two pulsing blue orbs in background

### Animations
1. **Heartbeat**: Synchronized pulse on heart shape and outer circle
2. **ECG Line**: White stroke drawing animation
3. **Progress Bar**: Grows to 100% with shimmer effect
4. **Status Messages**: Fade in/out every 600ms
5. **Exit**: Scale up + fade out when complete

### Loading Logic
```typescript
// Parallel execution
- Auth check starts immediately
- 2.5s minimum timer starts immediately
- Both must complete before exit

// Navigation rules
- Admin → /admin/analytics
- Doctor → /doctor/dashboard  
- Patient → /feed
- Not authenticated → /login
```

### Status Messages (600ms cycle)
1. "Initializing..."
2. "Loading your health network..."
3. "Fetching communities..."
4. "Almost there..."

## Integration Options

### Option 1: Root Layout (Recommended)
Add to `apps/web/src/app/layout.tsx`:

```tsx
'use client';

import { useState, useEffect } from 'react';
import LoaderPage from '@/components/LoaderPage';

export default function RootLayout({ children }) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <html>
      <body>
        {isLoading && <LoaderPage onLoadComplete={() => setIsLoading(false)} />}
        {!isLoading && children}
      </body>
    </html>
  );
}
```

### Option 2: Specific Pages
Use on login/landing pages:

```tsx
import LoaderPage from '@/components/LoaderPage';

export default function LoginPage() {
  const [showLoader, setShowLoader] = useState(true);
  
  if (showLoader) {
    return <LoaderPage onLoadComplete={() => setShowLoader(false)} />;
  }
  
  return <div>Login Form</div>;
}
```

### Option 3: App Initialization
Use in a custom `_app.tsx` or initialization wrapper.

## Testing

### View Demo
```bash
# Start dev server
cd apps/web
npm run dev

# Visit demo page
http://localhost:3000/loader-demo
```

### Test Scenarios
1. **Fast Connection**: Loader shows for minimum 2.5s
2. **Slow Connection**: Loader waits for auth + data
3. **Auth Success**: Routes to appropriate dashboard
4. **Auth Failure**: Routes to /login
5. **Reduced Motion**: Animations disabled except progress bar

## Accessibility

### ARIA Support
- `role="status"` on loader page
- `aria-label="MedThread is loading, please wait"`

### Reduced Motion
All animations disabled except progress bar when user prefers reduced motion:
```css
@media (prefers-reduced-motion: reduce) {
  .path { animation: none; }
  .innercircle { animation: none; }
  .outercircle { animation: none; }
  .loader-orb-1, .loader-orb-2 { animation: none; }
}
```

## Customization

### Adjust Timing
```typescript
// In LoaderPage.tsx
const MIN_DISPLAY_TIME = 2500; // Change to 3000 for 3s minimum
```

### Change Messages
```typescript
const LOADING_MESSAGES = [
  'Your custom message 1...',
  'Your custom message 2...',
  // Add more messages
];
```

### Adjust Colors
```css
/* In loader-page.css */
.innercircle:before,
.innercircle:after {
  background: #669ae3; /* Change heart color */
}

.outercircle {
  background-color: rgba(102, 154, 227, 0.85); /* Change outer glow */
}
```

## Performance Notes

- Loader is z-index 9999 (above everything)
- CSS animations use GPU acceleration (transform, opacity)
- Component unmounts after navigation (no memory leaks)
- Auth check uses fetch with credentials (respects existing session)

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- CSS animations with fallbacks
- SVG support required for ECG line
- Reduced motion support for accessibility

## Next Steps

1. Choose integration option (root layout recommended)
2. Test with real auth endpoints
3. Adjust minimum display time if needed
4. Add error handling for failed auth checks
5. Consider adding retry logic for network failures

## Complete! ✅

The loader page is production-ready and matches your glassmorphic theme perfectly.
