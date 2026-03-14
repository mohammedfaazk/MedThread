'use client';

import { useState } from 'react';
import { AlertTriangle, Filter, TrendingUp } from 'lucide-react';

interface PriorityFeedFilterProps {
  currentFilter: 'ALL' | 'HIGH' | 'MEDIUM' | 'LOW';
  onFilterChange: (filter: 'ALL' | 'HIGH' | 'MEDIUM' | 'LOW') => void;
  priorityStats?: {
    total: number;
    distribution: Array<{
      priority: string;
      count: number;
      percentage: string;
      badge: {
        emoji: string;
        label: string;
        color: string;
        bgColor: string;
        textColor: string;
      };
    }>;
  };
}

export function PriorityFeedFilter({ 
  currentFilter, 
  onFilterChange, 
  priorityStats 
}: PriorityFeedFilterProps) {
  const [showStats, setShowStats] = useState(false);

  const filterOptions = [
    { 
      value: 'ALL' as const, 
      label: 'All Posts', 
      icon: Filter,
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
      hoverColor: 'hover:bg-gray-200'
    },
    { 
      value: 'HIGH' as const, 
      label: 'High Priority', 
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      hoverColor: 'hover:bg-red-200',
      emoji: '🔴'
    },
    { 
      value: 'MEDIUM' as const, 
      label: 'Medium Priority', 
      icon: TrendingUp,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      hoverColor: 'hover:bg-yellow-200',
      emoji: '🟡'
    },
    { 
      value: 'LOW' as const, 
      label: 'Low Priority', 
      icon: Filter,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      hoverColor: 'hover:bg-green-200',
      emoji: '🟢'
    }
  ];

  const getFilterCount = (priority: string) => {
    if (!priorityStats) return 0;
    if (priority === 'ALL') return priorityStats.total;
    
    const stat = priorityStats.distribution.find(d => d.priority === priority);
    return stat?.count || 0;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-500" />
          Medical Priority Filter
        </h3>
        <button
          onClick={() => setShowStats(!showStats)}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          {showStats ? 'Hide Stats' : 'Show Stats'}
        </button>
      </div>

      {/* Filter Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {filterOptions.map((option) => {
          const Icon = option.icon;
          const isActive = currentFilter === option.value;
          const count = getFilterCount(option.value);

          return (
            <button
              key={option.value}
              onClick={() => onFilterChange(option.value)}
              className={`
                relative p-3 rounded-lg border-2 transition-all duration-200
                ${isActive 
                  ? `${option.bgColor} border-current ${option.color}` 
                  : `bg-white border-gray-200 text-gray-600 ${option.hoverColor}`
                }
              `}
            >
              <div className="flex items-center gap-2 mb-1">
                {option.emoji && (
                  <span className="text-lg">{option.emoji}</span>
                )}
                <Icon className="w-4 h-4" />
                <span className="font-medium text-sm">{option.label}</span>
              </div>
              {count > 0 && (
                <div className="text-xs text-gray-500">
                  {count} posts
                </div>
              )}
              {isActive && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full"></div>
              )}
            </button>
          );
        })}
      </div>

      {/* Priority Statistics */}
      {showStats && priorityStats && (
        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Priority Distribution</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {priorityStats.distribution.map((stat) => (
              <div key={stat.priority} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{stat.badge.emoji}</span>
                    <span className="text-sm font-medium text-gray-700">
                      {stat.priority}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {stat.percentage}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-gray-900">
                    {stat.count}
                  </span>
                  <span className="text-xs text-gray-500">
                    posts
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 text-blue-700">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">
                Total: {priorityStats.total} posts analyzed
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <p className="text-xs text-gray-600">
          <strong>🔴 High Priority:</strong> Acute symptoms requiring immediate attention (chest pain, difficulty breathing, severe headache)
          <br />
          <strong>🟡 Medium Priority:</strong> Moderate symptoms needing timely care (persistent cough, fatigue, body ache)
          <br />
          <strong>🟢 Low Priority:</strong> Minor symptoms or general wellness questions (cold, sneezing, health tips)
        </p>
      </div>
    </div>
  );
}