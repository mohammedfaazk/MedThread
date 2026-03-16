import { prisma } from '@medthread/database'
import Groq from 'groq-sdk'

// Initialize Groq client only if API key is available
let groq: Groq | null = null
if (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'optional_groq_key_here') {
  groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
  })
}

export class DietPlanService {
  async generateDietPlan(userId: string, dailyCalorieGoal: number) {
    try {
      // Get user's health profile
      const healthProfile = await prisma.healthProfile.findUnique({
        where: { userId }
      })

      if (!healthProfile) {
        return { success: false, error: 'Health profile not found. Please complete your health assessment first.' }
      }

      // Generate AI diet plan
      const aiResponse = await this.generateAIDietPlan(healthProfile, dailyCalorieGoal)
      
      if (!aiResponse.success) {
        return aiResponse
      }

      // Save diet plan to database
      const dietPlan = await prisma.dietPlan.create({
        data: {
          userId,
          healthProfileId: healthProfile.id,
          dailyCalorieGoal,
          planData: aiResponse.data.planData,
          nutritionalInfo: aiResponse.data.nutritionalInfo,
          dietaryNote: aiResponse.data.dietaryNote,
          isActive: true
        }
      })

      // Deactivate other plans
      await prisma.dietPlan.updateMany({
        where: {
          userId,
          id: { not: dietPlan.id }
        },
        data: { isActive: false }
      })

      return { success: true, data: dietPlan }
    } catch (error) {
      console.error('Error generating diet plan:', error)
      return { success: false, error: 'Failed to generate diet plan' }
    }
  }

  async getActiveDietPlan(userId: string) {
    try {
      const dietPlan = await prisma.dietPlan.findFirst({
        where: {
          userId,
          isActive: true
        },
        orderBy: { generatedAt: 'desc' }
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
        where: {
          id: dietPlanId,
          userId
        },
        data: {
          savedAt: new Date()
        }
      })

      return { success: true, data: dietPlan }
    } catch (error) {
      console.error('Error saving diet plan:', error)
      return { success: false, error: 'Failed to save diet plan' }
    }
  }

  private async generateAIDietPlan(healthProfile: any, dailyCalorieGoal: number) {
    try {
      // Check if Groq is available
      if (!groq) {
        // Return a fallback diet plan when AI is not available
        return this.generateFallbackDietPlan(healthProfile, dailyCalorieGoal)
      }

      const prompt = this.buildDietPlanPrompt(healthProfile, dailyCalorieGoal)
      
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are a professional nutritionist and dietitian AI. Generate personalized, medically-aware diet plans based on user health profiles. Always respond with valid JSON format."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        model: "llama-3.1-70b-versatile",
        temperature: 0.7,
        max_tokens: 2048
      })

      const response = completion.choices[0]?.message?.content
      if (!response) {
        throw new Error('No response from AI')
      }

      // Parse AI response
      const parsedResponse = JSON.parse(response)
      
      return { success: true, data: parsedResponse }
    } catch (error) {
      console.error('Error generating AI diet plan:', error)
      // Fallback to basic diet plan if AI fails
      return this.generateFallbackDietPlan(healthProfile, dailyCalorieGoal)
    }
  }

  private buildDietPlanPrompt(healthProfile: any, dailyCalorieGoal: number): string {
    const medicalConditions = Array.isArray(healthProfile.medicalConditions) 
      ? healthProfile.medicalConditions 
      : []
    
    const foodAllergies = Array.isArray(healthProfile.foodAllergies) 
      ? healthProfile.foodAllergies 
      : []

    return `Generate a personalized diet plan with the following specifications:

PATIENT PROFILE:
- Age Group: ${healthProfile.ageGroup}
- Biological Sex: ${healthProfile.biologicalSex}
- Nationality/Culture: ${healthProfile.nationality}
- Weight Range: ${healthProfile.weightRange}
- Height Range: ${healthProfile.heightRange}
- Activity Level: ${healthProfile.activityLevel}
- Diet Type: ${healthProfile.dietType}
- Religious Restrictions: ${healthProfile.religiousRestrictions}
- Cooking Access: ${healthProfile.cookingAccess}
- Primary Goal: ${healthProfile.primaryGoal}
- Sleep Hours: ${healthProfile.sleepHours}
- Water Intake: ${healthProfile.waterIntake}

MEDICAL CONDITIONS: ${medicalConditions.join(', ') || 'None'}
FOOD ALLERGIES: ${foodAllergies.join(', ') || 'None'}
FOODS TO AVOID: ${healthProfile.foodsToAvoid || 'None'}
CURRENT MEDICATIONS: ${healthProfile.currentMedications || 'None'}

DAILY CALORIE GOAL: ${dailyCalorieGoal} kcal

REQUIREMENTS:
1. Create 4 meals: Breakfast (25%), Lunch (35%), Evening Snack (10%), Dinner (30%)
2. Use culturally appropriate foods for ${healthProfile.nationality} cuisine
3. Apply medical dietary restrictions for conditions: ${medicalConditions.join(', ')}
4. Respect ${healthProfile.dietType} diet and ${healthProfile.religiousRestrictions} restrictions
5. Consider ${healthProfile.cookingAccess} cooking capability
6. Avoid all listed allergies and foods to avoid
7. Support ${healthProfile.primaryGoal} goal

MEDICAL DIETARY RULES:
- Diabetes: Low GI foods, reduced simple sugars, complex carbs
- Hypertension: Low sodium, potassium-rich foods
- Cancer: Anti-inflammatory foods, high protein, avoid processed
- Kidney disease: Low potassium, low phosphorus, controlled protein
- Thyroid (Hypo): Iodine-rich foods, avoid raw cruciferous vegetables
- Thyroid (Hyper): Avoid iodine-rich foods, calcium-rich diet
- PCOS: Low GI, anti-inflammatory, high fiber
- Celiac: Strictly gluten-free alternatives
- Lactose intolerance: Dairy-free alternatives

Respond with ONLY valid JSON in this exact format:
{
  "planData": {
    "meals": [
      {
        "name": "Breakfast",
        "timeSlot": "7:00 AM - 9:00 AM",
        "dishes": [
          {
            "name": "Dish Name",
            "calories": 200,
            "description": "Brief description"
          }
        ],
        "totalCalories": 500
      }
    ],
    "totalCalories": ${dailyCalorieGoal}
  },
  "nutritionalInfo": {
    "protein": 120,
    "carbs": 200,
    "fats": 60,
    "fiber": 25,
    "sugar": 50
  },
  "dietaryNote": "Explanation of condition-specific adjustments made"
}`
  }

  private generateFallbackDietPlan(healthProfile: any, dailyCalorieGoal: number) {
    // Generate a basic diet plan when AI is not available
    const basicPlan = {
      planData: {
        meals: [
          {
            name: "Breakfast",
            dishes: [
              { name: "Oatmeal with fruits", calories: Math.round(dailyCalorieGoal * 0.25), description: "Healthy start to the day" },
              { name: "Green tea", calories: 5, description: "Antioxidant rich beverage" }
            ],
            totalCalories: Math.round(dailyCalorieGoal * 0.25)
          },
          {
            name: "Lunch", 
            dishes: [
              { name: "Grilled chicken with vegetables", calories: Math.round(dailyCalorieGoal * 0.35), description: "Protein and fiber rich meal" },
              { name: "Brown rice", calories: Math.round(dailyCalorieGoal * 0.1), description: "Complex carbohydrates" }
            ],
            totalCalories: Math.round(dailyCalorieGoal * 0.45)
          },
          {
            name: "Dinner",
            dishes: [
              { name: "Fish with salad", calories: Math.round(dailyCalorieGoal * 0.25), description: "Light evening meal" },
              { name: "Herbal tea", calories: 5, description: "Relaxing beverage" }
            ],
            totalCalories: Math.round(dailyCalorieGoal * 0.3)
          }
        ],
        totalCalories: dailyCalorieGoal
      },
      nutritionalInfo: {
        protein: Math.round(dailyCalorieGoal * 0.25 / 4), // 25% of calories from protein
        carbs: Math.round(dailyCalorieGoal * 0.45 / 4), // 45% from carbs  
        fats: Math.round(dailyCalorieGoal * 0.30 / 9), // 30% from fats
        fiber: 25,
        sugar: Math.round(dailyCalorieGoal * 0.1 / 4) // 10% from sugar
      },
      dietaryNote: `Basic diet plan generated (AI service unavailable). Consult with a healthcare provider for personalized nutrition advice. ${healthProfile.medicalConditions ? 'Consider your medical conditions: ' + healthProfile.medicalConditions : ''}`
    }

    return { success: true, data: basicPlan }
  }
}