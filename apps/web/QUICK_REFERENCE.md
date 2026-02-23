# Mobile-First PWA - Quick Reference

## 🚀 Common Tasks

### Add Pull-to-Refresh to a Page
```typescript
import { usePullToRefresh } from '@/hooks/usePullToRefresh'
import { PullToRefreshIndicator } from '@/components/PullToRefreshIndicator'

const { pullDistance, isRefreshing } = usePullToRefresh({
  onRefresh: async () => {
    await fetchData()
  }
})

return (
  <>
    <PullToRefreshIndicator pullDistance={pullDistance} threshold={80} isRefreshing={isRefreshing} />
    {/* Your content */}
  </>
)
```

### Add Swipe Gestures
```typescript
import { useSwipeGesture } from '@/hooks/useSwipeGesture'

const swipeHandlers = useSwipeGesture({
  onSwipeLeft: () => navigate('next'),
  onSwipeRight: () => navigate('prev'),
  threshold: 50
})

return <div {...swipeHandlers}>Swipeable content</div>
```

### Add Haptic Feedback
```typescript
import { useTouchFeedback } from '@/hooks/useTouchFeedback'

const { lightTap, success, error } = useTouchFeedback()

const handleClick = () => {
  lightTap()
  // Your action
}
```

### Add Loading State
```typescript
import { LoadingSpinner } from '@/components/LoadingSpinner'

{isLoading && <LoadingSpinner size="md" message="Loading..." />}
```

### Add Skeleton Loader
```typescript
import { SkeletonLoader, PostCardSkeleton } from '@/components/SkeletonLoader'

{isLoading ? <PostCardSkeleton /> : <PostCard post={post} />}
```

### Optimize Images
```typescript
import { OptimizedImage } from '@/components/OptimizedImage'

<OptimizedImage
  src="/image.jpg"
  alt="Description"
  width={400}
  height={300}
  priority={false}
/>
```

### Use Responsive Container
```typescript
import { ResponsiveContainer } from '@/components/ResponsiveContainer'

<ResponsiveContainer mobilePadding>
  {/* Your content */}
</ResponsiveContainer>
```

### Check Online Status
```typescript
import { useOnlineStatus } from '@/hooks/useOnlineStatus'

const isOnline = useOnlineStatus()

{!isOnline && <OfflineIndicator />}
```

### Get Accurate Viewport Height
```typescript
import { useViewportHeight } from '@/hooks/useViewportHeight'

const height = useViewportHeight()

<div style={{ height: `${height}px` }}>Full height content</div>
```

## 🎨 CSS Utilities

### Touch-Friendly
```html
<button class="touch-target">Button</button>
<!-- Ensures 44x44px minimum -->
```

### Safe Areas
```html
<div class="safe-top safe-bottom">Content</div>
<!-- Respects notch/home indicator -->
```

### Scrolling
```html
<div class="momentum-scroll scrollbar-hide">Scrollable</div>
<!-- Smooth iOS scrolling, hidden scrollbar -->
```

### Dynamic Height
```html
<div class="h-screen-dynamic">Full screen</div>
<!-- Accounts for mobile browser UI -->
```

### Text Selection
```html
<div class="no-select">UI Element</div>
<div class="select-text">Selectable text</div>
```

## 📱 PWA Management

### Initialize PWA
```typescript
import { pwaManager } from '@/lib/pwaManager'

await pwaManager.initialize()
```

### Check if Installed
```typescript
const isInstalled = pwaManager.isInstalled()
```

### Update Service Worker
```typescript
await pwaManager.update()
```

### Clear Caches
```typescript
await pwaManager.clearCaches()
```

### Get Cache Size
```typescript
const size = await pwaManager.getCacheSize()
```

## 🔔 Push Notifications

### Subscribe
```typescript
import { subscribeToPushNotifications, sendSubscriptionToBackend } from '@/lib/pushNotifications'

const subscription = await subscribeToPushNotifications(VAPID_KEY)
await sendSubscriptionToBackend(subscription, authToken)
```

### Unsubscribe
```typescript
import { unsubscribeFromPushNotifications, removeSubscriptionFromBackend } from '@/lib/pushNotifications'

await unsubscribeFromPushNotifications()
await removeSubscriptionFromBackend(authToken)
```

### Check Permission
```typescript
import { getNotificationPermission } from '@/lib/pushNotifications'

const permission = getNotificationPermission()
// 'granted', 'denied', or 'default'
```

### Test Notification
```typescript
import { showTestNotification } from '@/lib/pushNotifications'

await showTestNotification()
```

## 🎯 Responsive Design

### Breakpoints
```typescript
// Tailwind breakpoints
sm: 640px   // Small tablets
md: 768px   // Tablets
lg: 1024px  // Laptops
xl: 1280px  // Desktops
2xl: 1536px // Large desktops
```

### Hide on Mobile
```html
<div class="hidden md:block">Desktop only</div>
```

### Show on Mobile
```html
<div class="block md:hidden">Mobile only</div>
```

### Responsive Padding
```html
<div class="px-4 md:px-6 lg:px-8">Responsive padding</div>
```

## 🔧 Debugging

### Check Service Worker
```javascript
// Console
navigator.serviceWorker.getRegistration().then(reg => console.log(reg))
```

### Check Caches
```javascript
// Console
caches.keys().then(keys => console.log(keys))
```

### Check Push Subscription
```javascript
// Console
navigator.serviceWorker.ready.then(reg => 
  reg.pushManager.getSubscription().then(sub => console.log(sub))
)
```

### Force Service Worker Update
```javascript
// Console
navigator.serviceWorker.getRegistration().then(reg => reg.update())
```

### Clear All Caches
```javascript
// Console
caches.keys().then(keys => 
  Promise.all(keys.map(key => caches.delete(key)))
)
```

## 📊 Performance

### Measure Web Vitals
```typescript
export function reportWebVitals(metric: any) {
  console.log(metric)
  // Send to analytics
}
```

### Lazy Load Component
```typescript
import dynamic from 'next/dynamic'

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <LoadingSpinner />,
  ssr: false
})
```

### Prefetch Route
```typescript
import { useRouter } from 'next/navigation'

const router = useRouter()
router.prefetch('/next-page')
```

## 🎨 Animations

### Smooth Transitions
```css
.smooth-transition {
  transition: all 0.3s ease-out;
}
```

### Hardware Acceleration
```css
.accelerated {
  transform: translateZ(0);
  will-change: transform;
}
```

### Fade In
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.fade-in {
  animation: fadeIn 0.3s ease-out;
}
```

## 🔐 Security

### Content Security Policy
```typescript
// next.config.js
headers: [
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline';"
  }
]
```

### HTTPS Only
```typescript
// Redirect HTTP to HTTPS
if (window.location.protocol !== 'https:') {
  window.location.href = 'https:' + window.location.href.substring(window.location.protocol.length)
}
```

## 📱 Device Detection

### Check Mobile
```typescript
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
```

### Check iOS
```typescript
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
```

### Check Android
```typescript
const isAndroid = /Android/.test(navigator.userAgent)
```

### Check Standalone Mode
```typescript
const isStandalone = window.matchMedia('(display-mode: standalone)').matches
```

## 🎯 Common Patterns

### Infinite Scroll
```typescript
const handleScroll = () => {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
    loadMore()
  }
}

useEffect(() => {
  window.addEventListener('scroll', handleScroll)
  return () => window.removeEventListener('scroll', handleScroll)
}, [])
```

### Debounced Search
```typescript
import { useState, useEffect } from 'react'

const [query, setQuery] = useState('')
const [debouncedQuery, setDebouncedQuery] = useState('')

useEffect(() => {
  const timer = setTimeout(() => setDebouncedQuery(query), 300)
  return () => clearTimeout(timer)
}, [query])

useEffect(() => {
  if (debouncedQuery) search(debouncedQuery)
}, [debouncedQuery])
```

### Modal with Lock Scroll
```typescript
useEffect(() => {
  if (isOpen) {
    document.body.style.overflow = 'hidden'
  }
  return () => {
    document.body.style.overflow = 'unset'
  }
}, [isOpen])
```

## 🚀 Deployment

### Build
```bash
npm run build
```

### Test Production Build
```bash
npm run start
```

### Lighthouse Audit
```bash
npx lighthouse http://localhost:3000 --view
```

### Deploy to Vercel
```bash
vercel --prod
```

## 📚 Resources

- [Next.js Docs](https://nextjs.org/docs)
- [PWA Guide](https://web.dev/progressive-web-apps/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Web Vitals](https://web.dev/vitals/)
