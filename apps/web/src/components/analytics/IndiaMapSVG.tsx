'use client';

import { useState } from 'react';
import { getStateColor, getStateDiseaseData, type StateDiseaseData, INDIA_DISEASE_DATA } from '@/data/india-disease-data';

interface IndiaMapSVGProps {
  onStateClick?: (state: StateDiseaseData | null) => void;
  selectedDisease?: string;
}

export function IndiaMapSVG({ onStateClick, selectedDisease }: IndiaMapSVGProps) {
  const [hoveredState, setHoveredState] = useState<string | null>(null);

  const handleStateClick = (stateCode: string) => {
    const stateData = getStateDiseaseData(stateCode);
    if (onStateClick) {
      onStateClick(stateData || null);
    }
  };

  return (
    <div className="relative w-full">
      {hoveredState && (
        <div className="absolute top-4 left-4 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium z-10">
          {getStateDiseaseData(hoveredState)?.state || hoveredState}
        </div>
      )}
      
      {/* Grid-based India Map Visualization */}
      <div className="grid grid-cols-6 gap-1 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
        {INDIA_DISEASE_DATA.map((state) => {
          const color = getStateColor(state.stateCode);
          const isHovered = hoveredState === state.stateCode;
          
          return (
            <button
              key={state.stateCode}
              onClick={() => handleStateClick(state.stateCode)}
              onMouseEnter={() => setHoveredState(state.stateCode)}
              onMouseLeave={() => setHoveredState(null)}
              className="relative p-4 rounded-lg transition-all transform hover:scale-105 hover:shadow-xl"
              style={{
                backgroundColor: color,
                opacity: isHovered ? 1 : 0.9,
                border: isHovered ? '3px solid #1F2937' : '2px solid white'
              }}
            >
              <div className="text-white text-xs font-bold text-center mb-1">
                {state.stateCode}
              </div>
              <div className="text-white text-[10px] text-center opacity-90">
                {state.diseases.length} diseases
              </div>
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex justify-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#DC2626' }}></div>
          <span>Critical</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#EA580C' }}></div>
          <span>High</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#F59E0B' }}></div>
          <span>Medium</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#10B981' }}></div>
          <span>Low</span>
        </div>
      </div>
    </div>
  );
}
