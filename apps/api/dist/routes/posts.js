"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const requireVerifiedDoctor_1 = require("../middleware/requireVerifiedDoctor");
const post_service_1 = require("../services/post.service");
const router = (0, express_1.Router)();
// Create post - requires verified doctor
router.post('/', auth_1.authenticate, requireVerifiedDoctor_1.requireVerifiedDoctor, async (req, res, next) => {
    try {
        const { title, content, type, url, mediaUrls, communityId, flairId, isNSFW, isSpoiler, isDraft } = req.body;
        if (!title || !communityId) {
            return res.status(400).json({ error: 'Title and community are required' });
        }
        const post = await post_service_1.postService.createPost({
            title,
            content,
            type,
            url,
            mediaUrls,
            authorId: req.userId,
            communityId,
            flairId,
            isNSFW,
            isSpoiler,
            isDraft,
        });
        res.status(201).json(post);
    }
    catch (error) {
        next(error);
    }
});
// Get posts (with filters)
router.get('/', async (req, res, next) => {
    try {
        const { community, sort, limit, offset, authorId, specialty, authorType, dateFrom, dateTo, postType } = req.query;
        const posts = await post_service_1.postService.getPosts({
            community: community,
            sort: sort,
            limit: limit ? Number(limit) : 20,
            offset: offset ? Number(offset) : 0,
            authorId: authorId,
            specialty: specialty,
            authorType: authorType,
            dateFrom: dateFrom ? new Date(dateFrom) : undefined,
            dateTo: dateTo ? new Date(dateTo) : undefined,
            postType: postType,
        });
        res.json(posts);
    }
    catch (error) {
        next(error);
    }
});
// Get single post
router.get('/:id', async (req, res, next) => {
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
        const post = await post_service_1.postService.getPostById(req.params.id, userId);
        res.json(post);
    }
    catch (error) {
        if (error.message === 'Post not found') {
            return res.status(404).json({ error: 'Post not found' });
        }
        next(error);
    }
});
// Update post - requires verified doctor
router.put('/:id', auth_1.authenticate, requireVerifiedDoctor_1.requireVerifiedDoctor, async (req, res, next) => {
    try {
        const { title, content, isNSFW, isSpoiler } = req.body;
        const post = await post_service_1.postService.updatePost(req.params.id, req.userId, {
            title,
            content,
            isNSFW,
            isSpoiler,
        });
        res.json(post);
    }
    catch (error) {
        next(error);
    }
});
// Delete post - requires verified doctor
router.delete('/:id', auth_1.authenticate, requireVerifiedDoctor_1.requireVerifiedDoctor, async (req, res, next) => {
    try {
        await post_service_1.postService.deletePost(req.params.id, req.userId);
        res.json({ success: true, message: 'Post deleted' });
    }
    catch (error) {
        next(error);
    }
});
// Vote on post - requires verified doctor
router.post('/:id/vote', auth_1.authenticate, requireVerifiedDoctor_1.requireVerifiedDoctor, async (req, res, next) => {
    try {
        const { value } = req.body;
        if (value !== 1 && value !== -1) {
            return res.status(400).json({ error: 'Vote value must be 1 or -1' });
        }
        const result = await post_service_1.postService.votePost(req.params.id, req.userId, value);
        res.json(result);
    }
    catch (error) {
        next(error);
    }
});
// Save/unsave post - requires verified doctor
router.post('/:id/save', auth_1.authenticate, requireVerifiedDoctor_1.requireVerifiedDoctor, async (req, res, next) => {
    try {
        const result = await post_service_1.postService.savePost(req.params.id, req.userId);
        res.json(result);
    }
    catch (error) {
        next(error);
    }
});
// Hide/unhide post - requires verified doctor
router.post('/:id/hide', auth_1.authenticate, requireVerifiedDoctor_1.requireVerifiedDoctor, async (req, res, next) => {
    try {
        const result = await post_service_1.postService.hidePost(req.params.id, req.userId);
        res.json(result);
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
// Get user's drafts
router.get('/drafts', auth_1.authenticate, async (req, res, next) => {
    try {
        const drafts = await post_service_1.postService.getDrafts(req.userId);
        res.json(drafts);
    }
    catch (error) {
        next(error);
    }
});
// Publish a draft - requires verified doctor
router.post('/:id/publish', auth_1.authenticate, requireVerifiedDoctor_1.requireVerifiedDoctor, async (req, res, next) => {
    try {
        const post = await post_service_1.postService.publishDraft(req.params.id, req.userId);
        res.json(post);
    }
    catch (error) {
        next(error);
    }
});
// Get saved posts
router.get('/saved', auth_1.authenticate, async (req, res, next) => {
    try {
        const { limit, offset } = req.query;
        const posts = await post_service_1.postService.getSavedPosts(req.userId, limit ? Number(limit) : 20, offset ? Number(offset) : 0);
        res.json(posts);
    }
    catch (error) {
        next(error);
    }
});
// Get hidden posts
router.get('/hidden', auth_1.authenticate, async (req, res, next) => {
    try {
        const { limit, offset } = req.query;
        const posts = await post_service_1.postService.getHiddenPosts(req.userId, limit ? Number(limit) : 20, offset ? Number(offset) : 0);
        res.json(posts);
    }
    catch (error) {
        next(error);
    }
});
