"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const requireVerifiedDoctor_1 = require("../middleware/requireVerifiedDoctor");
const community_service_1 = require("../services/community.service");
const router = (0, express_1.Router)();
// Get all communities
router.get('/', async (req, res, next) => {
    try {
        const result = await community_service_1.communityService.getCommunities({
            search: req.query.search,
            sortBy: req.query.sortBy,
            page: parseInt(req.query.page) || 1,
            limit: parseInt(req.query.limit) || 100,
        });
        // Return just the communities array for simplicity
        res.json(result.communities);
    }
    catch (error) {
        next(error);
    }
});
// Create community - requires verified doctor
router.post('/', auth_1.authenticate, requireVerifiedDoctor_1.requireVerifiedDoctor, async (req, res, next) => {
    try {
        const { name, displayName, description, isNSFW, isPrivate } = req.body;
        const community = await community_service_1.communityService.createCommunity({
            name,
            displayName,
            description,
            isNSFW,
            isPrivate,
            creatorId: req.userId,
        });
        res.status(201).json(community);
    }
    catch (error) {
        next(error);
    }
});
// Get single community
router.get('/:name', async (req, res, next) => {
    try {
        // Extract userId from token if provided (optional auth)
        let userId;
        const token = req.headers.authorization?.split(' ')[1];
        if (token) {
            try {
                const jwt = require('jsonwebtoken');
                const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
                userId = decoded.userId;
            }
            catch (error) {
                // Invalid token, continue without userId
            }
        }
        const community = await community_service_1.communityService.getCommunityByName(req.params.name, userId);
        res.json(community);
    }
    catch (error) {
        next(error);
    }
});
// Update community - requires verified doctor
router.put('/:id', auth_1.authenticate, requireVerifiedDoctor_1.requireVerifiedDoctor, async (req, res, next) => {
    try {
        const { displayName, description, icon, banner, rules, theme } = req.body;
        const community = await community_service_1.communityService.updateCommunity(req.params.id, req.userId, { displayName, description, icon, banner, rules, theme });
        res.json(community);
    }
    catch (error) {
        next(error);
    }
});
// Join community - requires verified doctor
router.post('/:id/join', auth_1.authenticate, requireVerifiedDoctor_1.requireVerifiedDoctor, async (req, res, next) => {
    try {
        const result = await community_service_1.communityService.joinCommunity(req.params.id, req.userId);
        res.json(result);
    }
    catch (error) {
        next(error);
    }
});
// Leave community - requires verified doctor
router.post('/:id/leave', auth_1.authenticate, requireVerifiedDoctor_1.requireVerifiedDoctor, async (req, res, next) => {
    try {
        const result = await community_service_1.communityService.leaveCommunity(req.params.id, req.userId);
        res.json(result);
    }
    catch (error) {
        next(error);
    }
});
// Get community members
router.get('/:id/members', async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const result = await community_service_1.communityService.getCommunityMembers(req.params.id, page, limit);
        res.json(result);
    }
    catch (error) {
        next(error);
    }
});
// Get community moderators
router.get('/:id/moderators', async (req, res, next) => {
    try {
        const moderators = await community_service_1.communityService.getCommunityModerators(req.params.id);
        res.json(moderators);
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
