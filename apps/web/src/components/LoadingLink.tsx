'use client';

import Link from 'next/link';
import { useLoading } from '@/contexts/LoadingContext';
import { ComponentProps, MouseEvent } from 'react';

type LoadingLinkProps = ComponentProps<typeof Link>;

export function LoadingLink({ onClick, ...props }: LoadingLinkProps) {
  const { startLoading } = useLoading();

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    // Don't trigger loading for external links or same-page anchors
    const href = props.href.toString();
    if (href.startsWith('http') || href.startsWith('#')) {
      onClick?.(e);
      return;
    }

    // Trigger loading state
    startLoading();
    
    // Call original onClick if provided
    onClick?.(e);
  };

  return <Link {...props} onClick={handleClick} />;
}
