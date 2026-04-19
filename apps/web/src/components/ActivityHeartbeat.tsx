'use client';

import { useActivityHeartbeat } from '@/hooks/useActivityHeartbeat';
import { useJWTAuth } from '@/context/JWTAuthContext';

/**
 * Component that sends periodic heartbeat pings to keep user activity fresh
 * Only active when user is authenticated
 */
export function ActivityHeartbeat() {
  const { user } = useJWTAuth();
  
  // Always call the hook, but it will handle the user check internally
  useActivityHeartbeat(user);
  
  return null; // This component doesn't render anything
}
