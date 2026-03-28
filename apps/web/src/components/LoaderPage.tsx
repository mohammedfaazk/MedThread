'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import './loader-page.css';

const LOADING_MESSAGES = [
  'Initializing...',
  'Loading your health network...',
  'Fetching communities...',
  'Almost there...',
];

const MIN_DISPLAY_TIME = 2500;

interface LoaderPageProps {
  onLoadComplete?: () => void;
}

export default function LoaderPage({ onLoadComplete }: LoaderPageProps) {
  const router = useRouter();
  const [authDone, setAuthDone] = useState(false);
  const [minTimeDone, setMinTimeDone] = useState(false);
  const [isDismissing, setIsDismissing] = useState(false);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [statusKey, setStatusKey] = useState(0);

  // Cycle through loading messages
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
      setStatusKey((prev) => prev + 1);
    }, 600);

    return () => clearInterval(interval);
  }, []);

  // Minimum display time
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinTimeDone(true);
    }, MIN_DISPLAY_TIME);

    return () => clearTimeout(timer);
  }, []);

  // Auth check
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include',
        });
        
        if (response.ok) {
          const data = await response.json();
          setAuthDone(true);
        } else {
          setAuthDone(true);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setAuthDone(true);
      }
    };

    checkAuth();
  }, []);

  // Trigger exit when both conditions met
  useEffect(() => {
    if (authDone && minTimeDone && !isDismissing) {
      setIsDismissing(true);
    }
  }, [authDone, minTimeDone, isDismissing]);

  // Handle navigation after exit animation
  const handleAnimationEnd = async () => {
    if (isDismissing) {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include',
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.user?.role === 'admin') {
            router.push('/admin/analytics');
          } else if (data.user?.role === 'doctor') {
            router.push('/doctor/dashboard');
          } else {
            router.push('/feed');
          }
        } else {
          router.push('/login');
        }
      } catch (error) {
        router.push('/login');
      }
      
      if (onLoadComplete) {
        onLoadComplete();
      }
    }
  };

  return (
    <div
      className={`loader-page ${isDismissing ? 'dismissing' : ''}`}
      role="status"
      aria-label="MedThread is loading, please wait"
      onAnimationEnd={handleAnimationEnd}
    >
      {/* Ambient glow orbs */}
      <div className="loader-orb-1" />
      <div className="loader-orb-2" />

      {/* Heartbeat loader */}
      <div className="heartbeatloader">
        <svg
          className="svgdraw"
          width="100%"
          height="100%"
          viewBox="0 0 150 400"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            className="path"
            d="M 0 200 l 40 0 l 5 -40 l 5 40 l 10 0 l 5 15 l 10 -140 l 10 220 l 5 -95 l 10 0 l 5 20 l 5 -20 l 30 0"
            fill="transparent"
            strokeWidth="4"
            stroke="black"
          />
        </svg>
        <div className="innercircle" />
        <div className="outercircle" />
      </div>

      {/* Brand and status */}
      <div className="loader-brand">
        <span className="loader-app-name">MedThread</span>
        <span className="loader-tagline">Connecting patients with verified doctors</span>
        <span key={statusKey} className="loader-status">
          {LOADING_MESSAGES[currentMessageIndex]}
        </span>
      </div>

      {/* Progress bar */}
      <div className="loader-progress-track">
        <div className="loader-progress-fill" />
      </div>
    </div>
  );
}
