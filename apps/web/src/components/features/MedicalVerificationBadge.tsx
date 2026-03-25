'use client';

import React from 'react';

interface MedicalVerificationBadgeProps {
  isAccurate: boolean;
  confidenceScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  concerns?: string[];
}

export const MedicalVerificationBadge: React.FC<MedicalVerificationBadgeProps> = ({
  isAccurate,
  confidenceScore,
  riskLevel,
  concerns
}) => {
  const getRiskColor = () => {
    switch (riskLevel) {
      case 'CRITICAL': return 'bg-red-600';
      case 'HIGH': return 'bg-orange-600';
      case 'MEDIUM': return 'bg-yellow-600';
      case 'LOW': return 'bg-green-600';
    }
  };

  const getRiskIcon = () => {
    switch (riskLevel) {
      case 'CRITICAL': return '🚨';
      case 'HIGH': return '⚠️';
      case 'MEDIUM': return '⚡';
      case 'LOW': return '✓';
    }
  };

  return (
    <div className={`${getRiskColor()} text-white px-3 py-1 rounded-full text-sm flex items-center gap-2`}>
      <span>{getRiskIcon()}</span>
      <span>{riskLevel} Risk</span>
      <span className="text-xs opacity-75">({Math.round(confidenceScore)}%)</span>
      {concerns && concerns.length > 0 && (
        <div className="ml-2 text-xs">
          {concerns.slice(0, 2).join(', ')}
        </div>
      )}
    </div>
  );
};
