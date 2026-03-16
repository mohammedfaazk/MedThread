'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Check, User, Heart, Utensils, Target } from 'lucide-react'

interface HealthProfileData {
  // Basic Bio
  ageGroup: string
  biologicalSex: string
  nationality: string
  weightRange: string
  heightRange: string
  activityLevel: string
  // Medical Conditions
  medicalConditions: string[]
  currentMedications: string
  foodAllergies: string[]
  // Dietary Preferences
  dietType: string
  religiousRestrictions: string
  foodsToAvoid: string
  cookingAccess: string
  // Health Goals
  primaryGoal: string
  sleepHours: string
  waterIntake: string
}

interface HealthProfileMCQProps {
  onComplete: (data: HealthProfileData) => void
  onClose: () => void
  initialData?: Partial<HealthProfileData>
}

const sections = [
  { id: 'bio', title: 'Basic Bio', icon: User, color: 'blue' },
  { id: 'medical', title: 'Medical History', icon: Heart, color: 'red' },
  { id: 'dietary', title: 'Dietary Preferences', icon: Utensils, color: 'green' },
  { id: 'goals', title: 'Health Goals', icon: Target, color: 'purple' }
]

export function HealthProfileMCQ({ onComplete, onClose, initialData = {} }: HealthProfileMCQProps) {
  // Coerce any null values from DB into empty strings so textarea never gets null
  const safeInitial = initialData
    ? Object.fromEntries(
        Object.entries(initialData).map(([k, v]) => [k, v === null ? (Array.isArray(v) ? [] : '') : v])
      )
    : {}

  const [currentSection, setCurrentSection] = useState(0)
  const [formData, setFormData] = useState<HealthProfileData>({
    ageGroup: '',
    biologicalSex: '',
    nationality: '',
    weightRange: '',
    heightRange: '',
    activityLevel: '',
    medicalConditions: [],
    currentMedications: '',
    foodAllergies: [],
    dietType: '',
    religiousRestrictions: '',
    foodsToAvoid: '',
    cookingAccess: '',
    primaryGoal: '',
    sleepHours: '',
    waterIntake: '',
    ...safeInitial
  })

  const updateField = (field: keyof HealthProfileData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const toggleArrayField = (field: 'medicalConditions' | 'foodAllergies', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }))
  }

  const nextSection = () => {
    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1)
    } else {
      onComplete(formData)
    }
  }

  const prevSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1)
    }
  }

  const isCurrentSectionComplete = () => {
    switch (currentSection) {
      case 0: // Bio
        return formData.ageGroup && formData.biologicalSex && formData.nationality && 
               formData.weightRange && formData.heightRange && formData.activityLevel
      case 1: // Medical
        return true // Optional fields
      case 2: // Dietary
        return formData.dietType && formData.religiousRestrictions && formData.cookingAccess
      case 3: // Goals
        return formData.primaryGoal && formData.sleepHours && formData.waterIntake
      default:
        return false
    }
  }

  const renderBioSection = () => (
    <div className="space-y-6">
      <MCQField
        label="Age Group"
        value={formData.ageGroup}
        onChange={(value) => updateField('ageGroup', value)}
        options={['18–25', '26–35', '36–45', '46–60', '60+']}
        required
      />
      
      <MCQField
        label="Biological Sex"
        value={formData.biologicalSex}
        onChange={(value) => updateField('biologicalSex', value)}
        options={['Male', 'Female', 'Other']}
        required
      />
      
      <MCQField
        label="Nationality / Cultural Background"
        value={formData.nationality}
        onChange={(value) => updateField('nationality', value)}
        options={['Indian', 'Middle Eastern', 'East Asian', 'Western', 'African', 'Latin American', 'Other']}
        required
      />
      
      <MCQField
        label="Current Body Weight Range"
        value={formData.weightRange}
        onChange={(value) => updateField('weightRange', value)}
        options={['Under 50kg', '50–70kg', '70–90kg', '90–110kg', '110kg+']}
        required
      />
      
      <MCQField
        label="Height Range"
        value={formData.heightRange}
        onChange={(value) => updateField('heightRange', value)}
        options={['Under 150cm', '150–165cm', '165–180cm', '180cm+']}
        required
      />
      
      <MCQField
        label="Activity Level"
        value={formData.activityLevel}
        onChange={(value) => updateField('activityLevel', value)}
        options={['Sedentary', 'Lightly Active', 'Moderately Active', 'Very Active']}
        required
      />
    </div>
  )

  const renderMedicalSection = () => (
    <div className="space-y-6">
      <MultiSelectField
        label="Pre-existing Conditions (Select all that apply)"
        values={formData.medicalConditions}
        onChange={(value) => toggleArrayField('medicalConditions', value)}
        options={[
          'Diabetes (Type 1)',
          'Diabetes (Type 2)',
          'Hypertension',
          'Cancer (active)',
          'Cancer (in remission)',
          'Thyroid disorder (Hypo)',
          'Thyroid disorder (Hyper)',
          'PCOD / PCOS',
          'Heart disease',
          'Kidney disease',
          'Celiac disease / Gluten intolerance',
          'Lactose intolerance',
          'None of the above'
        ]}
      />
      
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Current Medications
        </label>
        <div className="space-y-2">
          <MCQField
            label=""
            value={formData.currentMedications ? 'Yes' : 'No'}
            onChange={(value) => updateField('currentMedications', value === 'Yes' ? 'Please specify' : '')}
            options={['Yes', 'No']}
          />
          {formData.currentMedications && (
            <textarea
              value={formData.currentMedications}
              onChange={(e) => updateField('currentMedications', e.target.value)}
              placeholder="Please list your current medications"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              rows={3}
            />
          )}
        </div>
      </div>
      
      <MultiSelectField
        label="Known Food Allergies (Select all that apply)"
        values={formData.foodAllergies}
        onChange={(value) => toggleArrayField('foodAllergies', value)}
        options={['Nuts', 'Shellfish', 'Dairy', 'Eggs', 'Soy', 'Gluten', 'None']}
      />
    </div>
  )

  const renderDietarySection = () => (
    <div className="space-y-6">
      <MCQField
        label="Diet Type"
        value={formData.dietType}
        onChange={(value) => updateField('dietType', value)}
        options={['Vegetarian', 'Vegan', 'Non-Vegetarian', 'Eggetarian', 'Pescatarian']}
        required
      />
      
      <MCQField
        label="Religious Dietary Restrictions"
        value={formData.religiousRestrictions}
        onChange={(value) => updateField('religiousRestrictions', value)}
        options={['Halal', 'Kosher', 'Hindu Vegetarian', 'No restrictions']}
        required
      />
      
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Foods to Avoid (Optional)
        </label>
        <textarea
          value={formData.foodsToAvoid}
          onChange={(e) => updateField('foodsToAvoid', e.target.value)}
          placeholder="List any specific foods you want to avoid"
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
          rows={3}
        />
      </div>
      
      <MCQField
        label="Cooking Access"
        value={formData.cookingAccess}
        onChange={(value) => updateField('cookingAccess', value)}
        options={['Full kitchen', 'Basic cooking', 'No cooking — prefer ready-to-eat options']}
        required
      />
    </div>
  )

  const renderGoalsSection = () => (
    <div className="space-y-6">
      <MCQField
        label="Primary Health Goal"
        value={formData.primaryGoal}
        onChange={(value) => updateField('primaryGoal', value)}
        options={['Weight loss', 'Weight gain', 'Maintain weight', 'Manage medical condition', 'General wellness']}
        required
      />
      
      <MCQField
        label="Sleep Hours per Night"
        value={formData.sleepHours}
        onChange={(value) => updateField('sleepHours', value)}
        options={['Less than 5', '5–7', '7–9', 'More than 9']}
        required
      />
      
      <MCQField
        label="Water Intake per Day"
        value={formData.waterIntake}
        onChange={(value) => updateField('waterIntake', value)}
        options={['Less than 1L', '1–2L', '2–3L', 'More than 3L']}
        required
      />
    </div>
  )

  const renderCurrentSection = () => {
    switch (currentSection) {
      case 0: return renderBioSection()
      case 1: return renderMedicalSection()
      case 2: return renderDietarySection()
      case 3: return renderGoalsSection()
      default: return null
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Health Profile Assessment</h2>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="flex items-center gap-2 mb-2">
            {sections.map((section, index) => {
              const Icon = section.icon
              const isActive = index === currentSection
              const isCompleted = index < currentSection
              
              return (
                <div key={section.id} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    isCompleted ? 'bg-green-500' : isActive ? 'bg-white text-blue-600' : 'bg-white/20'
                  }`}>
                    {isCompleted ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                  </div>
                  {index < sections.length - 1 && (
                    <div className={`w-8 h-0.5 mx-1 transition-all ${
                      isCompleted ? 'bg-green-500' : 'bg-white/20'
                    }`} />
                  )}
                </div>
              )
            })}
          </div>
          
          <p className="text-white/90 text-sm">
            Step {currentSection + 1} of {sections.length}: {sections[currentSection].title}
          </p>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSection}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderCurrentSection()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 flex items-center justify-between">
          <button
            onClick={prevSection}
            disabled={currentSection === 0}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>
          
          <div className="text-sm text-gray-500">
            {currentSection + 1} / {sections.length}
          </div>
          
          <button
            onClick={nextSection}
            disabled={!isCurrentSectionComplete()}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {currentSection === sections.length - 1 ? 'Complete' : 'Next'}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  )
}

function MCQField({ 
  label, 
  value, 
  onChange, 
  options, 
  required = false 
}: { 
  label: string
  value: string
  onChange: (value: string) => void
  options: string[]
  required?: boolean
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-3">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => onChange(option)}
            className={`p-3 text-left rounded-xl border-2 transition-all ${
              value === option
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-gray-300 text-gray-700'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  )
}

function MultiSelectField({ 
  label, 
  values, 
  onChange, 
  options 
}: { 
  label: string
  values: string[]
  onChange: (value: string) => void
  options: string[]
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-3">
        {label}
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => onChange(option)}
            className={`p-3 text-left rounded-xl border-2 transition-all ${
              values.includes(option)
                ? 'border-green-500 bg-green-50 text-green-700'
                : 'border-gray-200 hover:border-gray-300 text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                values.includes(option) ? 'border-green-500 bg-green-500' : 'border-gray-300'
              }`}>
                {values.includes(option) && <Check className="w-3 h-3 text-white" />}
              </div>
              {option}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}