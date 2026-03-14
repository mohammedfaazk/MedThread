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
    } catch (error) {
      console.error('Failed to save health profile:', error)
      alert('Failed to save health profile. Please try again.')
    }
  }

  const generateDietPlan = async () => {
    if (!calorieGoal || !healthProfile) return
    
    setGenerating(true)
    try {
      const token = localStorage.getItem('auth_token')
      const response = await axios.post(`${API_URL}/api/v1/diet-plan/generate`, {
        dailyCalorieGoal: parseInt(calorieGoal)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (response.data.success) {
        setCurrentDietPlan(response.data.data)
      }
    } catch (error) {
      console.error('Failed to generate diet plan:', error)
      alert('Failed to generate diet plan. Please try again.')
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

        {!healthProfile ? (
          <HealthProfileSetup onSetupClick={() => setShowMCQ(true)} />
        ) : (
          <DietPlannerInterface
            healthProfile={healthProfile}
            currentDietPlan={currentDietPlan}
            calorieGoal={calorieGoal}
            setCalorieGoal={setCalorieGoal}
            generating={generating}
            onGeneratePlan={generateDietPlan}
            onUpdateProfile={() => setShowMCQ(true)}
            onSavePlan={saveDietPlan}
          />
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
  calorieGoal, 
  setCalorieGoal, 
  generating, 
  onGeneratePlan, 
  onUpdateProfile, 
  onSavePlan 
}: {
  healthProfile: HealthProfile
  currentDietPlan: DietPlan | null
  calorieGoal: string
  setCalorieGoal: (value: string) => void
  generating: boolean
  onGeneratePlan: () => void
  onUpdateProfile: () => void
  onSavePlan: () => void
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
          <ProfileStat label="Age Group" value={healthProfile.ageGroup} />
          <ProfileStat label="Diet Type" value={healthProfile.dietType} />
          <ProfileStat label="Goal" value={healthProfile.primaryGoal} />
          <ProfileStat label="Activity" value={healthProfile.activityLevel} />
        </div>
      </motion.div>

      {/* Diet Plan Generator */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-lg p-6"
      >
        <h2 className="text-xl font-bold text-gray-900 mb-6">Generate Your Diet Plan</h2>
        
        <div className="flex items-end gap-4 mb-6">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Daily Calorie Goal
            </label>
            <input
              type="number"
              value={calorieGoal}
              onChange={(e) => setCalorieGoal(e.target.value)}
              placeholder="e.g., 1800"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          <button
            onClick={onGeneratePlan}
            disabled={!calorieGoal || generating}
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-semibold hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            {generating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Plan
              </>
            )}
          </button>
        </div>
        
        <div className="text-sm text-gray-600 bg-blue-50 p-4 rounded-xl">
          <p className="font-semibold mb-1">AI will consider:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Your medical conditions and dietary restrictions</li>
            <li>Cultural food preferences ({healthProfile.nationality})</li>
            <li>Cooking access level ({healthProfile.cookingAccess})</li>
            <li>Health goals ({healthProfile.primaryGoal})</li>
          </ul>
        </div>
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