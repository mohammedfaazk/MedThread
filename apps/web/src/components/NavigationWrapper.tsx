'use client';

import { useNavigationLoading } from '@/hooks/useNavigationLoading';
import { useLoading } from '@/contexts/LoadingContext';
import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function NavigationWrapper({ children }: { children: ReactNode }) {
  useNavigationLoading();
  const { startLoading } = useLoading();
  const router = useRouter();

  useEffect(() => {
    // Intercept all link clicks globally
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      
      if (link && link.href) {
        const href = link.getAttribute('href');
        
        // Only trigger loading for internal navigation
        if (href && !href.startsWith('http') && !href.startsWith('#') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
          // Check if it's a Next.js Link (has data-nextjs attribute or is internal)
          const isNextLink = link.hasAttribute('data-nextjs') || link.hostname === window.location.hostname;
          
          if (isNextLink) {
            startLoading();
          }
        }
      }
    };

    // Handle browser back/forward buttons
    const handlePopState = () => {
      startLoading();
    };

    // Add click listener to document
    document.addEventListener('click', handleClick, true);
    
    // Add popstate listener for back/forward navigation
    window.addEventListener('popstate', handlePopState);

    return () => {
      document.removeEventListener('click', handleClick, true);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [startLoading]);

  return <>{children}</>;
}
