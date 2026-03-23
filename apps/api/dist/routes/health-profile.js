"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const health_profile_service_1 = require("../services/health-profile.service");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const healthProfileService = new health_profile_service_1.HealthProfileService();
// Get health profile
router.get('/', auth_1.authenticate, async (req, res) => {
    try {
        const userId = req.userId;
        const result = await healthProfileService.getHealthProfile(userId);
        res.json(result);
    }
    catch (error) {
        console.error('Health profile fetch error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});
// Create or update health profile — all fields optional, no required-field validation
router.post('/', auth_1.authenticate, async (req, res) => {
    try {
        const userId = req.userId;
        const result = await healthProfileService.createOrUpdateHealthProfile(userId, req.body);
        if (result.success) {
            res.status(201).json(result);
        }
        else {
            res.status(500).json(result);
        }
    }
    catch (error) {
        console.error('Health profile creation error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});
// Init — creates an empty profile only if none exists, never overwrites
router.post('/init', auth_1.authenticate, async (req, res) => {
    try {
        const userId = req.userId;
        const result = await healthProfileService.createIfNotExists(userId, {
            medicalConditions: [],
            foodAllergies: [],
            riskLevel: 'NONE',
        });
        res.json(result);
    }
    catch (error) {
        console.error('Health profile init error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});
// Partial update — merge into existing profile
router.put('/', auth_1.authenticate, async (req, res) => {
    try {
        const userId = req.userId;
        const result = await healthProfileService.createOrUpdateHealthProfile(userId, req.body);
        if (result.success) {
            res.json(result);
        }
        else {
            res.status(500).json(result);
        }
    }
    catch (error) {
        console.error('Health profile update error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});
// Delete health profile
router.delete('/', auth_1.authenticate, async (req, res) => {
    try {
        const userId = req.userId;
        const result = await healthProfileService.deleteHealthProfile(userId);
        res.json(result);
    }
    catch (error) {
        console.error('Health profile deletion error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});
exports.default = router;
