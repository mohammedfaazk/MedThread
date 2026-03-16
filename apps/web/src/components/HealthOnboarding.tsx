'use client'

import { useState } from 'react'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Check, User, Heart, Utensils, Target } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface HealthProfileData {
  ageGroup: string
  biologicalSex: string
  nationality: string
  weightRange: string
  heightRange: string
  activityLevel: string
  medicalConditions: string[]
  currentMedications: string
  foodAllergies: string[]
  dietType: string
  religiousRestrictions: string
  foodsToAvoid: string
  cookingAccess: string
  primaryGoal: string
  sleepHours: string
  waterIntake: string
}

interface HealthOnboardingProps {
  token: string
  onComplete: () => void
  onSkip: () => void
}

const sections = [
  { id: 'bio', title: 'Basic Bio', icon: User },
  { id: 'medical', title: 'Medical History', icon: Heart },
  { id: 'dietary', title: 'Dietary Preferences', icon: Utensils },
  { id: 'goals', title: 'Health Goals', icon: Target },
]

const EMPTY: HealthProfileData = {
  ageGroup: '', biologicalSex: '', nationality: '', weightRange: '',
  heightRange: '', activityLevel: '', medicalConditions: [], currentMedications: '',
  foodAllergies: [], dietType: '', religiousRestrictions: '', foodsToAvoid: '',
  cookingAccess: '', primaryGoal: '', sleepHours: '', waterIntake: '',
}

function computeRiskLevel(conditions: string[]): string {
  const high = (
    (conditions.includes('Diabetes') && conditions.includes('High Blood Pressure')) ||
    (conditions.includes('Heart Disease') && conditions.includes('High Cholesterol')) ||
    (conditions.includes('Kidney Disease') && conditions.includes('Diabetes'))
  )
  if (high) return 'HIGH'
  if (conditions.length >= 2) return 'MEDIUM'
  if (conditions.length === 1) return 'LOW'
  return 'NONE'
}

export default function HealthOnboarding({ token, onComplete, onSkip }: HealthOnboardingProps) {
  const [step, setStep] = useState(0)
  const [data, setData] = useState<HealthProfileData>(EMPTY)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (field: keyof HealthProfileData, value: any) =>
    setData(prev => ({ ...prev, [field]: value }))

  const toggle = (field: 'medicalConditions' | 'foodAllergies', value: string) =>
    setData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(v => v !== value)
        : [...prev[field], value],
    }))

  const isStepComplete = () => {
    switch (step) {
      case 0: return !!(data.ageGroup && data.biologicalSex && data.nationality && data.weightRange && data.heightRange && data.activityLevel)
      case 1: return true
      case 2: return !!(data.dietType && data.religiousRestrictions && data.cookingAccess)
      case 3: return !!(data.primaryGoal && data.sleepHours && data.waterIntake)
      default: return false
    }
  }

  const handleComplete = async () => {
    setLoading(true)
    setError('')
    try {
      await axios.post(
        `${API_URL}/api/v1/health-profile`,
        { ...data, riskLevel: computeRiskLevel(data.medicalConditions) },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      onComplete()
    } catch (err: any) {
      console.warn('Health profile save failed:', err.response?.data?.error)
      setError('Could not save right now. You can update it later in Settings.')
      setTimeout(onComplete, 2000)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold">Health Profile Setup</h2>
              <p className="text-blue-100 text-sm mt-0.5">
                Personalise your diet plans — takes about 2 minutes
              </p>
            </div>
            <button onClick={onSkip} className="text-white/70 hover:text-white text-sm underline">
              Skip
            </button>
          </div>
          {/* Step indicators */}
          <div className="flex items-center gap-2">
            {sections.map((s, i) => {
              const Icon = s.icon
              const done = i < step
              const active = i === step
              return (
                <div key={s.id} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${done ? 'bg-green-500' : active ? 'bg-white text-blue-600' : 'bg-white/20'}`}>
                    {done ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  </div>
                  {i < sections.length - 1 && (
                    <div className={`w-8 h-0.5 mx-1 ${done ? 'bg-green-500' : 'bg-white/20'}`} />
                  )}
                </div>
              )
            })}
          </div>
          <p className="text-white/80 text-xs mt-2">
            Step {step + 1} of {sections.length}: {sections[step].title}
          </p>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.18 }}
            >
              {step === 0 && <BioStep data={data} set={set} />}
              {step === 1 && <MedicalStep data={data} set={set} toggle={toggle} />}
              {step === 2 && <DietaryStep data={data} set={set} />}
              {step === 3 && <GoalsStep data={data} set={set} />}
            </motion.div>
          </AnimatePresence>

          {error && (
            <p className="mt-4 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 flex items-center justify-between shrink-0">
          <button
            onClick={() => setStep(s => s - 1)}
            disabled={step === 0}
            className="flex items-center gap-1 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          <span className="text-xs text-gray-400">{step + 1} / {sections.length}</span>
          {step < sections.length - 1 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={!isStepComplete()}
              className="flex items-center gap-1 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleComplete}
              disabled={!isStepComplete() || loading}
              className="flex items-center gap-1 px-5 py-2.5 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm"
            >
              {loading ? 'Saving...' : 'Complete ✓'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── Step sub-components ── */

function BioStep({ data, set }: { data: HealthProfileData; set: (f: keyof HealthProfileData, v: any) => void }) {
  return (
    <div className="space-y-5">
      <MCQ label="Age Group" value={data.ageGroup} onChange={v => set('ageGroup', v)}
        options={['18–25', '26–35', '36–45', '46–60', '60+']} required />
      <MCQ label="Biological Sex" value={data.biologicalSex} onChange={v => set('biologicalSex', v)}
        options={['Male', 'Female', 'Other']} required />
      <MCQ label="Nationality / Cultural Background" value={data.nationality} onChange={v => set('nationality', v)}
        options={['Indian', 'Middle Eastern', 'East Asian', 'Western', 'African', 'Latin American', 'Other']} required />
      <MCQ label="Body Weight Range" value={data.weightRange} onChange={v => set('weightRange', v)}
        options={['Under 50kg', '50–70kg', '70–90kg', '90–110kg', '110kg+']} required />
      <MCQ label="Height Range" value={data.heightRange} onChange={v => set('heightRange', v)}
        options={['Under 150cm', '150–165cm', '165–180cm', '180cm+']} required />
      <MCQ label="Activity Level" value={data.activityLevel} onChange={v => set('activityLevel', v)}
        options={['Sedentary', 'Lightly Active', 'Moderately Active', 'Very Active']} required />
    </div>
  )
}

function MedicalStep({ data, set, toggle }: {
  data: HealthProfileData
  set: (f: keyof HealthProfileData, v: any) => void
  toggle: (f: 'medicalConditions' | 'foodAllergies', v: string) => void
}) {
  return (
    <div className="space-y-5">
      <MultiSelect
        label="Pre-existing Conditions (select all that apply)"
        values={data.medicalConditions}
        onChange={v => toggle('medicalConditions', v)}
        options={[
          'Diabetes', 'High Blood Pressure', 'Heart Disease', 'High Cholesterol',
          'Kidney Disease', 'Thyroid Problems', 'PCOD / PCOS', 'Celiac Disease',
          'Lactose Intolerance', 'Pregnancy', 'None',
        ]}
      />
      <MultiSelect
        label="Known Food Allergies (select all that apply)"
        values={data.foodAllergies}
        onChange={v => toggle('foodAllergies', v)}
        options={['Nuts', 'Shellfish', 'Dairy', 'Eggs', 'Soy', 'Gluten', 'None']}
      />
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Current Medications <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <textarea
          value={data.currentMedications}
          onChange={e => set('currentMedications', e.target.value)}
          placeholder="e.g., Metformin 500mg, Lisinopril 10mg"
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
          rows={2}
        />
      </div>
    </div>
  )
}

function DietaryStep({ data, set }: { data: HealthProfileData; set: (f: keyof HealthProfileData, v: any) => void }) {
  return (
    <div className="space-y-5">
      <MCQ label="Diet Type" value={data.dietType} onChange={v => set('dietType', v)}
        options={['Vegetarian', 'Vegan', 'Non-Vegetarian', 'Eggetarian', 'Pescatarian']} required />
      <MCQ label="Religious Dietary Restrictions" value={data.religiousRestrictions} onChange={v => set('religiousRestrictions', v)}
        options={['Halal', 'Kosher', 'Hindu Vegetarian', 'No restrictions']} required />
      <MCQ label="Cooking Access" value={data.cookingAccess} onChange={v => set('cookingAccess', v)}
        options={['Full kitchen', 'Basic cooking', 'No cooking — prefer ready-to-eat']} required />
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Foods to Avoid <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <textarea
          value={data.foodsToAvoid}
          onChange={e => set('foodsToAvoid', e.target.value)}
          placeholder="e.g., Spicy food, raw onions..."
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
          rows={2}
        />
      </div>
    </div>
  )
}

function GoalsStep({ data, set }: { data: HealthProfileData; set: (f: keyof HealthProfileData, v: any) => void }) {
  return (
    <div className="space-y-5">
      <MCQ label="Primary Health Goal" value={data.primaryGoal} onChange={v => set('primaryGoal', v)}
        options={['Weight loss', 'Weight gain', 'Maintain weight', 'Manage medical condition', 'General wellness']} required />
      <MCQ label="Sleep Hours per Night" value={data.sleepHours} onChange={v => set('sleepHours', v)}
        options={['Less than 5', '5–7', '7–9', 'More than 9']} required />
      <MCQ label="Water Intake per Day" value={data.waterIntake} onChange={v => set('waterIntake', v)}
        options={['Less than 1L', '1–2L', '2–3L', 'More than 3L']} required />
    </div>
  )
}

/* ── Shared UI ── */

function MCQ({ label, value, onChange, options, required = false }: {
  label: string; value: string; onChange: (v: string) => void; options: string[]; required?: boolean
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {options.map(opt => (
          <button key={opt} type="button" onClick={() => onChange(opt)}
            className={`p-2.5 text-left rounded-xl border-2 text-sm transition-all ${
              value === opt ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold' : 'border-gray-200 hover:border-gray-300 text-gray-700'
            }`}>
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}

function MultiSelect({ label, values, onChange, options }: {
  label: string; values: string[]; onChange: (v: string) => void; options: string[]
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
      <div className="grid grid-cols-2 gap-2">
        {options.map(opt => (
          <button key={opt} type="button" onClick={() => onChange(opt)}
            className={`p-2.5 text-left rounded-xl border-2 text-sm transition-all flex items-center gap-2 ${
              values.includes(opt) ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 hover:border-gray-300 text-gray-700'
            }`}>
            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${
              values.includes(opt) ? 'border-green-500 bg-green-500' : 'border-gray-300'
            }`}>
              {values.includes(opt) && <Check className="w-3 h-3 text-white" />}
            </div>
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}
