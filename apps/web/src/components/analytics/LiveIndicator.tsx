import React from 'react';

interface LiveIndicatorProps {
  isLive: boolean;
  className?: string;
}

export default function LiveIndicator({ isLive, className = '' }: LiveIndicatorProps) {
  if (!isLive) return null;

  return (
    <div className={`live-badge ${className}`} title="Live updates enabled">
      <div className="live-dot" />
      <span>Live</span>
    </div>
  );
}
