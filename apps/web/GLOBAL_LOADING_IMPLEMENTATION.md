# Global Loading State Implementation

## Overview
The application now has a comprehensive global loading state that displays a full-screen loader whenever navigation occurs, providing visual feedback to users during page transitions.

## How It Works

### 1. Loading Context (`LoadingContext.tsx`)
- Provides global state management for loading status
- Exposes `isLoading`, `startLoading()`, and `stopLoading()` functions
- Wraps the entire application in `layout.tsx`

### 2. Loading Overlay (`LoadingOverlay.tsx`)
- Renders the full-screen `LoaderPage` component when `isLoading` is true
- Fixed position with z-index 9999 to appear above all content
- Automatically hidden when loading completes

### 3. Navigation Wrapper (`NavigationWrapper.tsx`)
- Intercepts ALL link clicks globally using event delegation
- Triggers loading for internal navigation (Next.js Links)
- Handles browser back/forward button navigation via `popstate` event
- Filters out external links, anchors, mailto, and tel links

### 4. Template (`template.tsx`)
- Stops loading when pathname changes (route has loaded)
- Prefetches common routes for faster navigation
- Manages body classes based on current route

### 5. Custom Router Hook (`useLoadingRouter.ts`)
- Wraps Next.js router to automatically trigger loading on programmatic navigation
- Use this hook instead of `useRouter()` for automatic loading states
- Supports `push()` and `replace()` methods

## Usage

### For Link-Based Navigation
No changes needed! All `<Link>` components automatically trigger loading:

```tsx
import Link from 'next/link';

<Link href="/dashboard">Go to Dashboard</Link>
```

### For Programmatic Navigation
Use `useLoadingRouter` instead of `useRouter`:

```tsx
// OLD WAY (no loading state)
import { useRouter } from 'next/navigation';
const router = useRouter();
router.push('/dashboard');

// NEW WAY (automatic loading state)
import { useLoadingRouter } from '@/hooks/useLoadingRouter';
const router = useLoadingRouter();
router.push('/dashboard'); // Loading overlay appears automatically!
```

### For Browser Back/Forward
Automatically handled! No code changes needed.

## What Triggers Loading

✅ Link clicks (Next.js `<Link>` components)
✅ Programmatic navigation with `useLoadingRouter`
✅ Browser back/forward buttons
✅ All internal route changes

❌ External links (http/https)
❌ Anchor links (#section)
❌ mailto: and tel: links
❌ Same-page navigation

## Files Modified

1. `apps/web/src/contexts/LoadingContext.tsx` - Loading state management
2. `apps/web/src/components/LoadingOverlay.tsx` - Overlay renderer
3. `apps/web/src/components/NavigationWrapper.tsx` - Global click interception + popstate
4. `apps/web/src/app/template.tsx` - Stop loading on route change
5. `apps/web/src/hooks/useLoadingRouter.ts` - NEW: Router wrapper for programmatic navigation
6. `apps/web/src/app/layout.tsx` - Already includes LoadingProvider and LoadingOverlay

## Migration Guide

To migrate existing `router.push()` calls to use loading states:

1. Find all files using `useRouter` from 'next/navigation'
2. Replace with `useLoadingRouter` from '@/hooks/useLoadingRouter'
3. No other changes needed!

Example:
```tsx
// Before
import { useRouter } from 'next/navigation';

function MyComponent() {
  const router = useRouter();
  
  const handleClick = () => {
    router.push('/dashboard');
  };
  
  return <button onClick={handleClick}>Go</button>;
}

// After
import { useLoadingRouter } from '@/hooks/useLoadingRouter';

function MyComponent() {
  const router = useLoadingRouter(); // Only change needed!
  
  const handleClick = () => {
    router.push('/dashboard'); // Now shows loading automatically
  };
  
  return <button onClick={handleClick}>Go</button>;
}
```

## Testing

To verify the loading state works:

1. Navigate between pages using links - loader should appear
2. Use browser back/forward buttons - loader should appear
3. Use programmatic navigation with `useLoadingRouter` - loader should appear
4. Check that loader disappears when new page loads
5. Verify external links don't trigger loading

## Performance Notes

- Loading state is lightweight (just a boolean flag)
- LoaderPage uses CSS animations (GPU accelerated)
- No impact on page load times
- Prefetching enabled for common routes
- Respects `prefers-reduced-motion` for accessibility
