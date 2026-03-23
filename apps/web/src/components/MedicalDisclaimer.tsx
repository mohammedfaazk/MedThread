'use client';

import { AlertTriangle } from 'lucide-react';

interface MedicalDisclaimerProps {
  variant?: 'banner' | 'inline' | 'modal';
  className?: string;
}

export function MedicalDisclaimer({ variant = 'banner', className = '' }: MedicalDisclaimerProps) {
  if (variant === 'inline') {
    return (
      <div className={`text-xs text-gray-500 ${className}`}>
        <span className="font-semibold">Medical Disclaimer:</span> This platform provides general health information only and is not a substitute for professional medical advice.
      </div>
    );
  }

  return (
    <div className={`bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r ${className}`}>
      <div className="flex gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-amber-900 mb-1">
            Important Medical Disclaimer
          </h3>
          <p className="text-sm text-amber-800 leading-relaxed">
            This platform provides general health information only and is <strong>not a substitute for professional medical advice, diagnosis, or treatment</strong>. 
            Always seek the advice of your physician or qualified health provider with any questions regarding a medical condition. 
            <strong className="block mt-1">Never disregard professional medical advice or delay seeking it because of something you read here.</strong>
          </p>
        </div>
      </div>
    </div>
  );
}

export function EmergencyBanner({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-red-50 border-l-4 border-red-600 p-4 rounded-r ${className}`}>
      <div className="flex gap-3">
        <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-red-900 mb-1">
            🚨 In Case of Emergency
          </h3>
          <p className="text-sm text-red-800">
            If you are experiencing a medical emergency, <strong>call emergency services immediately</strong>:
          </p>
          <div className="mt-2 flex flex-wrap gap-3">
            <a 
              href="tel:112" 
              className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors"
            >
              📞 Call 112 (India)
            </a>
            <a 
              href="tel:9152987821" 
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              💙 Mental Health: 9152987821
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
