// Personalized diet plan generator for VitaVoice

import type { UserProfile } from './authService';

export interface DietPlan {
    id: string;
    userId: string;
    generatedAt: Date;
    duration: '1_week' | '2_weeks' | '1_month';
    meals: DailyMeal[];
    nutritionGoals: NutritionGoals;
    restrictions: string[];
    recommendations: string[];
}

export interface DailyMeal {
    day: string;
    breakfast: Meal;
    lunch: Meal;
    dinner: Meal;
    snacks: Meal[];
}

export interface MealPlanRequest {
    mode: 'daily' | 'single_meal';
    targetCalories: number;
    mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    restrictions?: string[];
    preferences?: string[];
    dietType?: 'veg' | 'non-veg' | 'vegan';
}

export interface Meal {
    name: string;
    ingredients: string[];
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    instructions?: string;
    type: 'veg' | 'non-veg' | 'vegan';
    cuisine: string;
}

export interface NutritionGoals {
    dailyCalories: number;
    protein: number;
    carbs: number;
    fats: number;
    fiber: number;
}

class DietPlanService {
    /**
     * Generate personalized diet plan (Legacy support)
     */
    generateDietPlan(user: UserProfile, duration: DietPlan['duration'] = '1_week'): DietPlan {
        const restrictions = this.getRestrictions(user);
        const nutritionGoals = this.calculateNutritionGoals(user);
        const meals = this.generateMeals(user, duration, restrictions);

        return {
            id: Date.now().toString(),
            userId: user.id,
            generatedAt: new Date(),
            duration,
            meals,
            nutritionGoals,
            restrictions,
            recommendations: this.generateRecommendations(user),
        };
    }

    /**
     * Generate a specific meal plan based on calories (Day or Single)
     */
    generateCustomPlan(request: MealPlanRequest): DailyMeal | Meal {
        const restrictions = request.restrictions || [];
        const dietType = request.dietType || 'veg';

        if (request.mode === 'daily') {
            return this.generateDailyPlan(request.targetCalories, restrictions, dietType);
        } else {
            return this.generateSingleMeal(
                request.mealType || 'lunch',
                request.targetCalories,
                restrictions,
                dietType
            );
        }
    }

    private generateDailyPlan(targetCalories: number, restrictions: string[], dietType: string): DailyMeal {
        // Distribute calories roughly:
        // Breakfast: 25%, Lunch: 35%, Dinner: 30%, Snacks: 10%
        const breakfastCals = Math.round(targetCalories * 0.25);
        const lunchCals = Math.round(targetCalories * 0.35);
        const dinnerCals = Math.round(targetCalories * 0.30);
        const snackCals = Math.round(targetCalories * 0.10);

        return {
            day: 'Custom Plan',
            breakfast: this.findBestMeal('breakfast', breakfastCals, restrictions, dietType),
            lunch: this.findBestMeal('lunch', lunchCals, restrictions, dietType),
            dinner: this.findBestMeal('dinner', dinnerCals, restrictions, dietType),
            snacks: [this.findBestMeal('snack', snackCals, restrictions, dietType)],
        };
    }

    private generateSingleMeal(type: string, targetCalories: number, restrictions: string[], dietType: string): Meal {
        return this.findBestMeal(type, targetCalories, restrictions, dietType);
    }

    getAlternativeMeals(type: string, targetCalories: number, currentMealName: string, restrictions: string[], dietType: string = 'veg'): Meal[] {
        const options = this.getOptionsByType(type);
        const filtered = this.filterMeals(options, restrictions, dietType);

        // Filter out current meal
        const available = filtered.filter(m => m.name !== currentMealName);

        // Shuffle the available options to ensure variety
        for (let i = available.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [available[i], available[j]] = [available[j], available[i]];
        }

        // Return top results (randomized)
        const alternatives = available.slice(0, 3);

        return alternatives.map(meal => this.scaleMeal(meal, targetCalories));
    }

    private findBestMeal(type: string, targetCalories: number, restrictions: string[], dietType: string): Meal {
        const options = this.getOptionsByType(type);
        const filtered = this.filterMeals(options, restrictions, dietType);

        let bestMatch: Meal;

        if (filtered.length === 0) {
            // Fallback: relax Diet Type if forced (though theoretically we should respect it, user experience says give *something*)
            // But usually we just return an option.
            bestMatch = options[0];
        } else {
            // Find closest calorie match
            bestMatch = filtered.reduce((prev, curr) => {
                return (Math.abs(curr.calories - targetCalories) < Math.abs(prev.calories - targetCalories) ? curr : prev);
            });
        }

        // Scale the meal if target is significantly different
        return this.scaleMeal(bestMatch, targetCalories);
    }

    private scaleMeal(meal: Meal, targetCalories: number): Meal {
        // Calculate strict calorie count from macros to ensure consistency
        const macroSum = (meal.protein * 4) + (meal.carbs * 4) + (meal.fats * 9);
        // Use macroSum for ratio if valid, otherwise fallback to meal.calories to avoid zero-div/NaN
        const baseCalories = macroSum > 0 ? macroSum : meal.calories;

        const ratio = targetCalories / baseCalories;

        // If ratio is outside 0.8 - 1.2 range, scale it
        if (ratio < 0.8 || ratio > 1.2) {
            const newProtein = Math.round(meal.protein * ratio);
            const newCarbs = Math.round(meal.carbs * ratio);
            const newFats = Math.round(meal.fats * ratio);

            // Recalculate calories strictly from new macros to match display
            const newCalories = (newProtein * 4) + (newCarbs * 4) + (newFats * 9);

            return {
                ...meal,
                name: `${meal.name} (Adjusted Portion)`,
                calories: newCalories,
                protein: newProtein,
                carbs: newCarbs,
                fats: newFats,
            };
        }
        return meal;
    }

    private getOptionsByType(type: string): Meal[] {
        switch (type.toLowerCase()) {
            case 'breakfast': return this.getAllBreakfastOptions();
            case 'lunch': return this.getAllLunchOptions();
            case 'dinner': return this.getAllDinnerOptions();
            case 'snack': return this.getAllSnackOptions();
            case 'snacks': return this.getAllSnackOptions();
            default: return [];
        }
    }

    private filterMeals(meals: Meal[], restrictions: string[], dietType: string): Meal[] {
        let filtered = meals;

        // 1. Filter by Diet Type
        if (dietType) {
            if (dietType === 'vegan') {
                filtered = filtered.filter(m =>
                    (m.type === 'veg' || m.type === 'vegan') &&
                    !m.ingredients.some(i => {
                        const ing = i.toLowerCase();
                        return ing.includes('milk') || ing.includes('curd') || ing.includes('paneer') || ing.includes('cheese') || ing.includes('butter') || ing.includes('ghee') || ing.includes('yogurt') || ing.includes('egg') || ing.includes('whey') || ing.includes('cream');
                    })
                );
            } else {
                filtered = filtered.filter(m => m.type === dietType);
            }
        }


        // 3. Filter by Restrictions
        if (restrictions && restrictions.length > 0) {
            filtered = filtered.filter(meal => {
                return !meal.ingredients.some(ingredient =>
                    restrictions.some(restriction =>
                        ingredient.toLowerCase().includes(restriction.toLowerCase())
                    )
                );
            });
        }

        return filtered;
    }

    // Data Accessors
    private getAllBreakfastOptions(): Meal[] {
        return [
            { name: 'Oats Porridge with Fruits', ingredients: ['Oats (50g)', 'Milk (200ml)', 'Banana (1)', 'Almonds (10)', 'Honey (1 tsp)'], calories: 350, protein: 12, carbs: 55, fats: 8, type: 'veg', cuisine: 'Continental' },
            { name: 'Idli with Sambar', ingredients: ['Idli (3 pieces)', 'Sambar (1 bowl)', 'Coconut chutney (2 tbsp)', 'Curry leaves'], calories: 320, protein: 10, carbs: 60, fats: 4, type: 'veg', cuisine: 'South Indian' },
            { name: 'Vegetable Poha', ingredients: ['Poha (100g)', 'Mixed vegetables (50g)', 'Peanuts (20g)', 'Curry leaves', 'Mustard seeds'], calories: 340, protein: 8, carbs: 58, fats: 10, type: 'veg', cuisine: 'North Indian' },
            { name: 'Moong Dal Cheela', ingredients: ['Moong dal (100g)', 'Onion (1)', 'Tomato (1)', 'Green chili (1)', 'Coriander leaves'], calories: 300, protein: 15, carbs: 45, fats: 6, type: 'veg', cuisine: 'North Indian' },
            { name: 'Besan Chilla', ingredients: ['Besan (100g)', 'Onion', 'Spinach', 'Spices'], calories: 280, protein: 14, carbs: 40, fats: 8, type: 'veg', cuisine: 'North Indian' },
            { name: 'Egg Sandwich', ingredients: ['Bread (2)', 'Eggs (2)', 'Lettuce', 'Pepper'], calories: 350, protein: 16, carbs: 30, fats: 12, type: 'non-veg', cuisine: 'Continental' },
            { name: 'Masala Upma', ingredients: ['Semolina', 'Vegetables', 'Nuts'], calories: 330, protein: 9, carbs: 60, fats: 7, type: 'veg', cuisine: 'South Indian' },
            { name: 'Methi Paratha with Curd', ingredients: ['Whole wheat flour', 'Fenugreek leaves', 'Curd'], calories: 380, protein: 10, carbs: 65, fats: 12, type: 'veg', cuisine: 'North Indian' },
            { name: 'Scrambled Eggs with Toast', ingredients: ['Eggs (2)', 'Whole wheat toast (2)', 'Butter'], calories: 400, protein: 18, carbs: 30, fats: 20, type: 'non-veg', cuisine: 'Continental' }
        ];
    }

    private getAllLunchOptions(): Meal[] {
        return [
            { name: 'Brown Rice with Dal and Vegetables', ingredients: ['Brown rice (150g)', 'Moong dal (100g)', 'Mixed vegetables (100g)', 'Salad', 'Curd (100g)'], calories: 520, protein: 18, carbs: 85, fats: 10, type: 'veg', cuisine: 'North Indian' },
            { name: 'Roti with Paneer Curry', ingredients: ['Whole wheat roti (3)', 'Paneer (100g)', 'Tomato gravy', 'Green salad', 'Buttermilk'], calories: 550, protein: 22, carbs: 70, fats: 18, type: 'veg', cuisine: 'North Indian' },
            { name: 'Quinoa Pulao with Raita', ingredients: ['Quinoa (150g)', 'Mixed vegetables (100g)', 'Curd (150g)', 'Cucumber', 'Spices'], calories: 480, protein: 16, carbs: 75, fats: 12, type: 'veg', cuisine: 'Continental' },
            { name: 'Vegetable Khichdi', ingredients: ['Rice (100g)', 'Moong dal (50g)', 'Mixed vegetables (100g)', 'Ghee (1 tsp)', 'Curd'], calories: 450, protein: 14, carbs: 78, fats: 8, type: 'veg', cuisine: 'North Indian' },
            { name: 'Rajma Chawal', ingredients: ['Rice (150g)', 'Kidney beans curry', 'Salad'], calories: 580, protein: 18, carbs: 90, fats: 12, type: 'veg', cuisine: 'North Indian' },
            { name: 'Chicken Curry with Rice', ingredients: ['Chicken (150g)', 'Rice (150g)', 'Spices', 'Yogurt'], calories: 600, protein: 40, carbs: 60, fats: 15, type: 'non-veg', cuisine: 'North Indian' },
            { name: 'Grilled Chicken Salad', ingredients: ['Chicken breast', 'Lettuce', 'Cherry tomatoes', 'Olive oil dressing'], calories: 450, protein: 45, carbs: 10, fats: 20, type: 'non-veg', cuisine: 'Continental' },
            { name: 'Fish Curry with Rice', ingredients: ['Fish', 'Rice', 'Coconut milk curry'], calories: 550, protein: 35, carbs: 60, fats: 18, type: 'non-veg', cuisine: 'South Indian' },
            { name: 'Chole Bhature (Lite)', ingredients: ['Chickpeas', 'Wheat bhature (baked/less oil)', 'Onion'], calories: 600, protein: 16, carbs: 95, fats: 15, type: 'veg', cuisine: 'North Indian' }
        ];
    }

    private getAllDinnerOptions(): Meal[] {
        return [
            { name: 'Vegetable Soup with Roti', ingredients: ['Mixed vegetable soup (300ml)', 'Whole wheat roti (2)', 'Grilled vegetables', 'Salad'], calories: 380, protein: 12, carbs: 60, fats: 8, type: 'veg', cuisine: 'North Indian' },
            { name: 'Dal Tadka with Rice', ingredients: ['Toor dal (100g)', 'Brown rice (100g)', 'Ghee (1 tsp)', 'Salad', 'Lemon'], calories: 420, protein: 16, carbs: 68, fats: 10, type: 'veg', cuisine: 'North Indian' },
            { name: 'Palak Paneer with Roti', ingredients: ['Spinach (200g)', 'Paneer (80g)', 'Whole wheat roti (2)', 'Salad'], calories: 450, protein: 20, carbs: 55, fats: 16, type: 'veg', cuisine: 'North Indian' },
            { name: 'Mixed Vegetable Curry with Millet', ingredients: ['Millet (150g)', 'Mixed vegetables (150g)', 'Coconut (20g)', 'Spices', 'Curd'], calories: 400, protein: 12, carbs: 70, fats: 9, type: 'veg', cuisine: 'South Indian' },
            { name: 'Grilled Fish with Veggies', ingredients: ['Fish fillet', 'Steamed vegetables', 'Lemon butter'], calories: 350, protein: 35, carbs: 10, fats: 15, type: 'non-veg', cuisine: 'Continental' },
            { name: 'Lentil Soup', ingredients: ['Lentils', 'Carrots', 'Celery', 'Spices'], calories: 300, protein: 18, carbs: 40, fats: 5, type: 'veg', cuisine: 'Continental' },
            { name: 'Chicken Stir Fry', ingredients: ['Chicken strips', 'Bell peppers', 'Broccoli', 'Soy sauce'], calories: 400, protein: 35, carbs: 15, fats: 12, type: 'non-veg', cuisine: 'Asian' },
            { name: 'Pasta Arrabbiata', ingredients: ['Whole wheat pasta', 'Tomato sauce', 'Basil', 'Parmesan'], calories: 450, protein: 14, carbs: 70, fats: 10, type: 'veg', cuisine: 'Italian' }
        ];
    }

    private getAllSnackOptions(): Meal[] {
        return [
            { name: 'Fruit Salad', ingredients: ['Apple (1)', 'Banana (1)', 'Orange (1)', 'Pomegranate (50g)'], calories: 150, protein: 2, carbs: 38, fats: 1, type: 'veg', cuisine: 'Continental' },
            { name: 'Roasted Chana', ingredients: ['Roasted chickpeas (50g)', 'Lemon juice', 'Chaat masala'], calories: 180, protein: 8, carbs: 30, fats: 3, type: 'veg', cuisine: 'North Indian' },
            { name: 'Vegetable Sandwich', ingredients: ['Whole wheat bread (2 slices)', 'Cucumber', 'Tomato', 'Lettuce', 'Mint chutney'], calories: 200, protein: 6, carbs: 35, fats: 4, type: 'veg', cuisine: 'Continental' },
            { name: 'Yogurt with Berries', ingredients: ['Greek yogurt', 'Mixed berries', 'Honey'], calories: 180, protein: 12, carbs: 20, fats: 4, type: 'veg', cuisine: 'Continental' },
            { name: 'Nuts Mix', ingredients: ['Almonds', 'Walnuts', 'Seeds'], calories: 200, protein: 6, carbs: 8, fats: 18, type: 'veg', cuisine: 'Continental' },
            { name: 'Boiled Egg Whites', ingredients: ['Egg whites (3)', 'Pepper'], calories: 50, protein: 11, carbs: 0, fats: 0, type: 'non-veg', cuisine: 'Continental' }
        ];
    }

    public getRestrictions(user: UserProfile): string[] {
        const restrictions: string[] = [];
        if (user.allergies) {
            restrictions.push(...user.allergies);
        }
        if (user.chronicConditions) {
            user.chronicConditions.forEach(condition => {
                const lower = condition.toLowerCase();
                if (lower.includes('diabetes')) restrictions.push('high sugar', 'refined carbs', 'white rice');
                if (lower.includes('hypertension') || lower.includes('blood pressure')) restrictions.push('high salt', 'pickles', 'processed foods');
                if (lower.includes('heart') || lower.includes('cardiac')) restrictions.push('saturated fats', 'fried foods', 'red meat');
                if (lower.includes('kidney')) restrictions.push('high protein', 'high potassium');
            });
        }
        return restrictions;
    }

    private calculateNutritionGoals(user: UserProfile): NutritionGoals {
        let baseCalories = 2000;
        if (user.gender === 'male') baseCalories = 2200;
        else if (user.gender === 'female') baseCalories = 1800;

        if (user.age > 60) baseCalories -= 200;
        else if (user.age < 30) baseCalories += 200;

        const hasHeartDisease = user.chronicConditions?.some(c =>
            c.toLowerCase().includes('heart') || c.toLowerCase().includes('cardiac')
        );
        if (hasHeartDisease) baseCalories -= 100;

        return {
            dailyCalories: baseCalories,
            protein: Math.round(baseCalories * 0.15 / 4),
            carbs: Math.round(baseCalories * 0.55 / 4),
            fats: Math.round(baseCalories * 0.30 / 9),
            fiber: 30,
        };
    }

    private generateMeals(user: UserProfile, duration: string, restrictions: string[]): DailyMeal[] {
        const days = duration === '1_week' ? 7 : duration === '2_weeks' ? 14 : 30;
        const meals: DailyMeal[] = [];
        const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

        for (let i = 0; i < days; i++) {
            meals.push({
                day: `Day ${i + 1} (${dayNames[i % 7]})`,
                breakfast: this.getBreakfast(restrictions),
                lunch: this.getLunch(restrictions),
                dinner: this.getDinner(restrictions),
                snacks: this.getSnacks(restrictions),
            });
        }
        return meals;
    }

    private getBreakfast(restrictions: string[]): Meal {
        return this.filterMealLegacy(this.getAllBreakfastOptions(), restrictions);
    }
    private getLunch(restrictions: string[]): Meal {
        return this.filterMealLegacy(this.getAllLunchOptions(), restrictions);
    }
    private getDinner(restrictions: string[]): Meal {
        return this.filterMealLegacy(this.getAllDinnerOptions(), restrictions);
    }
    private getSnacks(restrictions: string[]): Meal[] {
        return [this.filterMealLegacy(this.getAllSnackOptions(), restrictions)];
    }

    private filterMealLegacy(options: Meal[], restrictions: string[]): Meal {
        // Simple filter for legacy purposes
        const filtered = options.filter(meal => {
            return !meal.ingredients.some(ingredient =>
                restrictions.some(restriction =>
                    ingredient.toLowerCase().includes(restriction.toLowerCase())
                )
            );
        });
        const availableOptions = filtered.length > 0 ? filtered : options;
        return availableOptions[Math.floor(Math.random() * availableOptions.length)];
    }

    private generateRecommendations(user: UserProfile): string[] {
        const recommendations: string[] = [
            'Drink at least 8 glasses of water daily',
            'Eat meals at regular times',
            'Include seasonal fruits and vegetables',
        ];
        if (user.chronicConditions) {
            user.chronicConditions.forEach(condition => {
                const lower = condition.toLowerCase();
                if (lower.includes('diabetes')) {
                    recommendations.push('Monitor blood sugar before and after meals');
                    recommendations.push('Avoid skipping meals');
                    recommendations.push('Choose whole grains over refined grains');
                }
                if (lower.includes('hypertension')) {
                    recommendations.push('Limit salt intake to less than 5g per day');
                    recommendations.push('Avoid processed and packaged foods');
                }
                if (lower.includes('heart')) {
                    recommendations.push('Include omega-3 rich foods (walnuts, flaxseeds)');
                    recommendations.push('Limit saturated fats');
                    recommendations.push('Exercise for 30 minutes daily');
                }
            });
        }
        return recommendations;
    }

    saveDietPlan(plan: DietPlan): void {
        const saved = localStorage.getItem('vitavoice_diet_plans');
        const plans = saved ? JSON.parse(saved) : [];
        plans.push(plan);
        localStorage.setItem('vitavoice_diet_plans', JSON.stringify(plans));
    }

    getUserDietPlans(userId: string): DietPlan[] {
        const saved = localStorage.getItem('vitavoice_diet_plans');
        if (!saved) return [];
        const plans = JSON.parse(saved, (key, value) => {
            if (key === 'generatedAt') return new Date(value);
            return value;
        });
        return plans.filter((p: DietPlan) => p.userId === userId);
    }
}

export const dietPlanService = new DietPlanService();
