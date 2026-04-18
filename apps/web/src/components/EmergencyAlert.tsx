'use client';

import { useState } from 'react';
import { AlertCircle, Phone, X } from 'lucide-react';

interface EmergencyAlertProps {
  level: 'IMMEDIATE' | 'HIGH' | 'MENTAL_HEALTH';
  keywords: string[];
  onDismiss: () => void;
  onContinue: () => void;
  country?: 'INDIA' | 'US' | 'UK';
}

export function EmergencyAlert({ 
  level, 
  keywords, 
  onDismiss, 
  onContinue,
  country = 'INDIA' 
}: EmergencyAlertProps) {
  const [userConfirmed, setUserConfirmed] = useState(false);

  const hotlines: Record<string, { emergency: string; mental: string; ambulance?: string }> = {
    INDIA: { emergency: '112', mental: '9152987821', ambulance: '102' },
    US: { emergency: '911', mental: '988' },
    UK: { emergency: '999', mental: '116123' }
  };

  const currentHotlines = hotlines[country];

  if (level === 'HIGH') {
    // For high urgency, show a less intrusive banner
    return (
      <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r mb-4">
        <div className="flex gap-3">
          <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-orange-900 mb-1">
              Urgent Medical Attention May Be Needed
            </h3>
            <p className="text-sm text-orange-800 mb-2">
              Your message suggests you may need urgent medical care. If symptoms are severe, please seek immediate medical attention.
            </p>
            <a 
              href={`tel:${currentHotlines.emergency}`}
              className="inline-flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-orange-700 transition-colors"
            >
              <Phone className="h-4 w-4" />
              Call {currentHotlines.emergency}
            </a>
          </div>
          <button onClick={onDismiss} className="text-orange-600 hover:text-orange-800">
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    );
  }

  // For IMMEDIATE or MENTAL_HEALTH, show full modal
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start gap-4 mb-4">
            <div className="bg-red-100 p-3 rounded-full">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-red-600 mb-1">
                {level === 'MENTAL_HEALTH' ? '💙 Crisis Support Needed' : '🚨 Emergency Detected'}
              </h2>
              <p className="text-gray-600 text-sm">
                Your message contains keywords that suggest you may need immediate help
              </p>
            </div>
          </div>

          {/* Warning Message */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-900 font-semibold mb-2">
              ⚠️ This platform cannot provide emergency services
            </p>
            <p className="text-red-800 text-sm">
              If you are experiencing a medical or mental health emergency, please contact emergency services immediately. 
              They are trained professionals who can provide immediate assistance.
            </p>
          </div>

          {/* Emergency Contacts */}
          <div className="space-y-3 mb-6">
            {level === 'MENTAL_HEALTH' ? (
              <>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-900 font-semibold mb-2">
                    💙 Mental Health Crisis Support
                  </p>
                  <a 
                    href={`tel:${currentHotlines.mental}`}
                    className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-bold text-lg hover:bg-blue-700 transition-colors w-full"
                  >
                    <Phone className="h-5 w-5" />
                    Call {currentHotlines.mental}
                  </a>
                  <p className="text-blue-700 text-xs mt-2">
                    24/7 confidential support for mental health crises
                  </p>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-900 font-semibold mb-2">
                    🚨 Emergency Services
                  </p>
                  <a 
                    href={`tel:${currentHotlines.emergency}`}
                    className="flex items-center justify-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg font-bold text-lg hover:bg-red-700 transition-colors w-full"
                  >
                    <Phone className="h-5 w-5" />
                    Call {currentHotlines.emergency}
                  </a>
                </div>
              </>
            ) : (
              <>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-900 font-semibold mb-2">
                    🚨 Emergency Services
                  </p>
                  <a 
                    href={`tel:${currentHotlines.emergency}`}
                    className="flex items-center justify-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg font-bold text-lg hover:bg-red-700 transition-colors w-full"
                  >
                    <Phone className="h-5 w-5" />
                    Call {currentHotlines.emergency}
                  </a>
                  <p className="text-red-700 text-xs mt-2">
                    For immediate medical emergencies
                  </p>
                </div>
                {currentHotlines.ambulance && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <p className="text-orange-900 font-semibold mb-2">
                      🚑 Ambulance Service
                    </p>
                    <a 
                      href={`tel:${currentHotlines.ambulance}`}
                      className="flex items-center justify-center gap-2 bg-orange-600 text-white px-6 py-3 rounded-lg font-bold text-lg hover:bg-orange-700 transition-colors w-full"
                    >
                      <Phone className="h-5 w-5" />
                      Call {currentHotlines.ambulance}
                    </a>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Confirmation Checkbox */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={userConfirmed}
                onChange={(e) => setUserConfirmed(e.target.checked)}
                className="mt-1 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">
                I understand this is not an emergency, or I have already contacted emergency services and want to continue using the platform
              </span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onDismiss}
              className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onContinue}
              disabled={!userConfirmed}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Continue
            </button>
          </div>

          {/* Footer Note */}
          <p className="text-xs text-gray-500 text-center mt-4">
            Your safety is our priority. This alert is shown to ensure you get the help you need.
          </p>
        </div>
      </div>
    </div>
  );
}
