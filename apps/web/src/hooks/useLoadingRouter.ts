'use client';

import { useRouter } from 'next/navigation';
import { useLoading } from '@/contexts/LoadingContext';
import { useCallback } from 'react';

/**
 * Custom router hook that automatically triggers loading state
 * for programmatic navigation (router.push, router.replace, etc.)
 */
export function useLoadingRouter() {
  const router = useRouter();
  const { startLoading } = useLoading();

  const push = useCallback((href: string, options?: any) => {
    startLoading();
    router.push(href, options);
  }, [router, startLoading]);

  const replace = useCallback((href: string, options?: any) => {
    startLoading();
    router.replace(href, options);
  }, [router, startLoading]);

  return {
    ...router,
    push,
    replace,
  };
}
