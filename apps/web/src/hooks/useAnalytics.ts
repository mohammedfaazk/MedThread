'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { analytics } from '@/lib/analytics';

/**
 * Hook to automatically track page views on route changes
 */
export function usePageTracking() {
  const pathname = usePathname();

  useEffect(() => {
    analytics.trackPageView(pathname);
  }, [pathname]);
}

/**
 * Hook to track component mount/unmount
 */
export function useComponentTracking(componentName: string) {
  useEffect(() => {
    analytics.trackEvent('component_mount', 'lifecycle', { componentName });

    return () => {
      analytics.trackEvent('component_unmount', 'lifecycle', { componentName });
    };
  }, [componentName]);
}

/**
 * Hook to track user engagement time
 */
export function useEngagementTracking(contentId: string, contentType: string) {
  useEffect(() => {
    const startTime = Date.now();

    return () => {
      const duration = Date.now() - startTime;
      analytics.trackEvent('engagement_time', 'engagement', {
        contentId,
        contentType,
        duration,
      });
    };
  }, [contentId, contentType]);
}
