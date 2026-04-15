'use client';

import { useNavigationLoading } from '@/hooks/useNavigationLoading';
import { ReactNode } from 'react';

export function NavigationWrapper({ children }: { children: ReactNode }) {
  useNavigationLoading();
  return <>{children}</>;
}
