'use client';

import { useLoading } from '@/contexts/LoadingContext';
import LoaderPage from './LoaderPage';

export function LoadingOverlay() {
  const { isLoading } = useLoading();

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[9999]">
      <LoaderPage onLoadComplete={() => {}} />
    </div>
  );
}
