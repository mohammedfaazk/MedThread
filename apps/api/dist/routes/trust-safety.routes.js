"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trustSafetyRouter = void 0;
const express_1 = require("express");
const auth_refactored_1 = require("../middleware/auth.refactored");
const trust_safety_service_1 = require("../services/trust-safety.service");
exports.trustSafetyRouter = (0, express_1.Router)();
/**
 * POST /api/trust/license/submit
 * Submit medical license for verification
 */
exports.trustSafetyRouter.post('/trust/license/submit', auth_refactored_1.authenticate, async (req, res) => {
    try {
        const doctorId = req.userId;
        const result = await trust_safety_service_1.trustSafetyService.submitLicenseVerification({
            doctorId,
            ...req.body
        });
        res.json({ success: true, data: result });
    }
    catch (error) {
        console.error('[API] Error submitting license:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});
/**
 * POST /api/trust/license/verify/:id
 * Verify medical license (admin only)
 */
exports.trustSafetyRouter.post('/trust/license/verify/:id', auth_refactored_1.authenticate, async (req, res) => {
    try {
        const verifiedBy = req.userId;
        const { id } = req.params;
        const { approved, notes } = req.body;
        const result = await trust_safety_service_1.trustSafetyService.verifyLicense(parseInt(id), verifiedBy, approved, notes);
        res.json({ success: true, data: result });
    }
    catch (error) {
        console.error('[API] Error verifying license:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});
/**
 * POST /api/trust/hospital/submit
 * Submit hospital affiliation for verification
 */
exports.trustSafetyRouter.post('/trust/hospital/submit', auth_refactored_1.authenticate, async (req, res) => {
    try {
        const doctorId = req.userId;
        const result = await trust_safety_service_1.trustSafetyService.submitHospitalAffiliation({
            doctorId,
            ...req.body
        });
        res.json({ success: true, data: result });
    }
    catch (error) {
        console.error('[API] Error submitting hospital affiliation:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});
/**
 * POST /api/trust/hospital/verify/:id
 * Verify hospital affiliation (admin only)
 */
exports.trustSafetyRouter.post('/trust/hospital/verify/:id', auth_refactored_1.authenticate, async (req, res) => {
    try {
        const verifiedBy = req.userId;
        const { id } = req.params;
        const { approved, notes } = req.body;
        const result = await trust_safety_service_1.trustSafetyService.verifyHospitalAffiliation(parseInt(id), verifiedBy, approved, notes);
        res.json({ success: true, data: result });
    }
    catch (error) {
        console.error('[API] Error verifying hospital affiliation:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});
/**
 * POST /api/trust/endorsement
 * Create peer endorsement
 */
exports.trustSafetyRouter.post('/trust/endorsement', auth_refactored_1.authenticate, async (req, res) => {
    try {
        const endorserId = req.userId;
        const result = await trust_safety_service_1.trustSafetyService.createPeerEndorsement({
            endorserId,
            ...req.body
        });
        res.json({ success: true, data: result });
    }
    catch (error) {
        console.error('[API] Error creating endorsement:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});
/**
 * POST /api/trust/patient/verify
 * Verify patient identity
 */
exports.trustSafetyRouter.post('/trust/patient/verify', auth_refactored_1.authenticate, async (req, res) => {
    try {
        const patientId = req.userId;
        const result = await trust_safety_service_1.trustSafetyService.verifyPatientIdentity({
            patientId,
            ...req.body
        });
        res.json({ success: true, data: result });
    }
    catch (error) {
        console.error('[API] Error verifying patient:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});
/**
 * POST /api/trust/moderate
 * Moderate content with AI
 */
exports.trustSafetyRouter.post('/trust/moderate', async (req, res) => {
    try {
        const result = await trust_safety_service_1.trustSafetyService.moderateContent(req.body);
        res.json({ success: true, data: result });
    }
    catch (error) {
        console.error('[API] Error moderating content:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});
/**
 * POST /api/trust/peer-review/request
 * Request peer review of medical advice
 */
exports.trustSafetyRouter.post('/trust/peer-review/request', auth_refactored_1.authenticate, async (req, res) => {
    try {
        const requestedBy = req.userId;
        const result = await trust_safety_service_1.trustSafetyService.requestPeerReview({
            requestedBy,
            ...req.body
        });
        res.json({ success: true, data: result });
    }
    catch (error) {
        console.error('[API] Error requesting peer review:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});
/**
 * POST /api/trust/peer-review/:id/submit
 * Submit peer review
 */
exports.trustSafetyRouter.post('/trust/peer-review/:id/submit', auth_refactored_1.authenticate, async (req, res) => {
    try {
        const reviewerId = req.userId;
        const { id } = req.params;
        const result = await trust_safety_service_1.trustSafetyService.submitPeerReview(parseInt(id), reviewerId, req.body);
        res.json({ success: true, data: result });
    }
    catch (error) {
        console.error('[API] Error submitting peer review:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});
/**
 * POST /api/trust/conflict/flag
 * Flag conflicting diagnosis
 */
exports.trustSafetyRouter.post('/trust/conflict/flag', auth_refactored_1.authenticate, async (req, res) => {
    try {
        const result = await trust_safety_service_1.trustSafetyService.flagConflictingDiagnosis(req.body);
        res.json({ success: true, data: result });
    }
    catch (error) {
        console.error('[API] Error flagging conflict:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});
/**
 * POST /api/trust/quality-review/trigger
 * Trigger doctor quality review (admin only)
 */
exports.trustSafetyRouter.post('/trust/quality-review/trigger', auth_refactored_1.authenticate, async (req, res) => {
    try {
        const { doctorId, triggerType, triggerDetails } = req.body;
        const result = await trust_safety_service_1.trustSafetyService.triggerQualityReview(doctorId, triggerType, triggerDetails);
        res.json({ success: true, data: result });
    }
    catch (error) {
        console.error('[API] Error triggering quality review:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});
/**
 * GET /api/trust/score/:userId
 * Get user trust score
 */
exports.trustSafetyRouter.get('/trust/score/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const trustScore = await trust_safety_service_1.trustSafetyService.getTrustScore(userId);
        res.json({ success: true, data: trustScore });
    }
    catch (error) {
        console.error('[API] Error fetching trust score:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});
/**
 * POST /api/trust/score/calculate
 * Calculate/update trust score
 */
exports.trustSafetyRouter.post('/trust/score/calculate', auth_refactored_1.authenticate, async (req, res) => {
    try {
        const userId = req.userId;
        const { userType } = req.body;
        const score = await trust_safety_service_1.trustSafetyService.calculateTrustScore(userId, userType);
        res.json({ success: true, data: { trustScore: score } });
    }
    catch (error) {
        console.error('[API] Error calculating trust score:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});
exports.default = exports.trustSafetyRouter;
