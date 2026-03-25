'use client';

import React from 'react';

interface EmergencyAlertModalProps {
  level: string;
  onClose: () => void;
  onProceed: () => void;
}

export const EmergencyAlertModal: React.FC<EmergencyAlertModalProps> = ({
  level,
  onClose,
  onProceed
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-2xl">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
            <span className="text-4xl">🚨</span>
          </div>
          
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            MEDICAL EMERGENCY DETECTED
          </h2>
          
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-6 text-left">
            <p className="text-red-800 font-semibold mb-3">
              Your message contains keywords indicating a potential medical emergency.
            </p>
            
            <div className="space-y-2 text-sm text-red-700">
              <p><strong>If this is a medical emergency:</strong></p>
              <ul className="list-disc ml-5 space-y-1">
                <li>Call emergency services immediately</li>
                <li>India: <strong className="text-lg">112</strong></li>
                <li>US: <strong className="text-lg">911</strong></li>
                <li>UK: <strong className="text-lg">999</strong></li>
              </ul>
            </div>
          </div>

          <p className="text-sm text-gray-600 mb-6">
            This platform cannot provide emergency medical assistance. Healthcare professionals here cannot diagnose or treat emergencies through online interactions.
          </p>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold"
            >
              Call Emergency Services
            </button>
            <button
              onClick={onProceed}
              className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
            >
              This is Not an Emergency
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
