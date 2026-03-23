"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cmeCreditsRouter = void 0;
const express_1 = require("express");
const cme_credits_service_1 = require("../services/cme-credits.service");
const auth_1 = require("../middleware/auth");
const asyncHandler_1 = require("../middleware/asyncHandler");
exports.cmeCreditsRouter = (0, express_1.Router)();
/**
 * GET /api/cme-credits/my-credits
 * Get doctor's CME credits summary
 */
exports.cmeCreditsRouter.get('/my-credits', auth_1.authenticate, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const doctorId = req.user.userId;
    const credits = await cme_credits_service_1.cmeCreditsService.getDoctorCmeCredits(doctorId);
    res.json(credits);
}));
/**
 * GET /api/cme-credits/leaderboard
 * Get CME leaderboard
 */
exports.cmeCreditsRouter.get('/leaderboard', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { timeframe = 'month', limit = 10 } = req.query;
    const leaderboard = await cme_credits_service_1.cmeCreditsService.getCmeLeaderboard(timeframe, Number(limit));
    res.json(leaderboard);
}));
/**
 * GET /api/cme-credits/opportunities
 * Get CME earning opportunities
 */
exports.cmeCreditsRouter.get('/opportunities', auth_1.authenticate, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const doctorId = req.user.userId;
    const opportunities = await cme_credits_service_1.cmeCreditsService.getCmeOpportunities(doctorId);
    res.json(opportunities);
}));
/**
 * POST /api/cme-credits/award
 * Award CME credits (admin or auto-trigger)
 */
exports.cmeCreditsRouter.post('/award', auth_1.authenticate, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const activity = req.body;
    const result = await cme_credits_service_1.cmeCreditsService.awardCredits(activity);
    res.json(result);
}));
/**
 * POST /api/cme-credits/check-reply/:replyId
 * Check if reply qualifies for CME credits
 */
exports.cmeCreditsRouter.post('/check-reply/:replyId', auth_1.authenticate, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { replyId } = req.params;
    const result = await cme_credits_service_1.cmeCreditsService.checkAndAwardForReply(replyId);
    res.json(result || { message: 'Reply does not qualify for CME credits yet' });
}));
/**
 * POST /api/cme-credits/certificate/:activityId
 * Generate CME certificate
 */
exports.cmeCreditsRouter.post('/certificate/:activityId', auth_1.authenticate, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { activityId } = req.params;
    const doctorId = req.user.userId;
    const certificate = await cme_credits_service_1.cmeCreditsService.generateCertificate(doctorId, activityId);
    res.json(certificate);
}));
