'use client';

import { useEffect, useState } from 'react';
import './loader-page.css';

const LOADING_MESSAGES = [
  'Initializing...',
  'Loading your health network...',
  'Fetching communities...',
  'Almost there...',
];

interface LoaderPageProps {
  onLoadComplete?: () => void;
  minimal?: boolean; // For use as overlay
}

export default function LoaderPage({ onLoadComplete, minimal = false }: LoaderPageProps) {
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

  return (
    <div
      className="loader-page"
      role="status"
      aria-label="MedThread is loading, please wait"
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
