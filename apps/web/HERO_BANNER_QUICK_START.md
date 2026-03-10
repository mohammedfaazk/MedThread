# Dashboard Hero Banner - Quick Start Guide

## 🚀 Quick Integration

### Add to Any Page

```tsx
import { DashboardHeroBanner } from '@/components/DashboardHeroBanner'
import { AnimatedBackground } from '@/components/AnimatedBackground'

export default function MyDashboard() {
  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />
      
      <main className="p-6">
        <DashboardHeroBanner 
          userName="John Doe"
          healthProgress={75}
          userRole="patient"
        />
        
        {/* Your existing content */}
      </main>
    </div>
  )
}
```

## 🎨 Customize Colors

### Hero Banner Colors
Edit `apps/web/src/components/DashboardHeroBanner.tsx`:

```tsx
// Background gradient
className="bg-gradient-to-br from-[#E6F4FF] via-white to-[#FFF4CC]"

// Button primary
className="bg-gradient-to-r from-blue-600 to-cyan-500"

// Button secondary
className="bg-white/80 backdrop-blur-sm text-blue-600"
```

### ECG Animation Colors
Edit `apps/web/src/components/ECGAnimation.tsx`:

```tsx
// ECG line color
ctx.strokeStyle = '#06B6D4'  // Cyan

// Grid color
ctx.strokeStyle = 'rgba(6, 182, 212, 0.08)'  // Light cyan

// Glow color
ctx.shadowColor = '#06B6D4'
```

## 🎭 Animation Speeds

### Slow Down Animations
```tsx
// In DashboardHeroBanner.tsx
transition={{ duration: 1.2 }}  // Slower (default: 0.6)

// In ECGAnimation.tsx
const speed = 1  // Slower (default: 2)

// In AnimatedBackground.tsx
transition={{ duration: 30 }}  // Slower (default: 20)
```

### Speed Up Animations
```tsx
// In DashboardHeroBanner.tsx
transition={{ duration: 0.3 }}  // Faster

// In ECGAnimation.tsx
const speed = 4  // Faster

// In AnimatedBackground.tsx
transition={{ duration: 10 }}  // Faster
```

## 📱 Disable Mobile Animations

```tsx
// Add to any animated component
const isMobile = window.innerWidth < 768

<motion.div
  initial={isMobile ? {} : { opacity: 0, y: 20 }}
  animate={isMobile ? {} : { opacity: 1, y: 0 }}
>
```

## 🎯 Custom Health Progress

```tsx
// Dynamic progress from API
const [progress, setProgress] = useState(0)

useEffect(() => {
  fetchHealthData().then(data => {
    setProgress(data.weeklyProgress)
  })
}, [])

<DashboardHeroBanner 
  userName={user.name}
  healthProgress={progress}  // 0-100
/>
```

## 🔧 Troubleshooting

### Animation Not Showing
1. Check Framer Motion is installed: `npm install framer-motion`
2. Verify imports are correct
3. Check browser console for errors

### ECG Not Rendering
1. Canvas might not be supported (very old browsers)
2. Check canvas ref is properly set
3. Verify useEffect cleanup is working

### Performance Issues
1. Reduce particle count in ECGAnimation
2. Increase animation durations (slower = less CPU)
3. Disable background animations on low-end devices

### Cards Not Animating
1. Ensure AnimatedCard wrapper is used
2. Check delay prop is set correctly
3. Verify Framer Motion is working

## 🎨 Pre-made Color Schemes

### Medical Blue Theme (Current)
```tsx
from-[#E6F4FF] via-white to-[#FFF4CC]
```

### Medical Green Theme
```tsx
from-[#E6FFF4] via-white to-[#F4FFCC]
```

### Medical Purple Theme
```tsx
from-[#F4E6FF] via-white to-[#FFE6F4]
```

### Dark Mode Theme
```tsx
from-gray-900 via-gray-800 to-gray-900
// Also update text colors to white/light
```

## 📊 Custom ECG Patterns

Edit the `ecgPattern` array in `ECGAnimation.tsx`:

```tsx
// Calm heartbeat (slower)
const ecgPattern = [
  0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5,
  0.5, 0.5, 0.52, 0.55, 0.5, 0.45, 0.5, 0.5, 0.5, 0.5,
  0.5, 0.48, 0.4, 0.5, 0.9, 0.5, 0.3, 0.5, 0.5, 0.5,
  // ... more baseline
]

// Excited heartbeat (faster, more spikes)
const ecgPattern = [
  0.5, 0.5, 0.52, 0.55, 0.5, 0.45, 0.5, 0.5,
  0.48, 0.4, 0.5, 0.9, 0.5, 0.3, 0.5, 0.5,
  0.5, 0.5, 0.52, 0.54, 0.52, 0.5, 0.5, 0.5,
  // ... repeat faster
]
```

## 🎬 Add Custom Animations

### Pulse Effect
```tsx
<motion.div
  animate={{
    scale: [1, 1.05, 1],
  }}
  transition={{
    duration: 2,
    repeat: Infinity,
  }}
>
  {/* Content */}
</motion.div>
```

### Slide In
```tsx
<motion.div
  initial={{ x: -100, opacity: 0 }}
  animate={{ x: 0, opacity: 1 }}
  transition={{ duration: 0.5 }}
>
  {/* Content */}
</motion.div>
```

### Rotate
```tsx
<motion.div
  animate={{ rotate: 360 }}
  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
>
  {/* Content */}
</motion.div>
```

## 🔗 Useful Links

- [Framer Motion Docs](https://www.framer.com/motion/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Lucide Icons](https://lucide.dev/)
- [Canvas API Docs](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)

## 💡 Pro Tips

1. **Stagger Delays**: Use 0.1-0.2s increments for smooth sequential animations
2. **Easing**: Use `[0.22, 1, 0.36, 1]` for smooth, natural motion
3. **Performance**: Keep animation durations under 1s for snappy feel
4. **Accessibility**: Always provide `prefers-reduced-motion` support
5. **Testing**: Test on actual mobile devices, not just browser resize

## 🎯 Common Customizations

### Change Button Actions
```tsx
// In DashboardHeroBanner.tsx
<motion.button
  onClick={() => router.push('/your-custom-route')}
>
  Your Custom Action
</motion.button>
```

### Add More Stats
```tsx
// Add to hero banner
<div className="flex items-center gap-3 p-4 bg-white/70 rounded-2xl">
  <YourIcon className="w-6 h-6" />
  <div>
    <p className="text-sm text-gray-600">Your Stat</p>
    <p className="text-lg font-bold">{yourValue}</p>
  </div>
</div>
```

### Custom Particles
```tsx
// In ECGAnimation.tsx, modify particle loop
{[...Array(12)].map((_, i) => (  // More particles
  <motion.div
    key={i}
    className="absolute w-2 h-2 bg-blue-400 rounded-full"  // Bigger
    animate={{
      y: [0, -150],  // Higher
      // ... custom animation
    }}
  />
))}
```

## 🎨 Design System Values

### Spacing
- Card padding: `p-6` (24px)
- Gap between cards: `gap-6` (24px)
- Border radius: `rounded-2xl` (16px) or `rounded-3xl` (24px)

### Shadows
- Default: `shadow-lg`
- Hover: `shadow-xl`
- Glow: `shadow-[0_0_20px_rgba(6,182,212,0.3)]`

### Transitions
- Fast: `0.2s`
- Normal: `0.5s`
- Slow: `1.5s`
- Background: `20s`

### Colors
- Primary Blue: `#06B6D4` (cyan-500)
- Light Blue: `#E6F4FF`
- Soft Yellow: `#FFF4CC`
- Success Green: `#10B981`
- Warning Orange: `#F59E0B`
- Error Red: `#EF4444`
