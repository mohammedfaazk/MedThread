'use client'

import { motion } from 'framer-motion'
import { 
  Clock, 
  Utensils, 
  Target, 
  Save, 
  RefreshCw, 
  Info,
  Zap,
  Apple,
  Beef,
  Wheat
} from 'lucide-react'

interface Meal {
  name: string
  dishes: Array<{
    name: string
    calories: number
    description?: string
  }>
  totalCalories: number
  timeSlot: string
}

interface NutritionalInfo {
  protein: number
  carbs: number
  fats: number
  fiber: number
  sugar: number
}

interface DietPlan {
  id: string
  dailyCalorieGoal: number
  planData: {
    meals: Meal[]
    totalCalories: number
  }
  nutritionalInfo: NutritionalInfo
  dietaryNote: string
  generatedAt: string
  savedAt: string | null
  isActive: boolean
}

interface DietPlanCardProps {
  dietPlan: DietPlan
  onSave: () => void
  onRegenerate: () => void
}

export function DietPlanCard({ dietPlan, onSave, onRegenerate }: DietPlanCardProps) {
  const { planData, nutritionalInfo, dietaryNote, savedAt } = dietPlan

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">Your Personalized Diet Plan</h2>
            <p className="text-green-100 text-sm">
              Generated {new Date(dietPlan.generatedAt).toLocaleDateString()}
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{planData.totalCalories}</div>
            <div className="text-green-100 text-sm">Total Calories</div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={onSave}
            className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors"
          >
            <Save className="w-4 h-4" />
            {savedAt ? 'Saved' : 'Save Plan'}
          </button>
          <button
            onClick={onRegenerate}
            className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Regenerate
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Nutritional Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <NutrientCard
            icon={Beef}
            label="Protein"
            value={`${nutritionalInfo.protein}g`}
            color="red"
            percentage={Math.round((nutritionalInfo.protein * 4 / planData.totalCalories) * 100)}
          />
          <NutrientCard
            icon={Wheat}
            label="Carbs"
            value={`${nutritionalInfo.carbs}g`}
            color="orange"
            percentage={Math.round((nutritionalInfo.carbs * 4 / planData.totalCalories) * 100)}
          />
          <NutrientCard
            icon={Zap}
            label="Fats"
            value={`${nutritionalInfo.fats}g`}
            color="yellow"
            percentage={Math.round((nutritionalInfo.fats * 9 / planData.totalCalories) * 100)}
          />
          <NutrientCard
            icon={Apple}
            label="Fiber"
            value={`${nutritionalInfo.fiber}g`}
            color="green"
            percentage={Math.round((nutritionalInfo.fiber / 25) * 100)}
          />
        </div>

        {/* Dietary Note */}
        {dietaryNote && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-blue-900 mb-1">Dietary Adjustments</h4>
                <p className="text-blue-800 text-sm">{dietaryNote}</p>
              </div>
            </div>
          </div>
        )}

        {/* Meals */}
        <div className="space-y-6">
          {planData.meals.map((meal, index) => (
            <motion.div
              key={meal.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <MealCard meal={meal} />
            </motion.div>
          ))}
        </div>

        {/* Daily Summary */}
        <div className="mt-8 p-6 bg-gray-50 rounded-xl">
          <h4 className="font-bold text-gray-900 mb-4">Daily Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <SummaryItem label="Total Meals" value="4" />
            <SummaryItem label="Total Calories" value={planData.totalCalories.toString()} />
            <SummaryItem label="Protein" value={`${nutritionalInfo.protein}g`} />
            <SummaryItem label="Fiber" value={`${nutritionalInfo.fiber}g`} />
          </div>
        </div>
      </div>
    </div>
  )
}

function NutrientCard({ 
  icon: Icon, 
  label, 
  value, 
  color, 
  percentage 
}: { 
  icon: any
  label: string
  value: string
  color: string
  percentage: number
}) {
  const colorClasses = {
    red: 'bg-red-50 text-red-700 border-red-200',
    orange: 'bg-orange-50 text-orange-700 border-orange-200',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    green: 'bg-green-50 text-green-700 border-green-200'
  }

  return (
    <div className={`p-4 rounded-xl border ${colorClasses[color as keyof typeof colorClasses]}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4" />
        <span className="text-xs font-semibold uppercase tracking-wide">{label}</span>
      </div>
      <div className="text-lg font-bold">{value}</div>
      <div className="text-xs opacity-75">{percentage}% of total</div>
    </div>
  )
}

function MealCard({ meal }: { meal: Meal }) {
  const mealIcons = {
    'Breakfast': '🌅',
    'Lunch': '☀️',
    'Evening Snack': '🌆',
    'Dinner': '🌙'
  }

  return (
    <div className="border border-gray-200 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{mealIcons[meal.name as keyof typeof mealIcons] || '🍽️'}</span>
          <div>
            <h3 className="text-lg font-bold text-gray-900">{meal.name}</h3>
            <p className="text-sm text-gray-500">{meal.timeSlot}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold text-green-600">{meal.totalCalories}</div>
          <div className="text-xs text-gray-500">calories</div>
        </div>
      </div>

      <div className="space-y-3">
        {meal.dishes.map((dish, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">{dish.name}</h4>
              {dish.description && (
                <p className="text-sm text-gray-600 mt-1">{dish.description}</p>
              )}
            </div>
            <div className="text-sm font-semibold text-gray-700">
              {dish.calories} cal
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="text-lg font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-500 font-semibold uppercase tracking-wide">{label}</div>
    </div>
  )
}