# Dashboard Hero Banner - Component Architecture

## 🏗️ Component Hierarchy

```
Dashboard Page (patient/page.tsx or doctor/page.tsx)
│
├── AnimatedBackground (Fixed position, -z-10)
│   ├── Gradient Layer (animated)
│   └── Floating Orbs (3x, independent motion)
│
├── NavbarEnhanced (Existing, unchanged)
│
├── Sidebar (Existing, unchanged)
│
└── Main Content
    │
    ├── DashboardHeroBanner ⭐ NEW
    │   ├── Container (gradient background)
    │   │   ├── Floating Background Elements
    │   │   │   ├── Blue Orb (animated)
    │   │   │   └── Yellow Orb (animated)
    │   │   │
    │   │   ├── Left Side (Content)
    │   │   │   ├── AI Badge (animated scale)
    │   │   │   ├── Welcome Title (gradient text)
    │   │   │   ├── Subtitle
    │   │   │   ├── Health Progress Card
    │   │   │   │   ├── Icon (gradient bg)
    │   │   │   │   ├── Label
    │   │   │   │   └── Progress Bar (animated width)
    │   │   │   │
    │   │   │   └── Action Buttons
    │   │   │       ├── Check Symptoms (primary, glow)
    │   │   │       └── Book Appointment (secondary)
    │   │   │
    │   │   └── Right Side (Animation)
    │   │       └── ECGAnimation
    │   │           ├── Background Glow
    │   │           ├── Canvas Container
    │   │           │   ├── Medical Grid (animated)
    │   │           │   ├── ECG Wave (canvas, 60fps)
    │   │           │   └── Glow Effects
    │   │           │
    │   │           ├── Floating Particles (6x)
    │   │           ├── Heart Icon (pulsing)
    │   │           ├── BPM Indicator
    │   │           └── Status Badge
    │   │
    │   └── (Responsive: stacks on mobile)
    │
    └── Dashboard Cards (Existing)
        ├── AnimatedCard (Diet Planner) ⭐ NEW WRAPPER
        ├── AnimatedCard (Symptom Checker) ⭐ NEW WRAPPER
        ├── AnimatedCard (Appointments) ⭐ NEW WRAPPER
        ├── AnimatedCard (Medications) ⭐ NEW WRAPPER
        └── AnimatedCard (Top Doctors) ⭐ NEW WRAPPER
```

## 📦 Component Details

### 1. AnimatedBackground
```
Purpose: Subtle animated gradient background
Position: Fixed, behind all content
Z-Index: -10
Performance: GPU-accelerated
```

**Structure**:
```tsx
<div className="fixed inset-0 -z-10">
  <motion.div> {/* Gradient */}
  <motion.div> {/* Orb 1 */}
  <motion.div> {/* Orb 2 */}
  <motion.div> {/* Orb 3 */}
</div>
```

### 2. DashboardHeroBanner
```
Purpose: Premium hero section with greeting and actions
Layout: Horizontal split (desktop), stacked (mobile)
Height: Auto (300-350px typical)
```

**Structure**:
```tsx
<motion.div className="hero-container">
  {/* Floating background elements */}
  <div className="grid lg:grid-cols-2">
    <div> {/* Left: Content */}
      <Badge />
      <Title />
      <Subtitle />
      <HealthProgress />
      <Buttons />
    </div>
    <div> {/* Right: ECG */}
      <ECGAnimation />
    </div>
  </div>
</motion.div>
```

### 3. ECGAnimation
```
Purpose: High-quality ECG heart rhythm visualization
Technology: HTML5 Canvas + Framer Motion
Performance: 60fps, requestAnimationFrame
```

**Structure**:
```tsx
<div className="relative">
  <div> {/* Background glow */}
  <div className="canvas-container">
    <canvas ref={canvasRef} />
    {/* Particles */}
    {/* Heart icon */}
    {/* BPM indicator */}
    {/* Status badge */}
  </div>
</div>
```

### 4. AnimatedCard
```
Purpose: Wrapper for staggered card animations
Effect: Fade-in + slide-up
Timing: Configurable delay
```

**Structure**:
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  whileHover={{ y: -4 }}
>
  {children}
</motion.div>
```

### 5. EnhancedSidebarAnimation
```
Purpose: Mobile sidebar animations (future use)
Features: Slide-in, stagger, backdrop blur
Status: Ready for implementation
```

**Structure**:
```tsx
<AnimatePresence>
  <motion.div> {/* Backdrop */}
  <motion.div> {/* Sidebar */}
    <CloseButton />
    <motion.div> {/* Staggered content */}
      {children}
    </motion.div>
  </motion.div>
</AnimatePresence>
```

## 🔄 Data Flow

```
User Data (from JWTAuthContext)
    ↓
Dashboard Page
    ↓
DashboardHeroBanner
    ├→ userName (display)
    ├→ healthProgress (0-100)
    └→ userRole ('patient' | 'doctor')
        ↓
    Render hero with animations
        ↓
    User interactions
        ├→ Check Symptoms → router.push('/symptom-checker')
        └→ Book Appointment → router.push('/appointments')
```

## 🎨 Animation Flow

```
Page Load (0.0s)
    ↓
AnimatedBackground fades in (0.1s)
    ↓
DashboardHeroBanner container appears (0.2s)
    ├→ Badge scales in (0.3s)
    ├→ Title fades in (0.4s)
    ├→ Progress bar animates (0.5-2.0s)
    ├→ Buttons appear (0.6s)
    └→ ECG starts (0.7s)
        ├→ Canvas draws wave (continuous)
        ├→ Particles float (continuous)
        └→ Heart pulses on spike (event-based)
    ↓
Cards animate in sequence
    ├→ Card 1 (0.8s, delay: 0.1s)
    ├→ Card 2 (0.9s, delay: 0.2s)
    ├→ Card 3 (1.0s, delay: 0.3s)
    ├→ Card 4 (1.1s, delay: 0.4s)
    └→ Card 5 (1.2s, delay: 0.5s)
    ↓
All animations complete (1.2s)
Background continues (infinite)
ECG continues (infinite)
```

## 🎯 Event Handling

```
User Interactions
│
├── Hover Button
│   └→ Scale up (1.02x)
│   └→ Lift up (-2px)
│   └→ Show glow
│
├── Click Button
│   └→ Scale down (0.98x)
│   └→ Ripple effect
│   └→ Navigate to route
│
├── Hover Card
│   └→ Lift up (-4px)
│   └→ Increase shadow
│
└── ECG Spike Detected
    └→ Trigger heart pulse
    └→ Scale heart (1.3x)
    └→ Red glow effect
```

## 📊 State Management

```
Dashboard Page State
│
├── User State (from JWTAuthContext)
│   ├── user.username
│   ├── user.email
│   └── role
│
├── Appointments State
│   ├── appointments[]
│   ├── fetching
│   └── totalAppointments
│
├── Medications State
│   └── todayMedications[]
│
└── Doctors State
    └── doctors[]

DashboardHeroBanner (Props)
│
├── userName (string)
├── healthProgress (number)
└── userRole (string)

ECGAnimation (Internal State)
│
├── canvasRef (ref)
├── heartbeat (boolean)
└── animationId (number)
```

## 🔌 Integration Points

```
Existing Dashboard
│
├── NavbarEnhanced ✓ Unchanged
├── Sidebar ✓ Unchanged
│
├── NEW: AnimatedBackground
│   └→ Adds visual interest
│
├── REPLACED: Static Welcome
│   └→ DashboardHeroBanner
│       └→ ECGAnimation
│
└── WRAPPED: Dashboard Cards
    └→ AnimatedCard
        └→ Existing card content ✓ Unchanged
```

## 🎨 Styling Architecture

```
Tailwind Classes
│
├── Layout
│   ├── flex, grid
│   ├── gap-6, p-6
│   └── max-w-[1440px]
│
├── Colors
│   ├── from-[#E6F4FF]
│   ├── to-[#FFF4CC]
│   └── text-blue-600
│
├── Effects
│   ├── backdrop-blur-xl
│   ├── shadow-lg
│   └── rounded-3xl
│
└── Responsive
    ├── lg:grid-cols-2
    ├── md:text-5xl
    └── sm:flex-col

Framer Motion
│
├── Variants
│   ├── containerVariants
│   ├── itemVariants
│   └── buttonVariants
│
├── Animations
│   ├── initial
│   ├── animate
│   └── whileHover
│
└── Transitions
    ├── duration
    ├── ease
    └── delay
```

## 🔧 Performance Architecture

```
Optimization Strategy
│
├── Canvas Rendering
│   ├── requestAnimationFrame (60fps)
│   ├── Device pixel ratio support
│   └── Proper cleanup on unmount
│
├── Framer Motion
│   ├── Hardware acceleration (transform, opacity)
│   ├── will-change hints
│   └── GPU-accelerated properties
│
├── React Optimization
│   ├── useRef for canvas
│   ├── useEffect cleanup
│   └── Minimal re-renders
│
└── CSS Optimization
    ├── backdrop-filter (GPU)
    ├── transform (GPU)
    └── Fixed positioning
```

## 📱 Responsive Architecture

```
Breakpoints
│
├── Mobile (<768px)
│   ├── Hero: Stacked vertical
│   ├── ECG: Below content
│   ├── Buttons: Full width
│   └── Cards: Single column
│
├── Tablet (768px-1023px)
│   ├── Hero: Adjusted layout
│   ├── ECG: Reduced height
│   └── Cards: 2 columns
│
└── Desktop (1024px+)
    ├── Hero: Horizontal split
    ├── ECG: Full size right
    └── Cards: 3 columns
```

## 🎯 Component Responsibilities

| Component | Responsibility | Dependencies |
|-----------|---------------|--------------|
| AnimatedBackground | Visual atmosphere | Framer Motion |
| DashboardHeroBanner | Hero section layout | ECGAnimation, Router |
| ECGAnimation | ECG visualization | Canvas API, Framer Motion |
| AnimatedCard | Card animations | Framer Motion |
| EnhancedSidebarAnimation | Sidebar animations | Framer Motion |

## 🔄 Lifecycle

```
Component Mount
    ↓
Initialize state
    ↓
Start animations
    ├→ Framer Motion (automatic)
    └→ Canvas (useEffect)
        ↓
    Render loop (60fps)
        ↓
    User interactions
        ↓
Component Unmount
    ↓
Cleanup
    ├→ Cancel animation frame
    ├→ Remove event listeners
    └→ Clear timers
```

## 🎨 Design System

```
Spacing Scale
├── xs: 0.5rem (8px)
├── sm: 0.75rem (12px)
├── md: 1rem (16px)
├── lg: 1.5rem (24px)
└── xl: 2rem (32px)

Border Radius
├── lg: 0.5rem (8px)
├── xl: 0.75rem (12px)
├── 2xl: 1rem (16px)
└── 3xl: 1.5rem (24px)

Shadow Scale
├── sm: subtle
├── md: default
├── lg: elevated
└── xl: floating

Animation Duration
├── fast: 0.2s
├── normal: 0.5s
├── slow: 1.5s
└── background: 20s
```

This architecture ensures:
- ✅ Clean separation of concerns
- ✅ Reusable components
- ✅ Maintainable code
- ✅ Optimal performance
- ✅ Scalable design
