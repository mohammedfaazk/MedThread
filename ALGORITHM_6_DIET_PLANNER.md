# Algorithm 6: AI Diet Planner 🍽️

## Purpose
Generate personalized nutrition plans using metabolic calculations and AI, considering medical conditions, cultural preferences, and cooking constraints.

## Metabolic Calculation Formulas

### 1. Basal Metabolic Rate (BMR) - Mifflin-St Jeor Formula

```
BMR (Male) = 10 × weight(kg) + 6.25 × height(cm) - 5 × age(years) + 5
BMR (Female) = 10 × weight(kg) + 6.25 × height(cm) - 5 × age(years) - 161
```

### 2. Total Daily Energy Expenditure (TDEE)

```
TDEE = BMR × Activity Multiplier

Activity Multipliers:
- Sedentary (little/no exercise): 1.2
- Lightly Active (1-3 days/week): 1.375
- Moderately Active (3-5 days/week): 1.55
- Very Active (6-7 days/week): 1.725
- Extremely Active (athlete): 1.9
```

### 3. Goal-Based Calorie Adjustment

```
Target Calories = TDEE × Goal Multiplier

Goal Multipliers:
- Weight Loss: 0.82 (18% caloric deficit)
- Weight Gain: 1.15 (15% caloric surplus)
- Maintain Weight: 1.0
- Medical Management: 1.0
- General Wellness: 1.0
```

## Pseudocode

```python
function generateDietPlan(userId, preferences):
    # Step 1: Get user health profile
    user = database.getUser(userId)
    profile = user.healthProfile
    
    # Step 2: Calculate metabolic requirements
    calories = calculateCalories(profile)
    macros = calculateMacros(calories, profile.medicalConditions)
    
    # Step 3: Generate meal plan using AI
    mealPlan = generateMealsWithAI(
        calories=calories,
        macros=macros,
        preferences=preferences,
        medicalConditions=profile.medicalConditions
    )
    
    # Step 4: Reconcile and validate
    reconciledPlan = reconcileMealPlan(mealPlan, calories, macros)
    
    # Step 5: Save to database
    database.saveDietPlan(userId, reconciledPlan)
    
    return reconciledPlan

function calculateCalories(profile):
    # Extract data
    weight = parseRange(profile.weightRange)  # kg
    height = parseRange(profile.heightRange)  # cm
    age = parseAgeGroup(profile.ageGroup)
    sex = profile.biologicalSex.lower()
    activityLevel = profile.activityLevel
    goal = profile.primaryGoal
    
    # Validate required fields
    if not all([weight, height, age, sex, activityLevel]):
        return {
            calories: profile.hintCalories or 2000,
            method: "hint",
            missingFields: getMissingFields(profile)
        }
    
    # Calculate BMR using Mifflin-St Jeor
    if sex == "female":
        bmr = 10 * weight + 6.25 * height - 5 * age - 161
    else:
        bmr = 10 * weight + 6.25 * height - 5 * age + 5
    
    # Calculate TDEE
    activityMultipliers = {
        "Sedentary": 1.2,
        "Lightly Active": 1.375,
        "Moderately Active": 1.55,
        "Very Active": 1.725
    }
    tdee = bmr * activityMultipliers[activityLevel]
    
    # Apply goal adjustment
    goalMultipliers = {
        "weight loss": 0.82,
        "weight gain": 1.15,
        "maintain weight": 1.0,
        "manage medical condition": 1.0,
        "general wellness": 1.0
    }
    
    goalKey = findMatchingGoal(goal, goalMultipliers.keys())
    targetCalories = tdee * goalMultipliers[goalKey]
    
    # Clamp to safe range
    calories = clamp(targetCalories, 1200, 4000)
    
    return {
        calories: round(calories),
        bmr: round(bmr),
        tdee: round(tdee),
        method: "mifflin",
        missingFields: []
    }

function calculateMacros(calories, medicalConditions):
    # Default macro distribution
    proteinPercent = 0.25
    carbsPercent = 0.50
    fatsPercent = 0.25
    
    # Adjust for medical conditions
    if "diabetes" in medicalConditions or "prediabetes" in medicalConditions:
        proteinPercent = 0.30
        carbsPercent = 0.40  # Lower carbs, focu