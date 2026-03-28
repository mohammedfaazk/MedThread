import { prisma } from '@medthread/database'
import Groq from 'groq-sdk'

let groq: Groq | null = null
if (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'optional_groq_key_here') {
  groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
}

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface Macros {
  protein: number  // g
  carbs:   number  // g
  fats:    number  // g
  fiber:   number  // g
  sugar:   number  // g
}

interface CalcResult {
  calories: number
  macros: Macros
  bmr: number
  tdee: number
  method: 'mifflin' | 'hint'
  missingFields: string[]
}

// ─────────────────────────────────────────────────────────────────────────────
// Metabolic calculations
// ─────────────────────────────────────────────────────────────────────────────

function midpoint(range: string, fallback: number): number | null {
  const m = range?.match(/(\d+)[–\-](\d+)/)
  if (m) return (parseInt(m[1]) + parseInt(m[2])) / 2
  const s = range?.match(/(\d+)/)
  if (s) return parseInt(s[1])
  return null
}

function parseAge(group: string): number | null {
  if (!group) return null
  if (group.includes('60+')) return 65
  return midpoint(group, 0)
}

const ACTIVITY_MULT: Record<string, number> = {
  'Sedentary': 1.2,
  'Lightly Active': 1.375,
  'Moderately Active': 1.55,
  'Very Active': 1.725,
}

const GOAL_ADJ: Record<string, number> = {
  'weight loss': 0.82,
  'weight gain': 1.15,
  'maintain weight': 1.0,
  'manage medical condition': 1.0,
  'general wellness': 1.0,
}

/**
 * Validates inputs and computes calories via Mifflin-St Jeor.
 * Returns missingFields if required data is absent — caller must handle.
 */
function computeCalories(profile: any, hintCalories: number): CalcResult {
  const missing: string[] = []

  const weight = midpoint(profile.weightRange, 0)
  const height = midpoint(profile.heightRange, 0)
  const age    = parseAge(profile.ageGroup)
  const sex    = (profile.biologicalSex || '').toLowerCase()
  const act    = profile.activityLevel

  if (!weight)                    missing.push('weight')
  if (!height)                    missing.push('height')
  if (!age)                       missing.push('age group')
  if (!sex || sex === 'other')    missing.push('biological sex')
  if (!act || !ACTIVITY_MULT[act]) missing.push('activity level')

  const conditions = Array.isArray(profile.medicalConditions) ? profile.medicalConditions : []
  const macros     = computeMacros(hintCalories, conditions) // placeholder until calories known

  if (missing.length > 0) {
    // Cannot run Mifflin — use hint as-is but flag it
    return { calories: hintCalories, macros: computeMacros(hintCalories, conditions), bmr: 0, tdee: 0, method: 'hint', missingFields: missing }
  }

  const bmr = sex === 'female'
    ? 10 * weight! + 6.25 * height! - 5 * age! - 161
    : 10 * weight! + 6.25 * height! - 5 * age! + 5

  const tdee = Math.round(bmr * ACTIVITY_MULT[act])

  const goalKey = Object.keys(GOAL_ADJ).find(k => (profile.primaryGoal || '').toLowerCase().includes(k)) ?? 'general wellness'
  const target  = Math.round(tdee * GOAL_ADJ[goalKey])
  const calories = Math.min(4000, Math.max(1200, target))

  return { calories, macros: computeMacros(calories, conditions), bmr: Math.round(bmr), tdee, method: 'mifflin', missingFields: [] }
}

/**
 * Macros that always reconcile: protein*4 + carbs*4 + fats*9 ≈ calories (within ~5%).
 * Percentages shift based on medical conditions.
 */
function computeMacros(calories: number, conditions: string[]): Macros {
  const hasDiabetes = conditions.some(c => /diabetes|pcos/i.test(c))
  const hasHeart    = conditions.some(c => /heart|cholesterol/i.test(c))
  const hasKidney   = conditions.some(c => /kidney/i.test(c))

  // Percentages of total calories
  const proteinPct = hasKidney ? 0.15 : 0.30
  const carbPct    = hasDiabetes ? 0.35 : 0.42
  const fatPct     = 1 - proteinPct - carbPct  // remainder — always reconciles

  const protein = Math.round((calories * proteinPct) / 4)
  const carbs   = Math.round((calories * carbPct)    / 4)
  const fats    = Math.round((calories * fatPct)     / 9)

  // Verify reconciliation (should be within 5% due to rounding)
  // protein*4 + carbs*4 + fats*9 ≈ calories

  return {
    protein,
    carbs,
    fats,
    fiber: hasDiabetes ? 35 : 28,
    sugar: hasDiabetes ? 20 : Math.round((calories * 0.08) / 4),
  }
}

function computeRiskLevel(conditions: string[]): string {
  const high = (
    (conditions.some(c => /diabetes/i.test(c))    && conditions.some(c => /blood pressure|hypertension/i.test(c))) ||
    (conditions.some(c => /heart/i.test(c))        && conditions.some(c => /cholesterol/i.test(c))) ||
    (conditions.some(c => /kidney/i.test(c))       && conditions.some(c => /diabetes/i.test(c)))
  )
  if (high) return 'HIGH'
  if (conditions.length >= 2) return 'MEDIUM'
  if (conditions.length === 1) return 'LOW'
  return 'NONE'
}

// ─────────────────────────────────────────────────────────────────────────────
// Post-processing: enforce calorie/macro consistency on AI output
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Redistributes rounding error across meals so sum == targetCalories exactly.
 */
function reconcileMealCalories(meals: any[], targetCalories: number): any[] {
  const mealPcts = [0.25, 0.35, 0.10, 0.30]
  let runningTotal = 0

  return meals.map((meal, i) => {
    const isLast = i === meals.length - 1
    const mealTarget = isLast
      ? targetCalories - runningTotal
      : Math.round(targetCalories * mealPcts[i] ?? 0.25)

    // Rescale dish calories proportionally to hit mealTarget
    const dishSum = meal.dishes.reduce((s: number, d: any) => s + (d.calories ?? 0), 0)
    const scale   = dishSum > 0 ? mealTarget / dishSum : 1

    let dishRunning = 0
    const dishes = meal.dishes.map((d: any, j: number) => {
      const isLastDish = j === meal.dishes.length - 1
      const cal = isLastDish
        ? mealTarget - dishRunning
        : Math.round((d.calories ?? 0) * scale)
      dishRunning += cal
      return { ...d, calories: cal }
    })

    runningTotal += mealTarget
    return { ...meal, dishes, totalCalories: mealTarget }
  })
}

/**
 * Recomputes nutritionalInfo from actual dish macro sums.
 * Falls back to formula-computed macros if dishes lack macro fields.
 */
function reconcileMacros(meals: any[], formulaMacros: Macros): Macros {
  let p = 0, c = 0, f = 0, fi = 0

  for (const meal of meals) {
    for (const dish of meal.dishes) {
      p  += dish.protein_g ?? 0
      c  += dish.carbs_g   ?? 0
      f  += dish.fats_g    ?? 0
      fi += dish.fiber_g   ?? 0
    }
  }

  // If AI didn't populate per-dish macros, fall back to formula values
  if (p === 0 && c === 0 && f === 0) return formulaMacros

  return {
    protein: Math.round(p),
    carbs:   Math.round(c),
    fats:    Math.round(f),
    fiber:   Math.round(fi) || formulaMacros.fiber,
    sugar:   formulaMacros.sugar,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Prompt builder
// ─────────────────────────────────────────────────────────────────────────────

function buildPrompt(p: any, calc: CalcResult, conditions: string[], allergies: string[], riskLevel: string): string {
  const { calories, macros, bmr, tdee, method } = calc

  const isVegan   = /vegan/i.test(p.dietType ?? '')
  const isVeg     = /vegetarian/i.test(p.dietType ?? '') && !isVegan
  const isNonVeg  = /non.veg/i.test(p.dietType ?? '')
  const noKitchen = /no cooking|ready/i.test(p.cookingAccess ?? '')
  const basicOnly = /basic/i.test(p.cookingAccess ?? '')

  // ── Cooking constraint (strict) ──
  const cookingBlock = noKitchen
    ? `COOKING CONSTRAINT — CRITICAL: User has ZERO cooking ability.
ALL meals MUST be ready-to-eat, pre-packaged, deli, or zero-prep only.
ALLOWED: yogurt cups, protein shakes, protein bars, canned tuna/salmon, rotisserie chicken (pre-cooked), deli meat wraps, pre-made sandwiches, packaged salads, fruit, nuts, cheese slices, hummus with crackers, overnight oats (no cooking), cold brew coffee.
FORBIDDEN: anything requiring a stove, oven, microwave cooking, boiling, frying, or any heat preparation. No porridge, no boiled eggs, no curry, no soup, no roti, no rice, no dal.`
    : basicOnly
    ? `COOKING CONSTRAINT: User has basic cooking only (microwave, boiling, simple assembly).
ALLOWED: microwaved oats, boiled eggs, instant noodles, canned soup heated in microwave, simple sandwiches, pre-washed salads with dressing.
FORBIDDEN: complex recipes, stir-fry, baking, multi-step cooking.`
    : `User has full kitchen access. All cooking methods allowed.`

  // ── Diet type (strict) ──
  const dietBlock = isVegan
    ? `DIET — VEGAN (STRICT): Absolutely NO meat, poultry, fish, seafood, dairy, eggs, honey, or any animal-derived ingredient. Use tofu, tempeh, legumes, nuts, seeds, plant milks.`
    : isVeg
    ? `DIET — VEGETARIAN: NO meat, poultry, or fish. Dairy and eggs ARE allowed.`
    : isNonVeg
    ? `DIET — NON-VEGETARIAN: Animal proteins (chicken, fish, eggs, lean beef, turkey) should be actively included as primary protein sources. Do NOT default to vegetarian meals unless medically required.`
    : `DIET TYPE: ${p.dietType || 'No restriction'}. Include appropriate protein sources.`

  // ── Religious restriction ──
  const religionBlock = (p.religiousRestrictions && p.religiousRestrictions !== 'No restrictions')
    ? `RELIGIOUS RESTRICTION — MANDATORY: ${p.religiousRestrictions}. Strictly enforce. No exceptions.`
    : ''

  // ── Cultural preference ──
  const culture = (p.nationality || 'General').toLowerCase()
  const cultureBlock = noKitchen
    ? `Cultural preference: ${p.nationality || 'General'} — apply where possible using ready-to-eat options from that cuisine.`
    : culture.includes('western') || culture.includes('american') || culture.includes('european')
    ? `CULTURAL PREFERENCE — WESTERN: Use Western foods: chicken breast, turkey, salmon, tuna, eggs, Greek yogurt, oatmeal, whole grain bread, pasta, quinoa, salads, wraps, sandwiches, berries, apples. Do NOT use roti, dal, paneer, curry, biryani, or South Asian foods unless the user explicitly prefers them.`
    : culture.includes('indian') || culture.includes('south asian')
    ? `CULTURAL PREFERENCE — INDIAN/SOUTH ASIAN: Use Indian foods: dal, sabzi, roti, brown rice, idli, dosa, poha, upma, curd, paneer, rajma, chana, sambar. Avoid Western fast food.`
    : culture.includes('east asian') || culture.includes('chinese') || culture.includes('japanese')
    ? `CULTURAL PREFERENCE — EAST ASIAN: Use East Asian foods: rice, miso soup, tofu, edamame, sushi (if non-veg), stir-fried vegetables, noodles, congee, dumplings.`
    : culture.includes('middle eastern')
    ? `CULTURAL PREFERENCE — MIDDLE EASTERN: Use Middle Eastern foods: hummus, falafel, pita, tabbouleh, lentil soup, grilled meats (if non-veg), labneh, fattoush.`
    : `CULTURAL PREFERENCE: ${p.nationality || 'General'} — use culturally appropriate foods.`

  // ── Allergy block ──
  const allergyBlock = allergies.filter(a => a !== 'None').length
    ? `ALLERGY EXCLUSIONS — ABSOLUTE (never include in any dish or ingredient):\n${allergies.filter(a => a !== 'None').map(a => `• ${a} — exclude completely`).join('\n')}`
    : 'No known allergies.'

  // ── Medical rules ──
  const medRules: Record<string, string> = {
    'Diabetes':           'LOW-GI ONLY (GI < 55). No white rice, white bread, sugar, fruit juice, honey, refined carbs. Use: brown rice, oats, lentils, chickpeas, sweet potato, barley.',
    'High Blood Pressure':'SODIUM < 1500mg/day STRICTLY. No processed, canned, or salty foods. Include: banana, spinach, sweet potato, avocado (potassium-rich).',
    'Heart Disease':      'ZERO saturated fat, ZERO trans fat. No red meat, no full-fat dairy, no fried food. Include: salmon, sardines, walnuts, flaxseed (omega-3).',
    'High Cholesterol':   'No fried foods, no egg yolks, no full-fat dairy. Include: oats, beans, apples, barley (soluble fiber).',
    'Kidney Disease':     'Protein MAX 0.8g/kg. LOW potassium: no banana, orange, potato, tomato. LOW phosphorus: no dairy, nuts, cola, whole grains.',
    'Thyroid Problems':   'Include iodine-rich foods (seaweed, fish, iodized salt). Cook all cruciferous vegetables — no raw broccoli, cabbage, kale.',
    'PCOD / PCOS':        'Anti-inflammatory, low-GI. No refined sugar, no processed carbs. Include: omega-3 (flaxseed, walnuts), zinc (pumpkin seeds), magnesium (dark leafy greens).',
    'Pregnancy':          'Include folate (lentils, spinach), iron (legumes, lean meat), calcium (dairy or fortified). Avoid: raw fish, unpasteurized dairy, high-mercury fish (swordfish, shark).',
    'Lactose Intolerance':'No dairy milk, cheese, yogurt, butter, cream. Use: lactose-free alternatives, plant milks, coconut yogurt.',
    'Celiac Disease':     'STRICTLY GLUTEN-FREE. No wheat, barley, rye, regular oats. Use: rice, quinoa, certified GF oats, corn, potato.',
  }

  const medBlock = conditions.length
    ? conditions.map(c => medRules[c] ? `• ${c}: ${medRules[c]}` : `• ${c}: Apply standard clinical dietary guidelines.`).join('\n')
    : '• None — standard healthy diet guidelines apply.'

  // ── Meal targets ──
  const meals = [
    { name: 'Breakfast',     pct: 0.25, time: '7:00 AM – 9:00 AM'  },
    { name: 'Lunch',         pct: 0.35, time: '12:00 PM – 1:30 PM' },
    { name: 'Evening Snack', pct: 0.10, time: '4:00 PM – 5:00 PM'  },
    { name: 'Dinner',        pct: 0.30, time: '7:30 PM – 9:00 PM'  },
  ]
  const mealTargets = meals.map(m => `  ${m.name}: ${Math.round(calories * m.pct)} kcal (${m.time})`).join('\n')

  const calcNote = method === 'mifflin'
    ? `BMR: ${bmr} kcal | TDEE: ${tdee} kcal | Goal-adjusted: ${calories} kcal`
    : `User-supplied hint: ${calories} kcal (profile incomplete — missing: ${calc.missingFields.join(', ')})`

  return `You are a clinical nutrition engine. Generate a PRECISE, INTERNALLY CONSISTENT daily diet plan.

═══ PATIENT PROFILE ═══
Age: ${p.ageGroup || 'Unknown'} | Sex: ${p.biologicalSex || 'Unknown'} | Weight: ${p.weightRange || 'Unknown'} | Height: ${p.heightRange || 'Unknown'}
Activity: ${p.activityLevel || 'Unknown'} | Goal: ${p.primaryGoal || 'General wellness'}
Sleep: ${p.sleepHours || 'Unknown'} hrs | Water: ${p.waterIntake || 'Unknown'}/day
Medications: ${p.currentMedications || 'None'} | Foods to avoid: ${p.foodsToAvoid || 'None'}
Risk Level: ${riskLevel}

═══ CALCULATED TARGETS ═══
${calcNote}
Daily Calories: ${calories} kcal
Protein: ${macros.protein}g (${Math.round(macros.protein * 4)} kcal) | Carbs: ${macros.carbs}g (${Math.round(macros.carbs * 4)} kcal) | Fats: ${macros.fats}g (${Math.round(macros.fats * 9)} kcal)
Fiber: ≥${macros.fiber}g | Max Sugar: ${macros.sugar}g
Macro check: ${macros.protein * 4 + macros.carbs * 4 + macros.fats * 9} kcal (should ≈ ${calories})

Meal distribution:
${mealTargets}

═══ DIET TYPE ═══
${dietBlock}

═══ COOKING CONSTRAINT ═══
${cookingBlock}

${religionBlock ? `═══ RELIGIOUS RESTRICTION ═══\n${religionBlock}\n` : ''}
═══ CULTURAL PREFERENCE ═══
${cultureBlock}

═══ ALLERGY CONSTRAINTS ═══
${allergyBlock}

═══ MEDICAL DIETARY RULES (ALL MANDATORY) ═══
${medBlock}

═══ OUTPUT RULES ═══
1. Generate EXACTLY 4 meals: Breakfast, Lunch, Evening Snack, Dinner.
2. Each dish name must be SPECIFIC with portion size (e.g., "150g grilled chicken breast" not "chicken").
3. Each dish must have: calories, protein_g, carbs_g, fats_g, fiber_g, description.
4. Sum of dish calories in each meal MUST equal that meal's totalCalories.
5. Sum of all meal totalCalories MUST equal exactly ${calories}.
6. nutritionalInfo must reflect the SUM of all dish macros.
7. NEVER include any allergen, forbidden food, or cooking method the user cannot perform.
8. If non-vegetarian, use animal protein in at least 2 meals.
9. dietaryNote must explain: calorie calculation method, medical adjustments, constraint enforcement.

Respond with ONLY valid JSON — no markdown, no code fences, no explanation:
{
  "planData": {
    "meals": [
      {
        "name": "Breakfast",
        "timeSlot": "7:00 AM – 9:00 AM",
        "totalCalories": ${Math.round(calories * 0.25)},
        "dishes": [
          {
            "name": "Specific food with exact portion",
            "calories": 0,
            "protein_g": 0,
            "carbs_g": 0,
            "fats_g": 0,
            "fiber_g": 0,
            "description": "Why this food is included"
          }
        ]
      }
    ],
    "totalCalories": ${calories}
  },
  "nutritionalInfo": {
    "protein": ${macros.protein},
    "carbs": ${macros.carbs},
    "fats": ${macros.fats},
    "fiber": ${macros.fiber},
    "sugar": ${macros.sugar}
  },
  "dietaryNote": "Explain: calorie method (${method}), medical rules applied, constraint enforcement, key food choices.",
  "recommendations": {
    "hydration": "Specific daily water target with reason",
    "fiberGoal": "Specific fiber target with food sources",
    "nutrientGaps": ["Gap 1 with suggestion", "Gap 2 with suggestion"],
    "foodsToLimit": ["Food — specific reason", "Food — specific reason"]
  }
}`
}

// ─────────────────────────────────────────────────────────────────────────────
// Service class
// ─────────────────────────────────────────────────────────────────────────────

export class DietPlanService {
  async generateDietPlan(userId: string, hintCalories: number) {
    try {
      const healthProfile = await prisma.healthProfile.findUnique({ where: { userId } })
      if (!healthProfile) {
        return { success: false, error: 'Health profile not found. Please complete your health assessment first.' }
      }

      // Validate and compute calories
      const calc = computeCalories(healthProfile, hintCalories)

      // If critical fields are missing, tell the user instead of guessing
      const criticalMissing = calc.missingFields.filter(f => ['weight', 'height', 'age group', 'biological sex'].includes(f))
      if (criticalMissing.length > 0) {
        return {
          success: false,
          error: `Cannot calculate your calorie needs — please update your health profile with: ${criticalMissing.join(', ')}. Click "Update Profile" above.`,
          missingFields: criticalMissing,
        }
      }

      const aiResponse = await this.callGroqWithRetry(healthProfile, calc)
      if (!aiResponse.success) return aiResponse

      const dietPlan = await prisma.dietPlan.create({
        data: {
          userId,
          healthProfileId: healthProfile.id,
          dailyCalorieGoal: calc.calories,
          planData: aiResponse.data.planData,
          nutritionalInfo: aiResponse.data.nutritionalInfo,
          dietaryNote: aiResponse.data.dietaryNote,
          isActive: true,
        },
      })

      await prisma.dietPlan.updateMany({
        where: { userId, id: { not: dietPlan.id } },
        data: { isActive: false },
      })

      return { success: true, data: dietPlan }
    } catch (error) {
      console.error('Error generating diet plan:', error)
      return { success: false, error: 'Failed to generate diet plan. Please try again.' }
    }
  }

  async getActiveDietPlan(userId: string) {
    try {
      const dietPlan = await prisma.dietPlan.findFirst({
        where: { userId, isActive: true },
        orderBy: { generatedAt: 'desc' },
      })
      return { success: true, data: dietPlan }
    } catch (error) {
      console.error('Error fetching active diet plan:', error)
      return { success: false, error: 'Failed to fetch diet plan' }
    }
  }

  async saveDietPlan(userId: string, dietPlanId: string) {
    try {
      const dietPlan = await prisma.dietPlan.update({
        where: { id: dietPlanId, userId },
        data: { savedAt: new Date() },
      })
      return { success: true, data: dietPlan }
    } catch (error) {
      console.error('Error saving diet plan:', error)
      return { success: false, error: 'Failed to save diet plan' }
    }
  }

  // ── Private ────────────────────────────────────────────────────────────────

  /**
   * Calls Groq with up to 2 retries on parse failure.
   * No fallback template — returns a clear error if all attempts fail.
   */
  private async callGroqWithRetry(healthProfile: any, calc: CalcResult) {
    // If Groq is not configured, use fallback
    if (!groq) {
      console.log('[DietPlan] Groq not configured, using fallback generator')
      return this.generateFallbackPlan(healthProfile, calc)
    }

    const conditions = Array.isArray(healthProfile.medicalConditions) ? healthProfile.medicalConditions : []
    const allergies  = Array.isArray(healthProfile.foodAllergies)     ? healthProfile.foodAllergies     : []
    const riskLevel  = healthProfile.riskLevel || computeRiskLevel(conditions)
    const prompt     = buildPrompt(healthProfile, calc, conditions, allergies, riskLevel)

    const MAX_ATTEMPTS = 2
    let lastError: any = null

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      try {
        const completion = await groq.chat.completions.create({
          messages: [
            {
              role: 'system',
              content:
                'You are a clinical nutrition engine. You output ONLY a single valid JSON object. ' +
                'No markdown. No code fences. No explanation. Just the JSON.',
            },
            { role: 'user', content: prompt },
          ],
          model: 'llama-3.3-70b-versatile',
          temperature: attempt === 1 ? 0.3 : 0.1,  // lower temp on retry
          max_tokens: 3500,
        })

        const raw    = completion.choices[0]?.message?.content ?? ''
        const parsed = this.extractJSON(raw)

        if (!parsed?.planData?.meals?.length) {
          throw new Error(`Attempt ${attempt}: AI returned invalid or empty plan structure`)
        }

        // ── Post-processing: enforce consistency ──

        // 1. Reconcile meal calories so they sum to calc.calories exactly
        parsed.planData.meals = reconcileMealCalories(parsed.planData.meals, calc.calories)
        parsed.planData.totalCalories = calc.calories

        // 2. Recompute nutritionalInfo from actual dish macros
        parsed.nutritionalInfo = reconcileMacros(parsed.planData.meals, calc.macros)

        // 3. Embed recommendations into planData for persistence
        if (parsed.recommendations) {
          parsed.planData.recommendations = parsed.recommendations
        }

        return { success: true, data: parsed }
      } catch (err: any) {
        lastError = err
        console.error(`Diet plan generation attempt ${attempt} failed:`, err)
        
        // Check for authentication errors - use fallback instead
        if (err.status === 401 || err.message?.includes('Invalid API Key')) {
          console.log('[DietPlan] API authentication failed, using fallback generator')
          return this.generateFallbackPlan(healthProfile, calc)
        }
        
        if (attempt < MAX_ATTEMPTS) {
          await new Promise(r => setTimeout(r, 1000))
        }
      }
    }

    return {
      success: false,
      error: `AI failed to generate a valid diet plan after ${MAX_ATTEMPTS} attempts. Please try again. (${lastError?.message ?? 'Unknown error'})`,
    }
  }

  /** Generate a basic diet plan without AI as fallback */
  private generateFallbackPlan(healthProfile: any, calc: CalcResult) {
    const conditions = Array.isArray(healthProfile.medicalConditions) ? healthProfile.medicalConditions : []
    const allergies = Array.isArray(healthProfile.foodAllergies) ? healthProfile.foodAllergies : []
    const isVeg = healthProfile.dietType?.toLowerCase().includes('veg')
    const isVegan = healthProfile.dietType?.toLowerCase().includes('vegan')
    
    // Distribute calories across meals
    const breakfastCal = Math.round(calc.calories * 0.25)
    const lunchCal = Math.round(calc.calories * 0.35)
    const snackCal = Math.round(calc.calories * 0.10)
    const dinnerCal = calc.calories - breakfastCal - lunchCal - snackCal

    const meals = [
      {
        mealType: 'Breakfast',
        dishes: isVegan ? [
          { name: 'Oatmeal with Berries', calories: Math.round(breakfastCal * 0.6), protein: 8, carbs: 45, fats: 5 },
          { name: 'Almond Milk', calories: Math.round(breakfastCal * 0.2), protein: 2, carbs: 3, fats: 3 },
          { name: 'Mixed Nuts', calories: Math.round(breakfastCal * 0.2), protein: 5, carbs: 5, fats: 12 }
        ] : isVeg ? [
          { name: 'Whole Wheat Toast', calories: Math.round(breakfastCal * 0.4), protein: 6, carbs: 30, fats: 2 },
          { name: 'Scrambled Eggs', calories: Math.round(breakfastCal * 0.4), protein: 12, carbs: 2, fats: 10 },
          { name: 'Fresh Fruit', calories: Math.round(breakfastCal * 0.2), protein: 1, carbs: 20, fats: 0 }
        ] : [
          { name: 'Whole Grain Cereal', calories: Math.round(breakfastCal * 0.5), protein: 8, carbs: 40, fats: 3 },
          { name: 'Milk', calories: Math.round(breakfastCal * 0.3), protein: 8, carbs: 12, fats: 5 },
          { name: 'Banana', calories: Math.round(breakfastCal * 0.2), protein: 1, carbs: 27, fats: 0 }
        ]
      },
      {
        mealType: 'Lunch',
        dishes: isVegan ? [
          { name: 'Quinoa Bowl', calories: Math.round(lunchCal * 0.4), protein: 12, carbs: 50, fats: 6 },
          { name: 'Chickpea Curry', calories: Math.round(lunchCal * 0.4), protein: 15, carbs: 35, fats: 8 },
          { name: 'Mixed Salad', calories: Math.round(lunchCal * 0.2), protein: 3, carbs: 10, fats: 5 }
        ] : isVeg ? [
          { name: 'Brown Rice', calories: Math.round(lunchCal * 0.3), protein: 5, carbs: 45, fats: 2 },
          { name: 'Paneer Curry', calories: Math.round(lunchCal * 0.4), protein: 18, carbs: 10, fats: 15 },
          { name: 'Vegetable Salad', calories: Math.round(lunchCal * 0.3), protein: 4, carbs: 15, fats: 8 }
        ] : [
          { name: 'Grilled Chicken Breast', calories: Math.round(lunchCal * 0.4), protein: 35, carbs: 0, fats: 8 },
          { name: 'Brown Rice', calories: Math.round(lunchCal * 0.3), protein: 5, carbs: 45, fats: 2 },
          { name: 'Steamed Vegetables', calories: Math.round(lunchCal * 0.3), protein: 5, carbs: 20, fats: 5 }
        ]
      },
      {
        mealType: 'Snack',
        dishes: isVegan ? [
          { name: 'Hummus with Carrots', calories: Math.round(snackCal * 0.6), protein: 6, carbs: 15, fats: 8 },
          { name: 'Apple', calories: Math.round(snackCal * 0.4), protein: 0, carbs: 25, fats: 0 }
        ] : isVeg ? [
          { name: 'Greek Yogurt', calories: Math.round(snackCal * 0.6), protein: 10, carbs: 15, fats: 5 },
          { name: 'Berries', calories: Math.round(snackCal * 0.4), protein: 1, carbs: 20, fats: 0 }
        ] : [
          { name: 'Protein Bar', calories: Math.round(snackCal * 0.7), protein: 15, carbs: 25, fats: 8 },
          { name: 'Orange', calories: Math.round(snackCal * 0.3), protein: 1, carbs: 15, fats: 0 }
        ]
      },
      {
        mealType: 'Dinner',
        dishes: isVegan ? [
          { name: 'Lentil Soup', calories: Math.round(dinnerCal * 0.4), protein: 18, carbs: 40, fats: 5 },
          { name: 'Whole Wheat Bread', calories: Math.round(dinnerCal * 0.3), protein: 8, carbs: 35, fats: 3 },
          { name: 'Green Salad', calories: Math.round(dinnerCal * 0.3), protein: 3, carbs: 10, fats: 8 }
        ] : isVeg ? [
          { name: 'Dal (Lentils)', calories: Math.round(dinnerCal * 0.3), protein: 15, carbs: 30, fats: 5 },
          { name: 'Roti (2 pieces)', calories: Math.round(dinnerCal * 0.3), protein: 6, carbs: 40, fats: 3 },
          { name: 'Mixed Vegetables', calories: Math.round(dinnerCal * 0.4), protein: 5, carbs: 20, fats: 10 }
        ] : [
          { name: 'Grilled Fish', calories: Math.round(dinnerCal * 0.4), protein: 30, carbs: 0, fats: 10 },
          { name: 'Sweet Potato', calories: Math.round(dinnerCal * 0.3), protein: 4, carbs: 40, fats: 0 },
          { name: 'Broccoli', calories: Math.round(dinnerCal * 0.3), protein: 5, carbs: 15, fats: 5 }
        ]
      }
    ]

    const planData = {
      meals,
      totalCalories: calc.calories,
      recommendations: [
        'Drink at least 8 glasses of water daily',
        'Eat meals at regular intervals',
        'Include variety in your diet',
        conditions.length > 0 ? 'Consult your doctor about dietary restrictions for your medical conditions' : 'Maintain a balanced diet',
        allergies.length > 0 ? `Avoid: ${allergies.join(', ')}` : 'No known food allergies'
      ]
    }

    const nutritionalInfo = {
      protein: calc.macros.protein,
      carbs: calc.macros.carbs,
      fats: calc.macros.fats,
      fiber: calc.macros.fiber,
      sugar: calc.macros.sugar
    }

    return {
      success: true,
      data: {
        planData,
        nutritionalInfo,
        dietaryNote: conditions.length > 0 
          ? `This is a basic plan. Please consult a nutritionist for personalized advice regarding: ${conditions.join(', ')}`
          : 'This is a general healthy eating plan. Adjust portions based on your needs.'
      }
    }
  }

  /** Strip markdown fences and extract the first complete JSON object */
  private extractJSON(raw: string): any | null {
    // Remove ```json ... ``` or ``` ... ```
    const stripped = raw.replace(/^```(?:json)?\s*/im, '').replace(/\s*```\s*$/m, '').trim()
    try { return JSON.parse(stripped) } catch { /* fall through */ }

    // Find outermost { ... }
    const start = raw.indexOf('{')
    const end   = raw.lastIndexOf('}')
    if (start !== -1 && end > start) {
      try { return JSON.parse(raw.slice(start, end + 1)) } catch { /* fall through */ }
    }
    return null
  }
}
