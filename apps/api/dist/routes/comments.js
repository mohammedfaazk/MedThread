"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const requireVerifiedDoctor_1 = require("../middleware/requireVerifiedDoctor");
const comment_service_1 = require("../services/comment.service");
const router = (0, express_1.Router)();
// Create comment - requires verified doctor
router.post('/', auth_1.authenticate, requireVerifiedDoctor_1.requireVerifiedDoctor, async (req, res, next) => {
    try {
        const { content, postId, parentId } = req.body;
        if (!content || !postId) {
            return res.status(400).json({ error: 'Content and postId are required' });
        }
        const comment = await comment_service_1.commentService.createComment({
            content,
            authorId: req.userId,
            postId,
            parentId,
        });
        res.status(201).json(comment);
    }
    catch (error) {
        next(error);
    }
});
// Get comments by post or by author
router.get('/', async (req, res, next) => {
    try {
        const { postId, authorId, limit, offset } = req.query;
        if (authorId) {
            // Get comments by author
            const comments = await comment_service_1.commentService.getCommentsByAuthor(authorId, limit ? Number(limit) : 20, offset ? Number(offset) : 0);
            return res.json({ success: true, data: comments });
        }
        if (!postId) {
            return res.status(400).json({ error: 'postId or authorId is required' });
        }
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
        const comments = await comment_service_1.commentService.getCommentsByPost(postId, userId);
        res.json(comments);
    }
    catch (error) {
        next(error);
    }
});
// Update comment - requires verified doctor
router.put('/:id', auth_1.authenticate, requireVerifiedDoctor_1.requireVerifiedDoctor, async (req, res, next) => {
    try {
        const { content } = req.body;
        if (!content) {
            return res.status(400).json({ error: 'Content is required' });
        }
        const comment = await comment_service_1.commentService.updateComment(req.params.id, req.userId, content);
        res.json(comment);
    }
    catch (error) {
        next(error);
    }
});
// Delete comment - requires verified doctor
router.delete('/:id', auth_1.authenticate, requireVerifiedDoctor_1.requireVerifiedDoctor, async (req, res, next) => {
    try {
        await comment_service_1.commentService.deleteComment(req.params.id, req.userId);
        res.json({ success: true, message: 'Comment deleted' });
    }
    catch (error) {
        next(error);
    }
});
// Vote on comment - requires verified doctor
router.post('/:id/vote', auth_1.authenticate, requireVerifiedDoctor_1.requireVerifiedDoctor, async (req, res, next) => {
    try {
        const { value } = req.body;
        if (value !== 1 && value !== -1) {
            return res.status(400).json({ error: 'Vote value must be 1 or -1' });
        }
        const result = await comment_service_1.commentService.voteComment(req.params.id, req.userId, value);
        res.json(result);
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
