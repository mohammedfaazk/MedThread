# 🎨 Glassmorphic Theme - Quick Reference Card

## 🚀 Quick Start

```bash
# Start servers
cd apps/api && npm run dev
cd apps/web && npm run dev

# Access admin panel
http://localhost:3000/admin/analytics
```

## 🎨 Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Primary Brand | `#669ae3` | Main theme color |
| Primary Dark | `#4a7fd4` | Darker accents |
| Primary Light | `#8ab4ec` | Lighter accents |
| Text Primary | `#f3f6fa` | Main text |
| Text Secondary | `#8899b4` | Muted text |
| Success | `#1ecb6b` | Positive actions |
| Warning | `#f5a623` | Warnings |
| Danger | `#ff4d6a` | Errors/logout |

## 📐 Key Measurements

| Element | Size |
|---------|------|
| Card Border Radius | 20px |
| Icon Badge | 32-40px |
| Nav Item Padding | 12px 16px |
| Sidebar Width | 280px |
| Header Height | 64px |
| Backdrop Blur | 20px |

## ⚡ Animation Timings

| Animation | Duration | Easing |
|-----------|----------|--------|
| Card Fade Up | 0.5s | cubic-bezier(0.34, 1.56, 0.64, 1) |
| Header Slide | 0.4s | cubic-bezier(0.34, 1.56, 0.64, 1) |
| Nav Fade In | 0.3s | ease-out |
| KPI Count Up | 1.2s | easeOutCubic |
| Live Pulse | 1.8s | infinite |
| Transitions | 0.2-0.3s | ease |

## 🎯 CSS Classes

### Layout
- `.dashboard-page` - Main page container
- `.dashboard-content` - Content wrapper
- `.ambient-orb-bottom` - Background orb

### Cards
- `.glass-card` - Glassmorphic card
- `.card-header` - Card header section
- `.card-icon` - Icon badge

### Admin Layout
- `.admin-header` - Top header bar
- `.admin-sidebar` - Side navigation
- `.admin-nav-item` - Navigation link
- `.admin-nav-item.active` - Active nav state
- `.admin-logo-badge` - Logo icon badge
- `.admin-logout-btn` - Logout button

### Components
- `.kpi-block` - KPI container
- `.kpi-value` - KPI number
- `.kpi-label` - KPI label
- `.live-badge` - Live indicator
- `.toast` - Toast notification
- `.chart-toggle-group` - Chart toggles
- `.filter-group` - Filter pills
- `.skeleton` - Loading skeleton

## 🎨 Common Patterns

### Glassmorphic Card
```css
background: rgba(255, 255, 255, 0.04);
backdrop-filter: blur(20px);
border: 1px solid rgba(102, 154, 227, 0.18);
border-radius: 20px;
```

### Gradient Text
```css
background: linear-gradient(90deg, #f3f6fa 0%, #669ae3 100%);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
```

### Hover Glow
```css
border-color: rgba(102, 154, 227, 0.45);
box-shadow: 0 0 40px rgba(102, 154, 227, 0.12);
transform: translateY(-2px);
```

### Icon Badge
```css
width: 32px;
height: 32px;
border-radius: 8px;
background: rgba(102, 154, 227, 0.1);
border: 1px solid rgba(102, 154, 227, 0.15);
```

## 📦 Component Props

### KPIBadge
```tsx
<KPIBadge
  value={1234}
  label="Total Users"
  format="number" // "number" | "percentage" | "currency"
  trend={{ direction: "up", percentage: 12.5 }}
/>
```

### LiveIndicator
```tsx
<LiveIndicator isLive={isConnected} />
```

### AnalyticsToast
```tsx
<AnalyticsToast
  message="New user registered"
  type="user:registered"
  onClose={() => {}}
  duration={4000}
/>
```

### MultiTypeChart
```tsx
<MultiTypeChart
  data={chartData}
  dataKey="value"
  xAxisKey="name"
  title="Chart Title"
  storageKey="unique-key"
  height={300}
  chartType="bar" // "bar" | "line" | "pie" | "doughnut" | "radar"
  multiSeries={[
    { key: "doctors", name: "Doctors", color: "#669ae3" },
    { key: "patients", name: "Patients", color: "#1ecb6b" }
  ]}
/>
```

## 🔧 Customization

### Change Primary Color
```css
/* In glassmorphic-analytics.css */
:root {
  --primary-brand: #YOUR_COLOR;
}
/* Update all rgba(102, 154, 227, ...) to your RGB */
```

### Adjust Blur
```css
.glass-card {
  backdrop-filter: blur(30px); /* Increase blur */
}
```

### Speed Up Animations
```css
.glass-card {
  animation-duration: 0.3s; /* Faster */
}
```

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| No glass effect | Check browser supports backdrop-filter |
| Animations not working | Check prefers-reduced-motion setting |
| Charts not loading | Verify API server is running |
| Toasts not appearing | Check WebSocket connection |
| Sidebar not visible | Check z-index and positioning |

## 📱 Responsive Breakpoints

| Breakpoint | Width | Layout |
|------------|-------|--------|
| Mobile | < 768px | Single column, hidden sidebar |
| Tablet | 768px - 1024px | 2 columns |
| Desktop | > 1024px | 2 columns, full sidebar |

## ♿ Accessibility

```css
/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## 📚 Documentation Files

1. `GLASSMORPHIC_ANALYTICS_IMPLEMENTATION.md` - Technical details
2. `GLASSMORPHIC_ANALYTICS_QUICK_START.md` - User guide
3. `GLASSMORPHIC_UI_COMPLETE.md` - Analytics summary
4. `GLASSMORPHIC_ADMIN_LAYOUT_COMPLETE.md` - Layout docs
5. `GLASSMORPHIC_THEME_COMPLETE_SUMMARY.md` - Overview
6. `GLASSMORPHIC_QUICK_REFERENCE.md` - This card

## 🎯 Key Files

```
apps/web/src/
├── styles/glassmorphic-analytics.css    # Main theme (500+ lines)
├── app/admin/layout.tsx                 # Admin layout
├── app/admin/analytics/page.tsx         # Analytics page
└── components/
    ├── analytics/KPIBadge.tsx
    ├── analytics/LiveIndicator.tsx
    ├── analytics/AnalyticsToast.tsx
    └── charts/MultiTypeChart.tsx
```

## ✅ Quick Checklist

- [ ] Servers running
- [ ] Logged in as admin
- [ ] Navigate to /admin/analytics
- [ ] See glassmorphic cards
- [ ] Cards animate on load
- [ ] KPI numbers count up
- [ ] Live indicator pulsing
- [ ] Charts toggle working
- [ ] Sidebar navigation works
- [ ] Header displays correctly
- [ ] Hover effects active
- [ ] Toasts appear on events

## 🎉 Success!

If all checklist items pass, your glassmorphic theme is working perfectly!

---

**Quick Reference v1.0** | MedThread Admin Panel | Glassmorphic Theme
