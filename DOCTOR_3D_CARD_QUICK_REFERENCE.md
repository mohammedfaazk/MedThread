# 3D Doctor Identity Card - Quick Reference

## Component Usage

```tsx
import { DoctorIdentityCard3D } from '@/components/doctor/DoctorIdentityCard3D'

<DoctorIdentityCard3D 
  doctor={{
    id: "doctor-id",
    name: "Dr. John Smith",
    specialty: "Cardiology",
    clinic_name: "City Medical Center",
    yearsOfExperience: 15,
    profile_photo: "https://...",
    verification_status: "approved",
    role: "VERIFIED_DOCTOR"
  }}
/>
```

## Key Features at a Glance

### 🎨 Visual Effects
- **3D Tilt**: Hover anywhere on the card for interactive 3D rotation
- **Particles**: Floating blue particles appear on hover
- **Scan Line**: Animated vertical scan effect
- **Cyber Lines**: Horizontal animated lines
- **Glowing Corners**: Corner brackets that glow on hover
- **Rotating Ring**: Animated gradient ring around avatar

### 📱 Responsive Sizes
- **Desktop**: 300×380px
- **Mobile**: 280×355px
- **Active State**: Slightly smaller (press effect)

### 🎯 Data Fields
| Field | Source | Fallback |
|-------|--------|----------|
| Name | `name` / `username` / `full_name` | "Doctor" |
| Specialty | `specialty` / `specialization` | "Medical Professional" |
| Clinic | `clinic_name` / `hospitalAffiliation` | "Medical Center" |
| Experience | `yearsOfExperience` / `years_experience` | Hidden if 0 |
| Photo | `profile_photo` / `avatar` | Initials circle |
| Verified | `verification_status` === "approved" | Hidden if not verified |

### 🎨 Color Palette
```css
/* Primary */
--medthread-blue: #669ae3;
--dark-blue: #4a7fd4;
--light-blue: #8ab4ec;

/* Verified Badge */
--verified-green: #1ecb6b;

/* Text */
--text-light: #f3f6fa;
--text-meta: #8899b4;
```

## CSS Classes Reference

### Main Container
- `.doctor-id-container` - Outer wrapper (300×380px)
- `.doctor-id-canvas` - 5×5 grid for trackers
- `#doctor-id-card` - The actual card element

### Content Sections
- `.id-top` - Top row (avatar + badge)
- `.id-avatar-wrap` - Avatar container
- `.id-avatar` - Profile photo
- `.id-avatar-initials` - Fallback initials
- `.id-verified-ring` - Rotating ring
- `.id-badge` - Verified badge
- `.id-name` - Doctor name
- `.id-specialty` - Specialty text
- `.id-divider` - Horizontal line
- `.id-meta` - Hospital + experience
- `.id-meta-item` - Individual meta row
- `.id-watermark` - Bottom branding

### Effect Layers
- `.card-glare` - Shine effect
- `.cyber-lines` - Animated lines
- `.glowing-elements` - Hover glows
- `.card-particles` - Floating dots
- `.corner-elements` - Corner brackets
- `.scan-line` - Vertical scan

## Animation Keyframes

```css
@keyframes ringRotate {
  to { transform: rotate(360deg); }
}

@keyframes scanMove {
  0% { top: 0; }
  100% { top: 100%; }
}

@keyframes lineGrow {
  0%   { transform: scaleX(0); opacity: 0; }
  50%  { transform: scaleX(1); opacity: 1; }
  100% { transform: scaleX(0); opacity: 0; }
}

@keyframes particleFloat {
  0%, 100% { transform: translateY(0); opacity: 0.3; }
  50% { transform: translateY(-10px); opacity: 0.8; }
}
```

## 3D Tilt Positions

The card has 25 tracker zones (5×5 grid):

```
┌─────┬─────┬─────┬─────┬─────┐
│ -10 │  -5 │   0 │  +5 │ +10 │  ← rotateY
│ -10 │ -10 │ -10 │ -10 │ -10 │  ← rotateX
├─────┼─────┼─────┼─────┼─────┤
│ -10 │  -5 │   0 │  +5 │ +10 │
│  -5 │  -5 │  -5 │  -5 │  -5 │
├─────┼─────┼─────┼─────┼─────┤
│ -10 │  -5 │   0 │  +5 │ +10 │
│   0 │   0 │   0 │   0 │   0 │
├─────┼─────┼─────┼─────┼─────┤
│ -10 │  -5 │   0 │  +5 │ +10 │
│  +5 │  +5 │  +5 │  +5 │  +5 │
├─────┼─────┼─────┼─────┼─────┤
│ -10 │  -5 │   0 │  +5 │ +10 │
│ +10 │ +10 │ +10 │ +10 │ +10 │
└─────┴─────┴─────┴─────┴─────┘
```

## Accessibility Features

### ARIA
```tsx
<div 
  role="img"
  aria-label="Doctor profile card for Dr. John Smith, Cardiology at City Medical Center"
>
```

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  .id-verified-ring  { animation: none; }
  .scan-line         { animation: none; }
  .cyber-lines span  { animation: none; }
  .card-particles span { animation: none !important; }
  .doctor-id-container, #doctor-id-card { transition: none; }
}
```

## Integration Pattern

### Doctor Profile (Shows 3D Card)
```tsx
{(profileUser.role === 'VERIFIED_DOCTOR' || profileUser.role === 'DOCTOR') && (
  <div className="flex items-start gap-9 flex-wrap">
    <div className="flex-shrink-0">
      <DoctorIdentityCard3D doctor={doctorData} />
    </div>
    <div className="flex-1 min-w-[260px]">
      {/* Stats and actions */}
    </div>
  </div>
)}
```

### Patient Profile (Traditional Card)
```tsx
{profileUser.role === 'PATIENT' && (
  <div className="flex items-start gap-6">
    <div className="w-24 h-24 rounded-full">
      {/* Avatar */}
    </div>
    <div className="flex-1">
      {/* Info */}
    </div>
  </div>
)}
```

## Performance Tips

1. **GPU Acceleration**: Uses `transform` and `opacity` for smooth animations
2. **No Layout Thrashing**: All animations use CSS transforms
3. **Conditional Rendering**: Only renders for doctor profiles
4. **Lazy Effects**: Particles/glows only activate on hover
5. **Optimized Selectors**: Uses direct child selectors for performance

## Common Customizations

### Change Card Size
```css
.doctor-id-container {
  width: 350px;  /* Default: 300px */
  height: 445px; /* Default: 380px */
}
```

### Adjust Tilt Intensity
```css
.tr-1:hover ~ #doctor-id-card {
  transform: perspective(1000px) 
    rotateX(-15deg)  /* Default: -10deg */
    rotateY(-15deg); /* Default: -10deg */
}
```

### Change Theme Color
```css
/* Replace all instances of rgba(102, 154, 227, ...) */
/* With your custom color */
```

### Disable Specific Effects
```css
.scan-line { display: none; }
.cyber-lines { display: none; }
.card-particles { display: none; }
```

## Troubleshooting

### Card Not Showing
- Check if `profileUser.role` is 'VERIFIED_DOCTOR' or 'DOCTOR'
- Verify component import path
- Check CSS file is imported

### 3D Effect Not Working
- Ensure `.tracker` elements are rendered
- Check browser supports CSS transforms
- Verify z-index stacking

### Avatar Not Loading
- Check `profile_photo` URL is valid
- Verify fallback initials logic
- Check image CORS settings

### Animations Choppy
- Check GPU acceleration is enabled
- Reduce number of simultaneous animations
- Test on different devices

## Browser Support

| Browser | Version | Support |
|---------|---------|---------|
| Chrome | 90+ | ✅ Full |
| Firefox | 88+ | ✅ Full |
| Safari | 14+ | ✅ Full |
| Edge | 90+ | ✅ Full |
| Mobile Safari | 14+ | ✅ Full |
| Chrome Mobile | 90+ | ✅ Full |

---

**Component Location**: `apps/web/src/components/doctor/DoctorIdentityCard3D.tsx`
**Styles Location**: `apps/web/src/components/doctor/DoctorIdentityCard3D.css`
**Used In**: `apps/web/src/app/u/[username]/page.tsx`
