# MedThread UI Customization Guide

This guide will help you customize the MedThread design system and make your own style changes.

## 🎨 Design System Overview

The new design is inspired by modern dashboard aesthetics with:
- Warm cream/beige gradient backgrounds
- Charcoal dark elements for contrast
- Yellow/gold accents for highlights
- Soft shadows and rounded corners
- Smooth transitions and hover effects

## 📁 Key Files to Modify

### 1. **Global Styles** (`apps/web/src/app/globals.css`)
This is where you control the base styling for your entire app.

```css
body {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro', 'Inter', ...;
  background: linear-gradient(135deg, #F5F1E8 0%, #EDE7DB 100%);
  color: #2D2D2D;
}
```

**What you can change:**
- `background`: Change the gradient colors or use a solid color
- `font-family`: Add or change fonts
- `color`: Change the default text color

### 2. **Tailwind Config** (`apps/web/tailwind.config.ts`)
This defines your color palette and design tokens.

```typescript
colors: {
  cream: {
    50: '#FDFCFA',
    100: '#F5F1E8',
    200: '#EDE7DB',
  },
  yellow: {
    50: '#FFF9E6',
    100: '#FFF4D6',
    200: '#FFD166',
    300: '#FFC94D',
  },
  charcoal: {
    DEFAULT: '#2D2D2D',
    light: '#3A3A3A',
    dark: '#1F1F1F',
  },
  // ... more colors
}
```

**What you can change:**
- Add new color palettes
- Modify existing color values
- Add custom shadows, spacing, or border radius values

### 3. **Design System Documentation** (`docs/design-system.md`)
Reference document for your design decisions.

## 🔧 Common Customizations

### Change Background Color/Gradient

**Option 1: Solid Color**
```css
/* In globals.css */
body {
  background: #F5F5F5; /* Light gray */
}
```

**Option 2: Different Gradient**
```css
body {
  background: linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%); /* Blue gradient */
}
```

**Option 3: Image Background**
```css
body {
  background: url('/background-pattern.png');
  background-size: cover;
}
```

### Change Primary Accent Color

1. **Update Tailwind Config:**
```typescript
// Change yellow to blue
accent: {
  50: '#E3F2FD',
  100: '#BBDEFB',
  200: '#2196F3',
  300: '#1976D2',
}
```

2. **Update Components:**
Replace `yellow-200` with `accent-200` in your components:
```tsx
// Before
className="bg-yellow-200 hover:bg-yellow-300"

// After
className="bg-accent-200 hover:bg-accent-300"
```

### Change Card Styling

**Modify PostCard.tsx:**
```tsx
// Current
<div className="bg-white rounded-xl shadow-soft hover:shadow-elevated">

// More rounded
<div className="bg-white rounded-3xl shadow-soft hover:shadow-elevated">

// Different shadow
<div className="bg-white rounded-xl shadow-lg hover:shadow-2xl">

// Bordered instead of shadow
<div className="bg-white rounded-xl border-2 border-gray-200 hover:border-yellow-200">
```

### Change Button Styles

**Primary Button:**
```tsx
// Current charcoal button
className="bg-charcoal text-white rounded-full"

// Blue button
className="bg-blue-600 text-white rounded-full"

// Gradient button
className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full"

// Square corners
className="bg-charcoal text-white rounded-lg"
```

### Change Typography

**Update Font Family:**
```css
/* In globals.css */
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');

body {
  font-family: 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif;
}
```

**Adjust Font Sizes:**
```tsx
// In components, change text size classes
className="text-lg" // to text-xl, text-2xl, etc.
```

### Change Spacing

**Tighter Layout:**
```tsx
// In page.tsx
<div className="max-w-[1400px] mx-auto flex gap-4 pt-4 px-4">
```

**Wider Layout:**
```tsx
<div className="max-w-[1600px] mx-auto flex gap-8 pt-8 px-8">
```

## 🎯 Component-Specific Changes

### Navbar

**Location:** `apps/web/src/components/Navbar.tsx`

**Change navbar background:**
```tsx
// Solid white
<nav className="bg-white border-b">

// Transparent with blur
<nav className="bg-white/60 backdrop-blur-lg border-b">

// Dark navbar
<nav className="bg-charcoal text-white border-b border-gray-700">
```

### PostCard

**Location:** `apps/web/src/components/PostCard.tsx`

**Change hover effect:**
```tsx
// Current: scale + shadow
hover:shadow-elevated hover:scale-[1.01]

// Just shadow
hover:shadow-elevated

// Border highlight
hover:border-yellow-200 border-2

// Background change
hover:bg-cream-50
```

## 🌈 Pre-made Color Schemes

### Scheme 1: Ocean Blue
```typescript
// tailwind.config.ts
colors: {
  primary: {
    50: '#E3F2FD',
    100: '#BBDEFB',
    200: '#2196F3',
  },
  background: '#F0F4F8',
}
```
```css
/* globals.css */
body {
  background: linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%);
}
```

### Scheme 2: Forest Green
```typescript
colors: {
  primary: {
    50: '#E8F5E9',
    100: '#C8E6C9',
    200: '#4CAF50',
  },
  background: '#F1F8F4',
}
```
```css
body {
  background: linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%);
}
```

### Scheme 3: Sunset Orange
```typescript
colors: {
  primary: {
    50: '#FFF3E0',
    100: '#FFE0B2',
    200: '#FF9800',
  },
  background: '#FFF8F0',
}
```
```css
body {
  background: linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%);
}
```

### Scheme 4: Dark Mode
```typescript
colors: {
  primary: {
    50: '#424242',
    100: '#303030',
    200: '#FFD166',
  },
  background: '#1A1A1A',
}
```
```css
body {
  background: #1A1A1A;
  color: #FFFFFF;
}
```

## 🔄 Testing Your Changes

1. **Start the development server:**
```bash
cd apps/web
npm run dev
```

2. **Open your browser:**
Navigate to `http://localhost:3000`

3. **Hot reload:**
Changes to CSS and components will automatically refresh

4. **Clear cache if needed:**
- Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- Clear browser cache in DevTools

## 📱 Responsive Design

### Mobile Adjustments
```tsx
// Hide on mobile, show on desktop
className="hidden md:block"

// Different spacing on mobile
className="px-4 md:px-6 lg:px-8"

// Stack on mobile, row on desktop
className="flex flex-col md:flex-row"
```

### Breakpoints
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

## 🎨 Advanced Customizations

### Custom Animations
```css
/* In globals.css */
@keyframes slideIn {
  from {
    transform: translateY(-10px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.animate-slide-in {
  animation: slideIn 0.3s ease-out;
}
```

### Custom Shadows
```typescript
// In tailwind.config.ts
boxShadow: {
  'glow': '0 0 20px rgba(255, 209, 102, 0.5)',
  'inner-glow': 'inset 0 0 20px rgba(255, 209, 102, 0.3)',
}
```

### Glassmorphism Effect
```tsx
className="bg-white/30 backdrop-blur-xl border border-white/20"
```

## 🐛 Troubleshooting

### Changes not appearing?
1. Check if Tailwind is compiling: Look for errors in terminal
2. Restart dev server: `Ctrl+C` then `npm run dev`
3. Clear browser cache
4. Check class name spelling

### Colors not working?
1. Verify color is defined in `tailwind.config.ts`
2. Check if you're using the correct prefix (e.g., `bg-`, `text-`, `border-`)
3. Ensure Tailwind is scanning the correct files in `content` array

### Layout broken?
1. Check for missing closing tags
2. Verify flex/grid classes are correct
3. Use browser DevTools to inspect elements

## 📚 Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Tailwind Color Palette Generator](https://uicolors.app/create)
- [CSS Gradient Generator](https://cssgradient.io/)
- [Box Shadow Generator](https://shadows.brumm.af/)

## 💡 Tips

1. **Start small:** Change one thing at a time
2. **Use browser DevTools:** Experiment with styles before coding
3. **Keep backups:** Use git to commit before major changes
4. **Be consistent:** Use your design system colors throughout
5. **Test on mobile:** Always check responsive behavior

## 🎯 Quick Reference

### Most Common Classes
```tsx
// Backgrounds
bg-white, bg-cream-100, bg-charcoal

// Text
text-charcoal, text-gray-600, text-white

// Spacing
p-4, px-6, py-3, m-4, gap-4

// Borders
rounded-xl, rounded-full, border, border-2

// Shadows
shadow-soft, shadow-elevated

// Hover
hover:bg-yellow-100, hover:scale-105

// Transitions
transition, transition-all, duration-200
```

---

**Need help?** Check the design system documentation at `docs/design-system.md` or refer to component examples in `apps/web/src/components/`.
