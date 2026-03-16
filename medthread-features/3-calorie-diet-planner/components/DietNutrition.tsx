import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Calendar, Coffee, Moon, Sun, Utensils, RefreshCw, ChevronDown, Check, AlertCircle } from 'lucide-react';
import { dietPlanService, type DailyMeal, type Meal } from '@/services/dietPlanService';
import { authService, type UserProfile } from '@/services/authService';
import { useTranslation } from '@/hooks/useTranslation';

type Mode = 'landing' | 'day_input' | 'meal_input' | 'day_result' | 'meal_result';

// ... imports
export const DietNutrition = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [mode, setMode] = useState<Mode>('landing');
  const [targetCalories, setTargetCalories] = useState<string>('');
  const [selectedMealType, setSelectedMealType] = useState<string>('lunch');

  // New State for Preferences
  const [dietType, setDietType] = useState<'veg' | 'non-veg' | 'vegan'>('veg');


  const [dailyPlan, setDailyPlan] = useState<DailyMeal | null>(null);
  const [singleMeal, setSingleMeal] = useState<Meal | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
  }, []);

  // Handle plan generation
  const handleGenerateDay = () => {
    const cals = parseInt(targetCalories);
    if (isNaN(cals) || cals < 500 || cals > 5000) {
      setError('Please enter a valid calorie count (500-5000)');
      return;
    }
    setLoading(true);
    setError('');

    // Simulate loading for better UX
    setTimeout(() => {
      const plan = dietPlanService.generateCustomPlan({
        mode: 'daily',
        targetCalories: cals,
        restrictions: user ? dietPlanService.getRestrictions(user) : [],
        dietType
      }) as DailyMeal;
      setDailyPlan(plan);
      setMode('day_result');
      setLoading(false);
    }, 800);
  };

  const handleGenerateMeal = () => {
    const cals = parseInt(targetCalories);
    if (isNaN(cals) || cals < 100 || cals > 2000) {
      setError('Please enter a valid calorie count (100-2000)');
      return;
    }
    setLoading(true);
    setError('');

    setTimeout(() => {
      const meal = dietPlanService.generateCustomPlan({
        mode: 'single_meal',
        targetCalories: cals,
        mealType: selectedMealType as any,
        restrictions: user ? dietPlanService.getRestrictions(user) : [],
        dietType
      }) as Meal;
      setSingleMeal(meal);
      setMode('meal_result');
      setLoading(false);
    }, 800);
  };

  const handleRegenerateMeal = (type: string, currentName: string) => {
    // This is for the single meal view or a specific slot in daily view
    if (!targetCalories) return;

    // Pass current preferences to get suitable alternatives
    const alternatives = dietPlanService.getAlternativeMeals(
      type,
      parseInt(targetCalories),
      currentName,
      user ? dietPlanService.getRestrictions(user) : [],
      dietType
    );

    if (alternatives.length > 0) {
      if (mode === 'day_result' && dailyPlan) {
        const newPlan = { ...dailyPlan };
        if (type.toLowerCase() === 'breakfast') newPlan.breakfast = alternatives[0];
        else if (type.toLowerCase() === 'lunch') newPlan.lunch = alternatives[0];
        else if (type.toLowerCase() === 'dinner') newPlan.dinner = alternatives[0];
        else if (type.toLowerCase().includes('snack')) newPlan.snacks[0] = alternatives[0];
        setDailyPlan(newPlan);
      } else if (mode === 'meal_result') {
        setSingleMeal(alternatives[0]);
      }
    }
  };

  const calculateTotals = (meals: Meal[]) => {
    return meals.reduce((acc, meal) => ({
      calories: acc.calories + meal.calories,
      protein: acc.protein + meal.protein,
      carbs: acc.carbs + meal.carbs,
      fats: acc.fats + meal.fats,
    }), { calories: 0, protein: 0, carbs: 0, fats: 0 });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <div className="bg-white px-4 py-4 flex items-center gap-3 shadow-sm sticky top-0 z-10">
        <button
          onClick={() => {
            if (mode === 'landing') navigate('/home');
            else {
              setMode('landing');
              setError('');
              setTargetCalories('');
            }
          }}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>
        <h1 className="text-xl font-bold text-[#1E293B]">
          {mode === 'landing' ? 'Diet Plan' :
            mode.includes('day') ? 'Plan My Day' : 'Plan a Meal'}
        </h1>
      </div>

      <div className="p-4 max-w-2xl mx-auto">
        <AnimatePresence mode="wait">
          {mode === 'landing' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="bg-gradient-to-br from-[#059669] to-[#10B981] rounded-2xl p-6 text-white shadow-lg text-center">
                <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                  <Utensils className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-xl font-bold mb-2">My Diet Plan</h2>
                <p className="text-white/90 text-sm leading-relaxed">
                  Personalized meal suggestions based on your calorie goals and diet type.
                </p>
              </div>

              <div className="grid gap-4">
                <button
                  onClick={() => setMode('day_input')}
                  className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:border-[#059669] transition-colors group text-left"
                >
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg">Plan My Day</h3>
                    <p className="text-gray-500 text-sm">Full day meal plan</p>
                  </div>
                </button>

                <button
                  onClick={() => setMode('meal_input')}
                  className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:border-[#059669] transition-colors group text-left"
                >
                  <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Coffee className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg">Plan a Meal</h3>
                    <p className="text-gray-500 text-sm">Single meal suggestion</p>
                  </div>
                </button>
              </div>
            </motion.div>
          )}

          {(mode === 'day_input' || mode === 'meal_input') && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6"
            >
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {mode === 'day_input' ? 'Target Daily Calories' : 'Target Meal Calories'}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={targetCalories}
                    onChange={(e) => setTargetCalories(e.target.value)}
                    placeholder={mode === 'day_input' ? "e.g., 2000" : "e.g., 500"}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#059669] focus:bg-white transition-all font-medium text-lg"
                  />
                  <span className="absolute right-4 top-3.5 text-gray-400 font-medium">kcal</span>
                </div>
              </div>

              {/* Diet Type Selector */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Diet Type</label>
                <div className="grid grid-cols-3 gap-3">
                  {['Veg', 'Non-Veg', 'Vegan'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setDietType(type.toLowerCase() as 'veg' | 'non-veg' | 'vegan')}
                      className={`py-3 rounded-xl text-sm font-medium transition-all ${dietType === type.toLowerCase()
                        ? 'bg-green-600 text-white shadow-lg shadow-green-500/20'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>


              {mode === 'meal_input' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Meal Type</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['Breakfast', 'Lunch', 'Dinner', 'Snack'].map((type) => (
                      <button
                        key={type}
                        onClick={() => setSelectedMealType(type.toLowerCase())}
                        className={`py-3 rounded-xl text-sm font-medium transition-all ${selectedMealType === type.toLowerCase()
                          ? 'bg-[#059669] text-white shadow-lg shadow-green-500/20'
                          : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                          }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              <button
                onClick={mode === 'day_input' ? handleGenerateDay : handleGenerateMeal}
                disabled={loading || !targetCalories}
                className="w-full py-4 bg-[#059669] text-white rounded-xl font-bold text-lg shadow-lg shadow-green-500/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Generate Plan'
                )}
              </button>
            </motion.div>
          )}

          {mode === 'day_result' && dailyPlan && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              {(() => {
                const totals = calculateTotals([
                  dailyPlan.breakfast,
                  dailyPlan.lunch,
                  dailyPlan.dinner,
                  ...dailyPlan.snacks
                ]);
                return (
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-2">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Total Nutrition</p>
                        <p className="text-2xl font-bold text-[#059669]">{totals.calories} <span className="text-sm text-gray-400 font-normal">/ {targetCalories} kcal</span></p>
                      </div>
                      <button onClick={handleGenerateDay} className="text-[#059669] text-sm font-semibold hover:underline bg-green-50 px-3 py-1.5 rounded-lg">
                        Regenerate All
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-blue-50 p-2 rounded-lg">
                        <span className="block text-xs text-gray-500">Carbs</span>
                        <span className="font-bold text-blue-700">{totals.carbs}g</span>
                      </div>
                      <div className="bg-green-50 p-2 rounded-lg">
                        <span className="block text-xs text-gray-500">Protein</span>
                        <span className="font-bold text-green-700">{totals.protein}g</span>
                      </div>
                      <div className="bg-orange-50 p-2 rounded-lg">
                        <span className="block text-xs text-gray-500">Fats</span>
                        <span className="font-bold text-orange-700">{totals.fats}g</span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              <MealResultCard
                title="Breakfast"
                meal={dailyPlan.breakfast}
                icon={<Sun className="w-5 h-5 text-orange-500" />}
                onRegenerate={() => handleRegenerateMeal('breakfast', dailyPlan.breakfast.name)}
              />
              <MealResultCard
                title="Lunch"
                meal={dailyPlan.lunch}
                icon={<Sun className="w-5 h-5 text-yellow-500" />}
                onRegenerate={() => handleRegenerateMeal('lunch', dailyPlan.lunch.name)}
              />
              <MealResultCard
                title="Dinner"
                meal={dailyPlan.dinner}
                icon={<Moon className="w-5 h-5 text-blue-500" />}
                onRegenerate={() => handleRegenerateMeal('dinner', dailyPlan.dinner.name)}
              />
              {dailyPlan.snacks[0] && (
                <MealResultCard
                  title="Snack"
                  meal={dailyPlan.snacks[0]}
                  icon={<Coffee className="w-5 h-5 text-purple-500" />}
                  onRegenerate={() => handleRegenerateMeal('snack', dailyPlan.snacks[0].name)}
                />
              )}
            </motion.div>
          )}

          {mode === 'meal_result' && singleMeal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {(() => {
                const totals = calculateTotals([singleMeal]);
                return (
                  <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 mb-4 flex justify-between items-center">
                    <div>
                      <p className="text-xs text-gray-500 font-bold uppercase">Total Calculated</p>
                      <p className="text-lg font-bold text-[#059669]">{totals.calories} kcal</p>
                    </div>
                    <div className="flex gap-3 text-sm">
                      <span className="font-bold text-blue-600">{totals.carbs}g C</span>
                      <span className="font-bold text-green-600">{totals.protein}g P</span>
                      <span className="font-bold text-orange-600">{totals.fats}g F</span>
                    </div>
                  </div>
                );
              })()}

              <MealResultCard
                title={selectedMealType.charAt(0).toUpperCase() + selectedMealType.slice(1)}
                meal={singleMeal}
                icon={<Utensils className="w-5 h-5 text-[#059669]" />}
                expanded={true}
                onRegenerate={() => handleRegenerateMeal(selectedMealType, singleMeal.name)}
              />
              <button
                onClick={() => setMode('meal_input')}
                className="mt-6 w-full py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
              >
                Plan Another Meal
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const MealResultCard = ({ title, meal, icon, expanded = false, onRegenerate }: { title: string, meal: Meal, icon: any, expanded?: boolean, onRegenerate: () => void }) => {
  const [isExpanded, setIsExpanded] = useState(expanded);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
            {icon}
          </div>
          <div>
            <h4 className="font-bold text-gray-800">{title}</h4>
            <p className="text-sm text-gray-500">{meal.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-[#059669] bg-green-50 px-2 py-1 rounded-lg">
            {meal.calories} kcal
          </span>
          <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0 border-t border-gray-100">
              <div className="mt-4 flex flex-wrap gap-2 mb-4">
                {meal.ingredients.map((ing, i) => (
                  <span key={i} className="text-xs font-medium text-gray-600 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                    {ing}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="text-center p-2 bg-blue-50 rounded-lg">
                  <div className="text-xs text-gray-500">Carbs</div>
                  <div className="font-bold text-blue-700">{meal.carbs}g</div>
                </div>
                <div className="text-center p-2 bg-green-50 rounded-lg">
                  <div className="text-xs text-gray-500">Protein</div>
                  <div className="font-bold text-green-700">{meal.protein}g</div>
                </div>
                <div className="text-center p-2 bg-orange-50 rounded-lg">
                  <div className="text-xs text-gray-500">Fats</div>
                  <div className="font-bold text-orange-700">{meal.fats}g</div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); onRegenerate(); }}
                  className="flex-1 py-2 lg:py-1.5 flex items-center justify-center gap-2 text-sm font-medium text-[#059669] bg-green-50 border border-green-100 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Generate Alternative
                </button>
              </div>

              <p className="mt-3 text-[10px] text-gray-400 text-center flex items-center justify-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Suggestion only. Not medical advice.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


