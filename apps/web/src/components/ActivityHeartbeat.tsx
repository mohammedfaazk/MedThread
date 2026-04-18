'use client';

import { useActivityHeartbeat } from '@/hooks/useActivityHeartbeat';
import { useJWTAuth } from '@/context/JWTAuthContext';

/**
 * Component that sends periodic heartbeat pings to keep user activity fresh
 * Only active when user is authenticated
 */
export function ActivityHeartbeat() {
  const { user } = useJWTAuth();
  
  // Only send heartbeats if user is logged in
  if (user) {
    useActivityHeartbeat();
  }
  
  return null; // This component doesn't render anything
}
