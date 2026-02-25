"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.smartMatchingRouter = void 0;
const express_1 = require("express");
const auth_refactored_1 = require("../middleware/auth.refactored");
const smart_matching_service_1 = require("../services/smart-matching.service");
exports.smartMatchingRouter = (0, express_1.Router)();
/**
 * POST /api/matching/find
 * Find best matching doctors for patient
 */
exports.smartMatchingRouter.post('/matching/find', auth_refactored_1.authenticate, async (req, res) => {
    try {
        const patientId = req.userId;
        const { symptoms, location, preferredLanguage, insuranceProvider, maxDistance, minRating, consultationType, preferredGender, limit } = req.body;
        if (!symptoms || symptoms.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Symptoms are required'
            });
        }
        const criteria = {
            symptoms,
            patientLocation: location,
            preferredLanguage,
            insuranceProvider,
            maxDistance,
            minRating,
            consultationType,
            preferredGender
        };
        const matches = await smart_matching_service_1.smartMatchingService.findMatches(patientId, criteria, limit || 10);
        res.json({
            success: true,
            data: {
                matches,
                total: matches.length
            }
        });
    }
    catch (error) {
        console.error('[API] Error finding matches:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to find matching doctors'
        });
    }
});
/**
 * GET /api/matching/results/:resultId
 * Get match details
 */
exports.smartMatchingRouter.get('/matching/results/:resultId', auth_refactored_1.authenticate, async (req, res) => {
    try {
        const { resultId } = req.params;
        const match = await smart_matching_service_1.smartMatchingService.getMatchDetails(parseInt(resultId));
        if (!match) {
            return res.status(404).json({
                success: false,
                error: 'Match not found'
            });
        }
        res.json({
            success: true,
            data: match
        });
    }
    catch (error) {
        console.error('[API] Error fetching match details:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch match details'
        });
    }
});
/**
 * PUT /api/matching/preferences
 * Update patient matching preferences
 */
exports.smartMatchingRouter.put('/matching/preferences', auth_refactored_1.authenticate, async (req, res) => {
    try {
        const patientId = req.userId;
        const preferences = req.body;
        await smart_matching_service_1.smartMatchingService.updatePatientPreferences(patientId, preferences);
        res.json({
            success: true,
            message: 'Preferences updated successfully'
        });
    }
    catch (error) {
        console.error('[API] Error updating preferences:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update preferences'
        });
    }
});
/**
 * POST /api/matching/feedback
 * Submit feedback on matching result
 */
exports.smartMatchingRouter.post('/matching/feedback', auth_refactored_1.authenticate, async (req, res) => {
    try {
        const patientId = req.userId;
        const { matchingResultId, wasHelpful, feedbackType, feedbackText, matchAccuracyRating } = req.body;
        if (!matchingResultId) {
            return res.status(400).json({
                success: false,
                error: 'Matching result ID is required'
            });
        }
        await smart_matching_service_1.smartMatchingService.submitFeedback(matchingResultId, patientId, {
            wasHelpful,
            feedbackType,
            feedbackText,
            matchAccuracyRating
        });
        res.json({
            success: true,
            message: 'Feedback submitted successfully'
        });
    }
    catch (error) {
        console.error('[API] Error submitting feedback:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to submit feedback'
        });
    }
});
exports.default = exports.smartMatchingRouter;
