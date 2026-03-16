# Calorie Diet Planner

Personalized diet plan generator with meal suggestions based on calorie goals and dietary preferences.

## Features

- 📊 Daily meal plan or single meal generation
- 🥗 Diet type selection (Veg, Non-Veg, Vegan)
- 🔄 Alternative meal suggestions
- 📈 Macro tracking (Protein, Carbs, Fats)
- 🚫 Allergy and restriction filtering
- 🍽️ Indian and Continental cuisine options
- ⚖️ Automatic portion scaling to match calorie targets

## Components

- `DietNutrition.tsx` - Main diet planner interface
- `MealResultCard.tsx` - Expandable meal card with nutrition info

## Services

- `dietPlanService.ts` - Meal generation and filtering logic
- `authService.ts` - User profile for restrictions (optional)

## Dependencies

```bash
npm install motion
```

## Integration Example

```tsx
import { DietNutrition } from './calorie-diet-planner/components/DietNutrition';

function App() {
  return (
    <Routes>
      <Route path="/diet-plan" element={<DietNutrition />} />
    </Routes>
  );
}
```

## Usage Flow

1. **Landing Page**: Choose "Plan My Day" or "Plan a Meal"
2. **Input Page**: Enter target calories and select diet type
3. **Result Page**: View generated meal(s) with nutrition breakdown
4. **Regenerate**: Get alternative meals with same calorie target

## Meal Database

Includes 30+ meals across categories:
- Breakfast: Oats, Idli, Poha, Upma, Eggs, etc.
- Lunch: Rice combos, Roti meals, Quinoa, Chicken, Fish
- Dinner: Soups, Dal, Paneer, Grilled options
- Snacks: Fruits, Nuts, Sandwiches, Yogurt

## Diet Type Filtering

- **Veg**: Vegetarian meals only
- **Non-Veg**: Includes chicken, fish, eggs
- **Vegan**: Plant-based, excludes dairy and eggs

## Restriction Handling

Automatically filters meals based on:
- User allergies
- Chronic conditions (diabetes → low sugar, hypertension → low salt)
- Ingredient restrictions

## Calorie Distribution

For daily plans:
- Breakfast: 25%
- Lunch: 35%
- Dinner: 30%
- Snacks: 10%

## Portion Scaling

Meals are automatically scaled if target calories differ by >20% from base meal calories.
Macros are recalculated proportionally.

## Customization

Add new meals to `dietPlanService.ts`:
```typescript
{
  name: 'Meal Name',
  ingredients: ['Ingredient 1', 'Ingredient 2'],
  calories: 400,
  protein: 20,
  carbs: 50,
  fats: 10,
  type: 'veg',
  cuisine: 'Indian'
}
```

## Nutrition Calculation

Calories = (Protein × 4) + (Carbs × 4) + (Fats × 9)

## Storage

Diet plans can be saved to localStorage for history tracking.
