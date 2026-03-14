'use client';

import { AlertTriangle, TrendingUp, CheckCircle } from 'lucide-react';

interface PostPriorityBadgeProps {
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  urgencyScore?: number;
  detectedSymptoms?: Array<{
    symptom: string;
    weight: number;
    category: string;
  }>;
  showDetails?: boolean;
}

export function PostPriorityBadge({ 
  priority, 
  urgencyScore = 0, 
  detectedSymptoms = [],
  showDetails = false 
}: PostPriorityBadgeProps) {
  const getBadgeConfig = (priority: string) => {
    const configs = {
      HIGH: {
        emoji: '🔴',
        label: 'High',
        icon: AlertTriangle,
        bgColor: 'bg-red-100',
        textColor: 'text-red-800',
        borderColor: 'border-red-200',
        description: 'Requires immediate medical attention'
      },
      MEDIUM: {
        emoji: '🟡',
        label: 'Medium',
        icon: TrendingUp,
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-800',
        borderColor: 'border-yellow-200',
        description: 'Needs timely medical care'
      },
      LOW: {
        emoji: '🟢',
        label: 'Low',
        icon: CheckCircle,
        bgColor: 'bg-green-100',
        textColor: 'text-green-800',
        borderColor: 'border-green-200',
        description: 'General wellness or minor concern'
      }
    };
    return configs[priority as keyof typeof configs] || configs.LOW;
  };

  const config = getBadgeConfig(priority);
  const Icon = config.icon;

  if (!showDetails) {
    // Simple badge for feed display
    return (
      <div className={`
        inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold
        ${config.bgColor} ${config.textColor} ${config.borderColor} border
      `}>
        <span className="text-sm">{config.emoji}</span>
        <Icon className="w-3 h-3" />
        <span>{config.label}</span>
        {urgencyScore > 0 && (
          <span className="ml-1 opacity-75">({urgencyScore})</span>
        )}
      </div>
    );
  }

  // Detailed badge with symptoms
  return (
    <div className={`
      p-3 rounded-lg border-l-4 ${config.bgColor} ${config.borderColor}
    `}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{config.emoji}</span>
          <div>
            <div className="flex items-center gap-2">
              <Icon className={`w-4 h-4 ${config.textColor}`} />
              <span className={`font-semibold ${config.textColor}`}>
                {config.label} Priority
              </span>
              {urgencyScore > 0 && (
                <span className={`text-sm ${config.textColor} opacity-75`}>
                  Score: {urgencyScore}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {config.description}
            </p>
          </div>
        </div>
      </div>

      {detectedSymptoms.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-medium text-gray-700 mb-2">
            Detected Symptoms:
          </p>
          <div className="flex flex-wrap gap-1">
            {detectedSymptoms.slice(0, 5).map((symptom, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-white border border-gray-200"
              >
                {symptom.symptom}
                <span className="ml-1 text-gray-500">
                  ({symptom.weight})
                </span>
              </span>
            ))}
            {detectedSymptoms.length > 5 && (
              <span className="text-xs text-gray-500">
                +{detectedSymptoms.length - 5} more
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}