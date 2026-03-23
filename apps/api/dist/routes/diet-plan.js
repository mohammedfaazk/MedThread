"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const diet_plan_service_1 = require("../services/diet-plan.service");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const dietPlanService = new diet_plan_service_1.DietPlanService();
// Generate new diet plan
router.post('/generate', auth_1.authenticate, async (req, res) => {
    try {
        const userId = req.userId;
        const { dailyCalorieGoal } = req.body;
        // Validate calorie goal
        if (!dailyCalorieGoal || dailyCalorieGoal < 1000 || dailyCalorieGoal > 5000) {
            return res.status(400).json({
                success: false,
                error: 'Daily calorie goal must be between 1000 and 5000'
            });
        }
        const result = await dietPlanService.generateDietPlan(userId, parseInt(dailyCalorieGoal));
        if (result.success) {
            res.status(201).json(result);
        }
        else {
            res.status(400).json(result);
        }
    }
    catch (error) {
        console.error('Diet plan generation error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});
// Get active diet plan
router.get('/active', auth_1.authenticate, async (req, res) => {
    try {
        const userId = req.userId;
        const result = await dietPlanService.getActiveDietPlan(userId);
        res.json(result);
    }
    catch (error) {
        console.error('Active diet plan fetch error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});
// Save diet plan
router.post('/:dietPlanId/save', auth_1.authenticate, async (req, res) => {
    try {
        const userId = req.userId;
        const { dietPlanId } = req.params;
        const result = await dietPlanService.saveDietPlan(userId, dietPlanId);
        if (result.success) {
            res.json(result);
        }
        else {
            res.status(400).json(result);
        }
    }
    catch (error) {
        console.error('Diet plan save error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});
exports.default = router;
