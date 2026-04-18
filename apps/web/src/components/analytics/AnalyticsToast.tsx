'use client';

import React, { useEffect, useState } from 'react';

interface AnalyticsToastProps {
  message: string;
  type: 'user:registered' | 'user:active' | 'user:inactive' | 'post:created' | 'appointment:booked' | 'report:filed' | 'community:activity';
  onClose: () => void;
  duration?: number;
}

export default function AnalyticsToast({ 
  message, 
  type, 
  onClose, 
  duration = 4000 
}: AnalyticsToastProps) {
  const [isDismissing, setIsDismissing] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsDismissing(true);
      setTimeout(onClose, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'user:registered':
      case 'user:active':
        return '👤';
      case 'user:inactive':
        return '⚫';
      case 'post:created':
        return '📝';
      case 'appointment:booked':
        return '📅';
      case 'report:filed':
        return '⚠️';
      case 'community:activity':
        return '💬';
      default:
        return '📊';
    }
  };

  const getIconClass = () => {
    switch (type) {
      case 'user:registered':
      case 'user:active':
        return 'toast-icon success';
      case 'post:created':
        return 'toast-icon';
      case 'appointment:booked':
        return 'toast-icon';
      case 'report:filed':
        return 'toast-icon warning';
      default:
        return 'toast-icon';
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'user:registered':
        return 'New User Registered';
      case 'user:active':
        return 'User Active';
      case 'post:created':
        return 'New Post Created';
      case 'appointment:booked':
        return 'Appointment Booked';
      case 'report:filed':
        return 'Report Filed';
      case 'community:activity':
        return 'Community Activity';
      default:
        return 'Update';
    }
  };

  return (
    <div className={`toast ${isDismissing ? 'dismissing' : ''}`}>
      <div className={getIconClass()}>
        {getIcon()}
      </div>
      <div className="flex-1">
        <div className="toast-title">{getTitle()}</div>
        <div className="toast-sub">{message}</div>
      </div>
      <button
        onClick={() => {
          setIsDismissing(true);
          setTimeout(onClose, 300);
        }}
        className="text-gray-400 hover:text-gray-200 transition-colors ml-2"
        aria-label="Close notification"
      >
        ✕
      </button>
    </div>
  );
}
