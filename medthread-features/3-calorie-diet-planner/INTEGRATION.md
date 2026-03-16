# Calorie Diet Planner - Integration Guide

## Step 1: Install Dependencies

All peer dependencies should already be in your project:
```bash
# Verify these are installed
npm list react react-dom react-router-dom motion lucide-react
```

## Step 2: Copy Files to Your Project

```
your-project/
├── src/
│   ├── features/
│   │   └── calorie-diet-planner/
│   │       ├── components/
│   │       │   └── DietNutrition.tsx
│   │       ├── services/
│   │       │   ├── dietPlanService.ts
│   │       │   └── authService.ts (optional)
│   │       └── hooks/
│   │           └── useTranslation.ts
```

## Step 3: Update Import Paths

Update all imports from `@/` to relative paths or your project's alias.

## Step 4: Add Diet Planner Route

```tsx
import { DietNutrition } from './features/calorie-diet-planner/components/DietNutrition';

<Routes>
  <Route path="/diet-plan" element={<DietNutrition />} />
</Routes>
```

## Usage Examples

### Basic Diet Planner

```tsx
import { DietNutrition } from '@/features/calorie-diet-planner/components/DietNutrition';

export function DietPlanPage() {
  return <DietNutrition />;
}
```

### Using Diet Service Directly

```tsx
import { dietPlanService } from '@/features/calorie-diet-planner/services/dietPlanService';

// Generate a daily plan
const dailyPlan = dietPlanService.generateCustomPlan({
  mode: 'daily',
  targetCalories: 2000,
  dietType: 'veg',
  restrictions: ['peanuts']
});

console.log(dailyPlan);
// {
//   day: 'Custom Plan',
//   breakfast: { name: 'Oats Porridge', calories: 350, ... },
//   lunch: { name: 'Brown Rice with Dal', calories: 520, ... },
//   dinner: { name: 'Vegetable Soup', calories: 380, ... },
//   snacks: [{ name: 'Fruit Salad', calories: 150, ... }]
// }

// Generate a single meal
const meal = dietPlanService.generateCustomPlan({
  mode: 'single_meal',
  targetCalories: 500,
  mealType: 'lunch',
  dietType: 'non-veg'
});

console.log(meal);
// {
//   name: 'Chicken Curry with Rice',
//   ingredients: ['Chicken (150g)', 'Rice (150g)', ...],
//   calories: 600,
//   protein: 40,
//   carbs: 60,
//   fats: 15,
//   type: 'non-veg',
//   cuisine: 'North Indian'
// }
```

### Get Alternative Meals

```tsx
const alternatives = dietPlanService.getAlternativeMeals(
  'breakfast',
  400, // target calories
  'Oats Porridge', // current meal to exclude
  ['milk'], // restrictions
  'veg' // diet type
);

console.log(alternatives);
// [
//   { name: 'Idli with Sambar', calories: 320, ... },
//   { name: 'Vegetable Poha', calories: 340, ... },
//   { name: 'Moong Dal Cheela', calories: 300, ... }
// ]
```

### Generate Legacy Diet Plan (7-day)

```tsx
import { authService } from '@/features/calorie-diet-planner/services/authService';

const user = await authService.getCurrentUser();

if (user) {
  const weekPlan = dietPlanService.generateDietPlan(user, '1_week');
  
  console.log(weekPlan);
  // {
  //   id: '1234567890',
  //   userId: 'user-id',
  //   duration: '1_week',
  //   meals: [ /* 7 days of meals */ ],
  //   nutritionGoals: { dailyCalories: 2000, ... },
  //   restrictions: ['high sugar', 'high salt'],
  //   recommendations: ['Drink 8 glasses of water', ...]
  // }
  
  // Save to localStorage
  dietPlanService.saveDietPlan(weekPlan);
}
```

### Get User's Saved Plans

```tsx
const savedPlans = dietPlanService.getUserDietPlans('user-id');

savedPlans.forEach(plan => {
  console.log(`Plan from ${plan.generatedAt}`);
  console.log(`Duration: ${plan.duration}`);
  console.log(`Daily calories: ${plan.nutritionGoals.dailyCalories}`);
});
```

## Customization

### Add New Meals

Edit `services/dietPlanService.ts`:

```typescript
private getAllBreakfastOptions(): Meal[] {
  return [
    // ... existing meals
    {
      name: 'Your Custom Meal',
      ingredients: ['Ingredient 1', 'Ingredient 2', 'Ingredient 3'],
      calories: 400,
      protein: 20,
      carbs: 50,
      fats: 10,
      type: 'veg', // or 'non-veg' or 'vegan'
      cuisine: 'Indian' // or 'Continental', 'Asian', etc.
    }
  ];
}
```

### Modify Calorie Distribution

Edit `generateDailyPlan` method:

```typescript
private generateDailyPlan(targetCalories: number, ...): DailyMeal {
  // Change these percentages
  const breakfastCals = Math.round(targetCalories * 0.30); // 30% instead of 25%
  const lunchCals = Math.round(targetCalories * 0.40);     // 40% instead of 35%
  const dinnerCals = Math.round(targetCalories * 0.25);    // 25% instead of 30%
  const snackCals = Math.round(targetCalories * 0.05);     // 5% instead of 10%
  // ...
}
```

### Add Custom Restrictions

```typescript
// Based on user conditions
const restrictions = dietPlanService.getRestrictions(user);

// Add custom restrictions
restrictions.push('gluten', 'soy', 'shellfish');

const plan = dietPlanService.generateCustomPlan({
  mode: 'daily',
  targetCalories: 2000,
  restrictions: restrictions,
  dietType: 'veg'
});
```

### Customize Nutrition Goals

Edit `calculateNutritionGoals` method:

```typescript
private calculateNutritionGoals(user: UserProfile): NutritionGoals {
  let baseCalories = 2000;
  
  // Add your custom logic
  if (user.activityLevel === 'high') baseCalories += 500;
  if (user.goal === 'weight_loss') baseCalories -= 300;
  
  return {
    dailyCalories: baseCalories,
    protein: Math.round(baseCalories * 0.20 / 4), // 20% protein
    carbs: Math.round(baseCalories * 0.50 / 4),   // 50% carbs
    fats: Math.round(baseCalories * 0.30 / 9),    // 30% fats
    fiber: 30,
  };
}
```

## Meal Database Structure

Each meal has:
- `name`: Display name
- `ingredients`: Array of ingredient strings with quantities
- `calories`: Total calories (should match macro calculation)
- `protein`: Grams of protein
- `carbs`: Grams of carbohydrates
- `fats`: Grams of fats
- `type`: 'veg' | 'non-veg' | 'vegan'
- `cuisine`: 'Indian' | 'Continental' | 'Asian' | etc.

### Macro Calculation Formula

```
Calories = (Protein × 4) + (Carbs × 4) + (Fats × 9)
```

Example:
```typescript
{
  protein: 20,  // 20g × 4 = 80 cal
  carbs: 50,    // 50g × 4 = 200 cal
  fats: 10,     // 10g × 9 = 90 cal
  calories: 370 // Total
}
```

## Diet Type Filtering

### Vegetarian (veg)
- Includes: Vegetables, fruits, grains, dairy, eggs (lacto-ovo)
- Excludes: Meat, poultry, fish

### Non-Vegetarian (non-veg)
- Includes: Everything including meat, poultry, fish
- No restrictions

### Vegan
- Includes: Only plant-based foods
- Excludes: All animal products (meat, dairy, eggs, honey)

The service automatically filters out dairy/eggs for vegan diet type.

## Restriction Handling

### Automatic Restrictions from Health Conditions

```typescript
// Diabetes → excludes high sugar, refined carbs
// Hypertension → excludes high salt, pickles
// Heart disease → excludes saturated fats, fried foods
// Kidney disease → excludes high protein, high potassium
```

### Manual Restrictions

```typescript
const plan = dietPlanService.generateCustomPlan({
  mode: 'daily',
  targetCalories: 2000,
  restrictions: [
    'peanuts',      // Allergy
    'gluten',       // Intolerance
    'dairy',        // Preference
    'spicy'         // Preference
  ],
  dietType: 'veg'
});
```

## Portion Scaling

Meals are automatically scaled if target calories differ by >20%:

```typescript
// Original meal: 400 calories
// Target: 600 calories
// Ratio: 600/400 = 1.5

// Scaled meal:
{
  name: 'Oats Porridge (Adjusted Portion)',
  calories: 600,
  protein: 18,  // 12 × 1.5
  carbs: 82,    // 55 × 1.5
  fats: 12      // 8 × 1.5
}
```

## Storage

### Save Diet Plans

```typescript
const plan = dietPlanService.generateDietPlan(user, '1_week');
dietPlanService.saveDietPlan(plan);
```

### Retrieve Saved Plans

```typescript
const plans = dietPlanService.getUserDietPlans(userId);
```

Plans are stored in `localStorage` under key `vitavoice_diet_plans`.

## Integration with User Profiles

If you have user authentication:

```typescript
import { authService } from '@/features/calorie-diet-planner/services/authService';

const user = await authService.getCurrentUser();

if (user) {
  // Get restrictions from user profile
  const restrictions = dietPlanService.getRestrictions(user);
  
  // Generate personalized plan
  const plan = dietPlanService.generateCustomPlan({
    mode: 'daily',
    targetCalories: 2000,
    restrictions: restrictions,
    dietType: user.dietPreference || 'veg'
  });
}
```

## Troubleshooting

### Meals Not Matching Calorie Target

The service scales meals automatically. If you want exact matches:
1. Add more meals to the database with varied calorie counts
2. Adjust the scaling threshold in `scaleMeal` method

### No Meals Found for Diet Type

Check that your meal database has meals for the selected diet type:
```typescript
const vegMeals = this.getAllBreakfastOptions().filter(m => m.type === 'veg');
console.log(`Veg breakfast options: ${vegMeals.length}`);
```

### Restrictions Too Strict

If too many restrictions result in no meals:
1. Relax some restrictions
2. Add more meals to database
3. Implement fallback logic

## Performance Tips

1. **Cache Meal Database**: Meals are static, cache them
2. **Lazy Load**: Only load meal data when needed
3. **Memoize Calculations**: Cache nutrition calculations

## Mobile Optimization

The UI is mobile-optimized with:
- Touch-friendly buttons
- Responsive grid layouts
- Expandable meal cards
- Smooth animations

## Accessibility

- Keyboard navigation
- ARIA labels
- High contrast mode support
- Screen reader friendly

## Future Enhancements

Consider adding:
- Meal photos
- Cooking instructions
- Shopping list generation
- Meal prep time
- Cost estimation
- Recipe variations
- Nutritional analysis charts
- Export to PDF
- Share meal plans
- Favorite meals
- Custom meal creation

## Legal Disclaimer

Add to your app:
```
This diet planner provides general nutritional suggestions only. 
It is not medical advice. Consult a registered dietitian or 
healthcare provider for personalized nutrition guidance.
```
