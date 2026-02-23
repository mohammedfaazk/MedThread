'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { analytics } from '@/lib/analytics';
import * as gtag from '@/lib/gtag';

export default function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
    
    // Track with custom analytics
    analytics.trackPageView(url);
    
    // Track with Google Analytics
    gtag.pageview(url);
  }, [pathname, searchParams]);

  return <>{children}</>;
}
