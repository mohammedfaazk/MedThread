'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useJWTAuth } from '@/context/JWTAuthContext'
import { NavbarEnhanced } from '@/components/NavbarEnhanced'
import { HealthProfileMCQ } from '@/components/HealthProfileMCQ'
import { DietPlanCard } from '@/components/DietPlanCard'
import { motion } from 'framer-motion'
import { 
  Utensils, 
  User, 
  Sparkles, 
  Clock, 
  Target,
  RefreshCw,
  Save,
  Settings
} from 'lucide-react'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface HealthProfile {
  id: string
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
  completedAt: string
}

interface DietPlan {
  id: string
  dailyCalorieGoal: number
  planData: any
  nutritionalInfo: any
  dietaryNote: string
  generatedAt: string
  savedAt: string | null
  isActive: boolean
}

export default function DietPlannerPage() {
  const { user, role, loading } = useJWTAuth()
  const router = useRouter()
  const [healthProfile, setHealthProfile] = useState<HealthProfile | null>(null)
  const [showMCQ, setShowMCQ] = useState(false)
  const [currentDietPlan, setCurrentDietPlan] = useState<DietPlan | null>(null)
  const [calorieGoal, setCalorieGoal] = useState('')
  const [generating, setGenerating] = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    if (!loading && (!user || role !== 'PATIENT')) {
      router.push('/')
    }
  }, [user, role, loading, router])

  useEffect(() => {
    if (user && role === 'PATIENT') {
      loadHealthProfile()
    }
  }, [user, role])

  const loadHealthProfile = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      const response = await axios.get(`${API_URL}/api/v1/health-profile`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (response.data.success && response.data.data) {
        setHealthProfile(response.data.data)
        loadActiveDietPlan()
      } else {
        // No health profile yet — initialise an empty one (never overwrites existing data)
        try {
          await axios.post(`${API_URL}/api/v1/health-profile/init`, {}, {
            headers: { Authorization: `Bearer ${token}` }
          })
          const retry = await axios.get(`${API_URL}/api/v1/health-profile`, {
            headers: { Authorization: `Bearer ${token}` }
          })
          if (retry.data.success && retry.data.data) {
            setHealthProfile(retry.data.data)
            loadActiveDietPlan()
          }
        } catch {
          // Init failed — leave healthProfile null, MCQ gate will show
        }
      }
    } catch (error) {
      console.error('Failed to load health profile:', error)
    } finally {
      setFetching(false)
    }
  }

  const loadActiveDietPlan = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      const response = await axios.get(`${API_URL}/api/v1/diet-plan/active`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (response.data.success && response.data.data) {
        setCurrentDietPlan(response.data.data)
        setCalorieGoal(response.data.data.dailyCalorieGoal.toString())
      }
    } catch (error) {
      console.error('Failed to load active diet plan:', error)
    }
  }

  if (loading || fetching) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium">Loading your diet planner...</p>
        </div>
      </div>
    )
  }

  const handleHealthProfileComplete = async (data: any) => {
    try {
      const token = localStorage.getItem('auth_token')
      const response = await axios.post(`${API_URL}/api/v1/health-profile`, data, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (response.data.success) {
        setHealthProfile(response.data.data)
        setShowMCQ(false)
      }
    } catch (error: any) {
      const msg = error?.response?.data?.error || 'Failed to save health profile. Please try again.'
      console.error('Failed to save health profile:', error)
      alert(msg)
    }
  }

  const generateDietPlan = async () => {
    if (!healthProfile) return
    
    setGenerating(true)
    try {
      const token = localStorage.getItem('auth_token')
      const response = await axios.post(`${API_URL}/api/v1/diet-plan/generate`, {
        dailyCalorieGoal: parseInt(calorieGoal) || 2000
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (response.data.success) {
        setCurrentDietPlan(response.data.data)
        setCalorieGoal(response.data.data.dailyCalorieGoal.toString())
      } else {
        // Surface missing-fields error clearly
        alert(response.data.error || 'Failed to generate diet plan.')
      }
    } catch (error: any) {
      const msg = error?.response?.data?.error || 'Failed to generate diet plan. Please try again.'
      alert(msg)
      console.error('Failed to generate diet plan:', error)
    } finally {
      setGenerating(false)
    }
  }

  const saveDietPlan = async () => {
    if (!currentDietPlan) return
    
    try {
      const token = localStorage.getItem('auth_token')
      await axios.post(`${API_URL}/api/v1/diet-plan/${currentDietPlan.id}/save`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      setCurrentDietPlan(prev => prev ? { ...prev, savedAt: new Date().toISOString() } : null)
      alert('Diet plan saved successfully!')
    } catch (error) {
      console.error('Failed to save diet plan:', error)
      alert('Failed to save diet plan. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <NavbarEnhanced />
      
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center">
              <Utensils className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">AI Diet Planner</h1>
            <div className="flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
              <Sparkles className="w-4 h-4" />
              AI-Powered
            </div>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Get personalized meal plans tailored to your health conditions, cultural preferences, and dietary goals.
          </p>
        </motion.div>

        {healthProfile ? (
          <DietPlannerInterface
            healthProfile={healthProfile}
            currentDietPlan={currentDietPlan}
            generating={generating}
            onGeneratePlan={generateDietPlan}
            onUpdateProfile={() => setShowMCQ(true)}
            onSavePlan={saveDietPlan}
            isMinimalProfile={!healthProfile.ageGroup || !healthProfile.dietType || !healthProfile.primaryGoal}
          />
        ) : (
          <HealthProfileSetup onSetupClick={() => setShowMCQ(true)} />
        )}
      </div>

      {showMCQ && (
        <HealthProfileMCQ
          onComplete={handleHealthProfileComplete}
          onClose={() => setShowMCQ(false)}
          initialData={healthProfile || undefined}
        />
      )}
    </div>
  )
}


function HealthProfileSetup({ onSetupClick }: { onSetupClick: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg p-8 text-center"
    >
      <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <User className="w-10 h-10 text-blue-600" />
      </div>
      
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Complete Your Health Profile</h2>
      <p className="text-gray-600 mb-8 max-w-md mx-auto">
        To generate personalized diet plans, we need to understand your health conditions, 
        dietary preferences, and cultural background.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="p-4 bg-gray-50 rounded-xl">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-2">
            <span className="text-white font-bold text-sm">1</span>
          </div>
          <p className="text-sm font-semibold text-gray-700">Basic Bio & Health</p>
        </div>
        <div className="p-4 bg-gray-50 rounded-xl">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-2">
            <span className="text-white font-bold text-sm">2</span>
          </div>
          <p className="text-sm font-semibold text-gray-700">Medical Conditions</p>
        </div>
        <div className="p-4 bg-gray-50 rounded-xl">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-2">
            <span className="text-white font-bold text-sm">3</span>
          </div>
          <p className="text-sm font-semibold text-gray-700">Diet & Goals</p>
        </div>
      </div>
      
      <button
        onClick={onSetupClick}
        className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg"
      >
        Start Health Assessment (3 min)
      </button>
    </motion.div>
  )
}

function DietPlannerInterface({ 
  healthProfile, 
  currentDietPlan, 
  generating, 
  onGeneratePlan, 
  onUpdateProfile, 
  onSavePlan,
  isMinimalProfile = false,
}: {
  healthProfile: HealthProfile
  currentDietPlan: DietPlan | null
  generating: boolean
  onGeneratePlan: () => void
  onUpdateProfile: () => void
  onSavePlan: () => void
  isMinimalProfile?: boolean
}) {
  return (
    <div className="space-y-8">
      {/* Health Profile Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Your Health Profile</h2>
          <button
            onClick={onUpdateProfile}
            className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
          >
            <Settings className="w-4 h-4" />
            Update
          </button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <ProfileStat label="Age Group" value={healthProfile.ageGroup || 'Not set'} />
          <ProfileStat label="Diet Type" value={healthProfile.dietType || 'Not set'} />
          <ProfileStat label="Goal" value={healthProfile.primaryGoal || 'Not set'} />
          <ProfileStat label="Activity" value={healthProfile.activityLevel || 'Not set'} />
          <ProfileStat label="Nationality" value={healthProfile.nationality || 'Not set'} />
          <ProfileStat label="Cooking" value={healthProfile.cookingAccess || 'Not set'} />
          <ProfileStat label="Sleep" value={healthProfile.sleepHours ? `${healthProfile.sleepHours} hrs` : 'Not set'} />
          <ProfileStat label="Water" value={healthProfile.waterIntake || 'Not set'} />
        </div>

        {Array.isArray(healthProfile.medicalConditions) && healthProfile.medicalConditions.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-xs font-semibold text-gray-500 self-center">Conditions:</span>
            {(healthProfile.medicalConditions as string[]).map((c) => (
              <span key={c} className="px-2 py-0.5 bg-red-50 text-red-700 border border-red-200 rounded-full text-xs font-medium">{c}</span>
            ))}
          </div>
        )}
        {Array.isArray(healthProfile.foodAllergies) && healthProfile.foodAllergies.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="text-xs font-semibold text-gray-500 self-center">Allergies:</span>
            {(healthProfile.foodAllergies as string[]).map((a) => (
              <span key={a} className="px-2 py-0.5 bg-orange-50 text-orange-700 border border-orange-200 rounded-full text-xs font-medium">{a}</span>
            ))}
          </div>
        )}

        {isMinimalProfile && (
          <div className="mt-4 flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <span className="text-xl">💡</span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-800">Make your plan more personalised</p>
              <p className="text-xs text-amber-700 mt-0.5">
                Add your age, diet type, cultural background and goals for a much more accurate AI diet plan.
              </p>
            </div>
            <button
              onClick={onUpdateProfile}
              className="shrink-0 px-3 py-1.5 bg-amber-500 text-white rounded-lg text-xs font-semibold hover:bg-amber-600 transition"
            >
              Fill Details
            </button>
          </div>
        )}
      </motion.div>

      {/* Diet Plan Generator */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-lg p-6"
      >
        <h2 className="text-xl font-bold text-gray-900 mb-4">Generate Your Diet Plan</h2>

        {currentDietPlan && (
          <div className="mb-4 px-4 py-2 bg-green-50 border border-green-200 rounded-xl text-sm text-green-800">
            Current plan: <span className="font-semibold">{currentDietPlan.dailyCalorieGoal} kcal/day</span> — regenerate to refresh
          </div>
        )}

        <div className="mb-6 text-sm text-gray-600 bg-blue-50 p-4 rounded-xl">
          <p className="font-semibold mb-2">AI will automatically calculate and apply:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Calories via Mifflin-St Jeor BMR × activity multiplier × goal adjustment</li>
            <li>Macros (protein/carbs/fats) reconciled to calorie target</li>
            {healthProfile.medicalConditions?.length > 0
              ? <li>Medical dietary rules for: {(healthProfile.medicalConditions as string[]).join(', ')}</li>
              : <li>Standard healthy diet guidelines</li>
            }
            {healthProfile.nationality && <li>Cultural foods: {healthProfile.nationality}</li>}
            {healthProfile.cookingAccess && <li>Cooking constraint: {healthProfile.cookingAccess}</li>}
            {healthProfile.primaryGoal && <li>Goal: {healthProfile.primaryGoal}</li>}
          </ul>
          {(!healthProfile.weightRange || !healthProfile.heightRange || !healthProfile.biologicalSex) && (
            <p className="mt-3 text-xs text-amber-700 font-semibold bg-amber-50 px-3 py-2 rounded-lg">
              ⚠️ Weight, height, or sex missing — update your profile for accurate calorie calculation.
            </p>
          )}
        </div>

        <button
          onClick={onGeneratePlan}
          disabled={generating}
          className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-semibold hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          {generating ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Generating personalised plan...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate My Diet Plan
            </>
          )}
        </button>
      </motion.div>

      {/* Diet Plan Display */}
      {currentDietPlan && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <DietPlanCard 
            dietPlan={currentDietPlan} 
            onSave={onSavePlan}
            onRegenerate={onGeneratePlan}
          />
        </motion.div>
      )}
    </div>
  )
}

function ProfileStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">{label}</p>
      <p className="text-sm font-bold text-gray-900 mt-1">{value}</p>
    </div>
  )
}