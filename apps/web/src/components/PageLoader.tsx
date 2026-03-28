'use client';

import './loader-page.css';

interface PageLoaderProps {
  message?: string;
}

export default function PageLoader({ message = 'Loading...' }: PageLoaderProps) {
  return (
    <div className="loader-page" role="status" aria-label={message}>
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
        <span className="loader-status">{message}</span>
      </div>
    </div>
  );
}
