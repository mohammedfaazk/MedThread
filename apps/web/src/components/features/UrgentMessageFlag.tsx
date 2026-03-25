'use client';

import { useState } from 'react';
import { AlertCircle, Flag } from 'lucide-react';

interface UrgentMessageFlagProps {
  onToggle: (isUrgent: boolean, level: 'low' | 'medium' | 'high' | 'critical') => void;
  initialUrgent?: boolean;
  initialLevel?: 'low' | 'medium' | 'high' | 'critical';
}

export default function UrgentMessageFlag({
  onToggle,
  initialUrgent = false,
  initialLevel = 'medium'
}: UrgentMessageFlagProps) {
  const [isUrgent, setIsUrgent] = useState(initialUrgent);
  const [showLevelSelector, setShowLevelSelector] = useState(false);
  const [urgencyLevel, setUrgencyLevel] = useState(initialLevel);

  const urgencyLevels = [
    { value: 'low' as const, label: 'Low', color: 'bg-yellow-500 text-white hover:bg-yellow-600' },
    { value: 'medium' as const, label: 'Medium', color: 'bg-orange-500 text-white hover:bg-orange-600' },
    { value: 'high' as const, label: 'High', color: 'bg-red-500 text-white hover:bg-red-600' },
    { value: 'critical' as const, label: 'Critical', color: 'bg-red-700 text-white hover:bg-red-800' }
  ];

  const handleToggle = () => {
    if (!isUrgent) {
      setShowLevelSelector(true);
    } else {
      setIsUrgent(false);
      setShowLevelSelector(false);
      onToggle(false, urgencyLevel);
    }
  };

  const handleLevelSelect = (level: 'low' | 'medium' | 'high' | 'critical') => {
    setUrgencyLevel(level);
    setIsUrgent(true);
    setShowLevelSelector(false);
    onToggle(true, level);
  };

  const currentLevel = urgencyLevels.find(l => l.value === urgencyLevel);

  return (
    <div className="relative">
      {/* Toggle Button */}
      <button
        onClick={handleToggle}
        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
          isUrgent
            ? `${currentLevel?.color} border border-current`
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
        }`}
        title={isUrgent ? 'Remove urgent flag' : 'Mark as urgent'}
      >
        {isUrgent ? (
          <>
            <AlertCircle className="w-4 h-4" />
            Urgent ({currentLevel?.label})
          </>
        ) : (
          <>
            <Flag className="w-4 h-4" />
            Mark Urgent
          </>
        )}
      </button>

      {/* Level Selector */}
      {showLevelSelector && (
        <div className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 p-2 min-w-[180px]">
          <p className="text-xs font-medium text-gray-700 mb-2 px-2">Select urgency level:</p>
          {urgencyLevels.map(level => (
            <button
              key={level.value}
              onClick={() => handleLevelSelect(level.value)}
              className={`w-full text-left px-3 py-2 text-sm rounded transition-colors ${level.color} mb-1 font-medium`}
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {level.label}
              </div>
            </button>
          ))}
          <button
            onClick={() => setShowLevelSelector(false)}
            className="w-full text-center px-3 py-2 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded mt-1"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

// Badge component to display on messages
export function UrgentBadge({ level }: { level: 'low' | 'medium' | 'high' | 'critical' }) {
  const colors = {
    low: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    medium: 'bg-orange-100 text-orange-700 border-orange-300',
    high: 'bg-red-100 text-red-700 border-red-300',
    critical: 'bg-red-200 text-red-900 border-red-400'
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${colors[level]}`}>
      <AlertCircle className="w-3 h-3" />
      Urgent
    </span>
  );
}
