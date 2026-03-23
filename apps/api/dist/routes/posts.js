"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
// Endorse post - only doctors can endorse, only doctor-authored posts
router.post('/:id/endorse', auth_1.authenticate, async (req, res, next) => {
    try {
        const { prisma } = await Promise.resolve().then(() => __importStar(require('@medthread/database')));
        const doctorId = req.userId;
        // Verify endorser is a doctor
        const endorser = await prisma.user.findUnique({
            where: { id: doctorId },
            select: { role: true, doctorVerificationStatus: true }
        });
        if (!endorser || (endorser.role !== 'DOCTOR' && endorser.role !== 'VERIFIED_DOCTOR')) {
            return res.status(403).json({ success: false, error: 'Only doctors can endorse posts' });
        }
        // Get the post and its author
        const post = await prisma.post.findUnique({
            where: { id: req.params.id },
            select: { authorId: true, author: { select: { role: true } } }
        });
        if (!post) {
            return res.status(404).json({ success: false, error: 'Post not found' });
        }
        // Only doctor-authored posts can be endorsed
        if (post.author.role !== 'DOCTOR' && post.author.role !== 'VERIFIED_DOCTOR') {
            return res.status(400).json({ success: false, error: 'Only posts by doctors can be endorsed' });
        }
        // Prevent self-endorsement
        if (post.authorId === doctorId) {
            return res.status(400).json({ success: false, error: 'You cannot endorse your own post' });
        }
        // Toggle endorsement
        const existing = await prisma.doctorEndorsement.findUnique({
            where: { postId_doctorId: { postId: req.params.id, doctorId } }
        });
        if (existing) {
            // Remove endorsement
            await prisma.doctorEndorsement.delete({ where: { id: existing.id } });
            await prisma.post.update({
                where: { id: req.params.id },
                data: { endorsementCount: { decrement: 1 } }
            });
            return res.json({ success: true, endorsed: false });
        }
        else {
            // Add endorsement
            await prisma.doctorEndorsement.create({
                data: { postId: req.params.id, doctorId }
            });
            await prisma.post.update({
                where: { id: req.params.id },
                data: { endorsementCount: { increment: 1 } }
            });
            return res.json({ success: true, endorsed: true });
        }
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
