'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

interface SymptomFormProps {
  onDataChange: (data: any) => void
  onAnalysisReceived: (analysis: any) => void
}

export function SymptomForm({ onDataChange, onAnalysisReceived }: SymptomFormProps) {
  const [step, setStep] = useState(1)
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
    'Headache', 'Fever', 'Cough', 'Fatigue', 'Nausea',
    'Chest Pain', 'Shortness of Breath', 'Dizziness', 'Back Pain'
  ]

  const toggleSymptom = (symptom: string) => {
    setFormData(prev => ({
      ...prev,
      primarySymptoms: prev.primarySymptoms.includes(symptom)
        ? prev.primarySymptoms.filter(s => s !== symptom)
        : [...prev.primarySymptoms, symptom]
    }))
  }

  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className={`flex-1 h-2 rounded-full ${
                i <= step ? 'bg-orange-500' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
        <p className="text-sm text-gray-600">Step {step} of 3</p>
      </div>

      {step === 1 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <h2 className="text-2xl font-bold mb-6">Basic Information</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Age</label>
              <input
                type="number"
                value={formData.age}
                onChange={e => setFormData({...formData, age: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Enter age"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Gender</label>
              <select
                value={formData.gender}
                onChange={e => setFormData({...formData, gender: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Weight (kg)</label>
            <input
              type="number"
              value={formData.weight}
              onChange={e => setFormData({...formData, weight: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Enter weight"
            />
          </div>

          <button
            onClick={() => setStep(2)}
            className="w-full py-3 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition font-semibold"
          >
            Continue
          </button>
        </motion.div>
      )}

      {step === 2 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <h2 className="text-2xl font-bold mb-6">Symptoms</h2>
          
          <div>
            <label className="block text-sm font-medium mb-3">Select your symptoms</label>
            <div className="flex flex-wrap gap-2">
              {commonSymptoms.map(symptom => (
                <button
                  key={symptom}
                  onClick={() => toggleSymptom(symptom)}
                  className={`px-4 py-2 rounded-full transition ${
                    formData.primarySymptoms.includes(symptom)
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {symptom}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Duration</label>
            <select
              value={formData.duration}
              onChange={e => setFormData({...formData, duration: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">Select duration</option>
              <option value="less_than_day">Less than a day</option>
              <option value="1-3_days">1-3 days</option>
              <option value="4-7_days">4-7 days</option>
              <option value="1-2_weeks">1-2 weeks</option>
              <option value="more_than_2_weeks">More than 2 weeks</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Severity</label>
            <div className="flex gap-2">
              {['LOW', 'MODERATE', 'HIGH'].map(level => (
                <button
                  key={level}
                  onClick={() => setFormData({...formData, severity: level})}
                  className={`flex-1 py-2 rounded-lg transition ${
                    formData.severity === level
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep(1)}
              className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 transition font-semibold"
            >
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              className="flex-1 py-3 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition font-semibold"
            >
              Continue
            </button>
          </div>
        </motion.div>
      )}

      {step === 3 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <h2 className="text-2xl font-bold mb-6">Additional Details</h2>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Describe your symptoms in detail
            </label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Please provide as much detail as possible..."
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep(2)}
              className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 transition font-semibold"
            >
              Back
            </button>
            <button
              onClick={() => alert('Post created!')}
              className="flex-1 py-3 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition font-semibold"
            >
              Publish Post
            </button>
          </div>
        </motion.div>
      )}
    </div>
  )
}
