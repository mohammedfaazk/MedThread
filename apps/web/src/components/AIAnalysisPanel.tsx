'use client'

interface AIAnalysisPanelProps {
  analysis: any
}

export function AIAnalysisPanel({ analysis }: AIAnalysisPanelProps) {
  if (!analysis) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-24">
        <h3 className="text-lg font-semibold mb-4">AI Analysis</h3>
        <p className="text-sm text-gray-600">
          Complete the form to see AI-powered insights
        </p>
      </div>
    )
  }

  return (
    <div className="bg-orange-50 rounded-2xl p-6 shadow-sm sticky top-24 border-2 border-orange-200">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">🤖</span>
        <h3 className="text-lg font-semibold">AI Insights</h3>
      </div>
      
      <div className="space-y-4">
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Possible Conditions:</p>
          <ul className="space-y-1">
            {analysis.possibleConditions?.map((condition: string, idx: number) => (
              <li key={idx} className="text-sm text-gray-600">• {condition}</li>
            ))}
          </ul>
        </div>

        {analysis.emergencyWarning && (
          <div className="bg-red-100 border border-red-300 rounded-lg p-3">
            <p className="text-sm font-semibold text-red-700">
              ⚠️ Emergency Warning
            </p>
            <p className="text-xs text-red-600 mt-1">
              Please seek immediate medical attention
            </p>
          </div>
        )}

        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Similar Cases:</p>
          <p className="text-sm text-gray-600">3 similar discussions found</p>
        </div>
      </div>
    </div>
  )
}
