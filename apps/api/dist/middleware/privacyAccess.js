"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requirePrivatePostAccess = requirePrivatePostAccess;
const client_1 = require("@prisma/client");
const privacyCheck_1 = require("../utils/privacyCheck");
const prisma = new client_1.PrismaClient();
/**
 * Middleware to check access to private posts
 * Attaches privacy access result to request object
 * Returns 404 if access is denied (to avoid information leakage)
 */
async function requirePrivatePostAccess(req, res, next) {
    try {
        const postId = req.params.id || req.params.postId;
        if (!postId) {
            return res.status(400).json({
                success: false,
                error: 'Post ID is required',
            });
        }
        // Fetch post with minimal data
        const post = await prisma.post.findUnique({
            where: { id: postId },
            select: {
                id: true,
                authorId: true,
                isPrivate: true,
            },
        });
        if (!post) {
            return res.status(404).json({
                success: false,
                error: 'Post not found',
            });
        }
        // Get user from request (set by auth middleware)
        const user = req.user
            ? {
                id: req.user.id,
                role: req.user.role,
                doctorVerificationStatus: req.user.doctorVerificationStatus,
            }
            : null;
        // Check access
        const accessResult = (0, privacyCheck_1.checkPrivatePostAccess)(user, post);
        if (!accessResult.hasAccess) {
            // Return 404 instead of 403 to avoid leaking information about private post existence
            return res.status(404).json({
                success: false,
                error: 'Post not found',
            });
        }
        // Attach access result to request for use in route handlers
        req.privacyAccess = accessResult;
        next();
    }
    catch (error) {
        console.error('Privacy access check error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
}
