"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const post_priority_service_1 = require("../services/post-priority.service");
const auth_refactored_1 = require("../middleware/auth.refactored");
const router = (0, express_1.Router)();
/**
 * POST /api/post-priority/analyze/:postId
 * Analyze post priority (can be called when post is created)
 */
router.post('/analyze/:postId', auth_refactored_1.authenticate, async (req, res) => {
    try {
        const { postId } = req.params;
        const { title, content } = req.body;
        const analysis = await post_priority_service_1.postPriorityService.analyzePostPriority(postId, title, content);
        res.json({ success: true, data: analysis });
    }
    catch (error) {
        console.error('Error analyzing post priority:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});
/**
 * POST /api/post-priority/analyze-from-chips/:postId
 * Analyze priority using structured chip data from PatientCreatePostModal.
 * More accurate than text scanning — uses sum scoring + LLM on description.
 * Body: { symptoms, duration, age, gender, existingConditions, description }
 */
router.post('/analyze-from-chips/:postId', auth_refactored_1.authenticate, async (req, res) => {
    try {
        const { postId } = req.params;
        const analysis = await post_priority_service_1.postPriorityService.analyzeFromChips(postId, req.body);
        res.json({ success: true, data: analysis });
    }
    catch (error) {
        console.error('Error analyzing post priority from chips:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});
/**
 * GET /api/post-priority/doctor-feed
 * Get prioritized feed for doctors with urgency-based sorting
 */
router.get('/doctor-feed', auth_refactored_1.authenticate, async (req, res) => {
    try {
        const { page, limit, priority, communityId } = req.query;
        const data = await post_priority_service_1.postPriorityService.getDoctorPrioritizedFeed(req.userId, {
            page: page ? parseInt(page) : 1,
            limit: limit ? parseInt(limit) : 20,
            priorityFilter: priority || 'ALL',
            communityId: communityId
        });
        res.json({ success: true, data });
    }
    catch (error) {
        console.error('Error fetching doctor prioritized feed:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});
/**
 * GET /api/post-priority/stats
 * Get priority distribution statistics
 */
router.get('/stats', auth_refactored_1.authenticate, async (req, res) => {
    try {
        const { communityId } = req.query;
        const stats = await post_priority_service_1.postPriorityService.getPriorityStats(communityId);
        res.json({ success: true, data: stats });
    }
    catch (error) {
        console.error('Error fetching priority stats:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});
/**
 * GET /api/post-priority/trending-symptoms
 * Get trending symptoms from recent high-priority posts
 */
router.get('/trending-symptoms', auth_refactored_1.authenticate, async (req, res) => {
    try {
        const { days } = req.query;
        const data = await post_priority_service_1.postPriorityService.getTrendingSymptoms(days ? parseInt(days) : 7);
        res.json({ success: true, data });
    }
    catch (error) {
        console.error('Error fetching trending symptoms:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});
/**
 * POST /api/post-priority/bulk-analyze
 * Bulk analyze existing posts (admin only)
 */
router.post('/bulk-analyze', auth_refactored_1.authenticate, (0, auth_refactored_1.requireRole)('ADMIN'), async (req, res) => {
    try {
        const { limit } = req.body;
        const result = await post_priority_service_1.postPriorityService.bulkAnalyzePosts(limit);
        res.json({ success: true, data: result });
    }
    catch (error) {
        console.error('Error bulk analyzing posts:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});
exports.default = router;
