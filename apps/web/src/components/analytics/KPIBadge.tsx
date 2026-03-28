'use client';

import React, { useEffect, useRef, useState } from 'react';

interface KPIBadgeProps {
  value: number | string;
  label: string;
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    percentage?: number;
  };
  format?: 'number' | 'percentage' | 'currency';
  className?: string;
}

export default function KPIBadge({ 
  value, 
  label, 
  trend, 
  format = 'number',
  className = '' 
}: KPIBadgeProps) {
  const [displayValue, setDisplayValue] = useState<number>(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const prevValueRef = useRef<number>(0);

  const numericValue = typeof value === 'string' ? parseFloat(value) || 0 : value;

  useEffect(() => {
    if (typeof value === 'number') {
      const start = prevValueRef.current;
      const end = value;
      const duration = 1200;
      const startTime = Date.now();

      setIsAnimating(true);

      const animate = () => {
        const now = Date.now();
        const progress = Math.min((now - startTime) / duration, 1);
        
        // easeOutCubic
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        const current = start + (end - start) * easeProgress;
        
        setDisplayValue(current);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setIsAnimating(false);
          prevValueRef.current = end;
        }
      };

      animate();
    }
  }, [value]);

  const formatValue = (val: number | string) => {
    if (typeof val === 'string') return val;
    
    switch (format) {
      case 'percentage':
        return `${val.toFixed(1)}%`;
      case 'currency':
        return `₹${Math.round(val).toLocaleString()}`;
      default:
        return Math.round(val).toLocaleString();
    }
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    switch (trend.direction) {
      case 'up':
        return '↑';
      case 'down':
        return '↓';
      default:
        return '→';
    }
  };

  return (
    <div className={`kpi-block ${className}`}>
      <span className="kpi-label">{label}</span>
      <div className="flex items-baseline gap-2">
        <span className="kpi-value">
          {formatValue(typeof value === 'number' ? displayValue : value)}
        </span>
        {trend && trend.percentage !== undefined && (
          <span className={trend.direction === 'up' ? 'kpi-trend-up' : 'kpi-trend-down'}>
            {getTrendIcon()} {trend.percentage.toFixed(1)}%
          </span>
        )}
      </div>
    </div>
  );
}
