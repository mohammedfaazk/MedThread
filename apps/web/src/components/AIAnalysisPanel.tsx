'use client'

import { Bot, AlertTriangle, FileText } from 'lucide-react'

interface AIAnalysisPanelProps {
  analysis: any
}

export function AIAnalysisPanel({ analysis }: AIAnalysisPanelProps) {
  if (!analysis) {
    return (
      <div className="bg-white/40 backdrop-blur-md rounded-2xl p-6 shadow-lg sticky top-24 border border-white/20">
        <h3 className="text-lg font-semibold mb-4 text-charcoal">AI Analysis</h3>
        <p className="text-sm text-gray-600">
          Complete the form to see AI-powered insights
        </p>
      </div>
    )
  }

  return (
    <div className="bg-yellow-50/80 backdrop-blur-md rounded-2xl p-6 shadow-soft sticky top-24 border-2 border-yellow-200/50">
      <div className="flex items-center gap-2 mb-4">
        <Bot className="w-6 h-6 text-charcoal" />
        <h3 className="text-lg font-semibold text-charcoal">AI Insights</h3>
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
          <div className="bg-red-100/80 backdrop-blur-sm border border-red-300/50 rounded-xl p-3 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-700 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-700">
                Emergency Warning
              </p>
              <p className="text-xs text-red-600 mt-1">
                Please seek immediate medical attention
              </p>
            </div>
          </div>
        )}

        <div className="flex items-start gap-2">
          <FileText className="w-4 h-4 text-gray-700 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">Similar Cases:</p>
            <p className="text-sm text-gray-600">3 similar discussions found</p>
          </div>
        </div>
      </div>
    </div>
  )
}
