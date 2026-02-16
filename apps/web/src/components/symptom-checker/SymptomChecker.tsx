'use client'

import { useState } from 'react'
import axios from 'axios'
import { 
  AlertTriangle, CheckCircle2, Activity, User, 
  Calendar, Pill, FileText, ArrowRight, Loader2
} from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export default function SymptomChecker() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [analysis, setAnalysis] = useState<any>(null)
  
  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    weight: '',
    existingConditions: [] as string[],
    medications: [] as string[],
    primarySymptoms: [] as string[],
    duration: '',
    severity: 'MODERATE',
    description: ''
  })

  const commonSymptoms = [
    'Fever', 'Cough', 'Headache', 'Sore Throat', 'Runny Nose',
    'Fatigue', 'Body Aches', 'Nausea', 'Vomiting', 'Diarrhea',
    'Chest Pain', 'Shortness of Breath', 'Dizziness', 'Abdominal Pain',
    'Rash', 'Joint Pain', 'Back Pain', 'Loss of Appetite'
  ]

  const handleSymptomToggle = (symptom: string) => {
    setFormData(prev => ({
      ...prev,
      primarySymptoms: prev.primarySymptoms.includes(symptom)
        ? prev.primarySymptoms.filter(s => s !== symptom)
        : [...prev.primarySymptoms, symptom]
    }))
  }

  const handleAnalyze = async () => {
    try {
      setLoading(true)
      const response = await axios.post(`${API_URL}/api/threads/symptom-checker`, formData)
      setAnalysis(response.data)
      setStep(4)
    } catch (error) {
      console.error('Error analyzing symptoms:', error)
      alert('Failed to analyze symptoms')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setStep(1)
    setAnalysis(null)
    setFormData({
      age: '',
      gender: '',
      weight: '',
      existingConditions: [],
      medications: [],
      primarySymptoms: [],
      duration: '',
      severity: 'MODERATE',
      description: ''
    })
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6">
          <h1 className="text-3xl font-bold mb-2">AI Symptom Checker</h1>
          <p className="text-blue-100">Get preliminary insights about your symptoms</p>
        </div>

        {/* Progress Bar */}
        {step < 4 && (
          <div className="bg-gray-100 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Step {step} of 3</span>
              <span className="text-sm text-gray-600">{Math.round((step / 3) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-gray-300 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(step / 3) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Basic Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Age
                  </label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter age"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter weight"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setStep(2)}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Next
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Select Your Symptoms</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {commonSymptoms.map(symptom => (
                  <button
                    key={symptom}
                    onClick={() => handleSymptomToggle(symptom)}
                    className={`p-3 border-2 rounded-lg text-sm font-medium transition ${
                      formData.primarySymptoms.includes(symptom)
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    {symptom}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  How long have you had these symptoms?
                </label>
                <select
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select duration</option>
                  <option value="less than 24 hours">Less than 24 hours</option>
                  <option value="1-3 days">1-3 days</option>
                  <option value="4-7 days">4-7 days</option>
                  <option value="1-2 weeks">1-2 weeks</option>
                  <option value="more than 2 weeks">More than 2 weeks</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Severity
                </label>
                <div className="flex gap-2">
                  {['LOW', 'MODERATE', 'HIGH', 'EMERGENCY'].map(severity => (
                    <button
                      key={severity}
                      onClick={() => setFormData({ ...formData, severity })}
                      className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
                        formData.severity === severity
                          ? severity === 'EMERGENCY' ? 'bg-red-600 text-white' :
                            severity === 'HIGH' ? 'bg-orange-600 text-white' :
                            severity === 'MODERATE' ? 'bg-yellow-600 text-white' :
                            'bg-green-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {severity}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={formData.primarySymptoms.length === 0}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  Next
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Additional Details</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Describe your symptoms in detail
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe when symptoms started, what makes them better or worse, any other relevant information..."
                />
              </div>

              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Disclaimer:</strong> This symptom checker provides preliminary information only and is not a substitute for professional medical advice. Always consult with a qualified healthcare provider for proper diagnosis and treatment.
                </p>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Back
                </button>
                <button
                  onClick={handleAnalyze}
                  disabled={loading || !formData.description}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      Analyze Symptoms
                      <Activity className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {step === 4 && analysis && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Analysis Results</h2>
              
              {/* Emergency Warning */}
              {analysis.emergencyWarning && (
                <div className="p-4 bg-red-50 border-2 border-red-600 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-bold text-red-900 mb-1">EMERGENCY</h3>
                      <p className="text-red-800">{analysis.emergencyWarning}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Red Flags */}
              {analysis.redFlags.length > 0 && (
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <h3 className="font-bold text-orange-900 mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Warning Signs Detected
                  </h3>
                  <ul className="space-y-1">
                    {analysis.redFlags.map((flag: string, index: number) => (
                      <li key={index} className="text-orange-800 text-sm">• {flag}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Possible Conditions */}
              <div>
                <h3 className="font-bold text-gray-900 mb-3">Possible Conditions</h3>
                <div className="space-y-3">
                  {analysis.possibleConditions.map((condition: any, index: number) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">{condition.condition}</h4>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          condition.urgency === 'emergency' ? 'bg-red-100 text-red-700' :
                          condition.urgency === 'high' ? 'bg-orange-100 text-orange-700' :
                          condition.urgency === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {condition.probability}% match
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{condition.reasoning}</p>
                      <span className={`text-xs px-2 py-1 rounded ${
                        condition.urgency === 'emergency' ? 'bg-red-100 text-red-700' :
                        condition.urgency === 'high' ? 'bg-orange-100 text-orange-700' :
                        condition.urgency === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {condition.urgency.toUpperCase()} URGENCY
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Actions */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  Recommended Actions
                </h3>
                <ul className="space-y-1">
                  {analysis.recommendedActions.map((action: string, index: number) => (
                    <li key={index} className="text-blue-800 text-sm">• {action}</li>
                  ))}
                </ul>
              </div>

              {/* Specialty Recommendation */}
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <h3 className="font-bold text-gray-900 mb-1">Recommended Specialty</h3>
                <p className="text-gray-700">{analysis.specialtyRecommendation}</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleReset}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Check Again
                </button>
                <button
                  onClick={() => window.location.href = '/threads/create'}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Ask a Doctor
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
