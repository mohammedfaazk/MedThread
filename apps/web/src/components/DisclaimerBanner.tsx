'use client'

import { Info } from 'lucide-react'

export function DisclaimerBanner() {
  return (
    <div className="bg-yellow-50/80 backdrop-blur-md border border-yellow-200/50 rounded-2xl p-4 mb-6 shadow-soft">
      <div className="flex items-start gap-3">
        <Info className="w-5 h-5 text-charcoal flex-shrink-0 mt-0.5" />
        <div className="flex-1 text-sm">
          <p className="text-charcoal font-medium mb-1">Medical Disclaimer</p>
          <p className="text-gray-700">
            Information provided on MedThread is for educational purposes only and should not replace professional medical advice. 
            Always consult with a qualified healthcare provider for diagnosis and treatment.
          </p>
        </div>
      </div>
    </div>
  )
}
