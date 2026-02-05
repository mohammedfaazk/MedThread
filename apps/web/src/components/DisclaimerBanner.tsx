'use client'

export function DisclaimerBanner() {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
      <div className="flex items-start gap-3">
        <span className="text-xl">ℹ️</span>
        <div className="flex-1 text-sm">
          <p className="text-blue-900 font-medium mb-1">Medical Disclaimer</p>
          <p className="text-blue-700">
            Information provided on MedThread is for educational purposes only and should not replace professional medical advice. 
            Always consult with a qualified healthcare provider for diagnosis and treatment.
          </p>
        </div>
      </div>
    </div>
  )
}
