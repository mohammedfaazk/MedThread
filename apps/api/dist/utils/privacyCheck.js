"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkPrivatePostAccess = checkPrivatePostAccess;
const client_1 = require("@prisma/client");
/**
 * Check if a user has access to a private post
 * @param user - The user requesting access
 * @param post - The post being accessed
 * @returns PrivacyAccessResult with access decision and filtering flags
 */
function checkPrivatePostAccess(user, post) {
    // Public posts are accessible to everyone
    if (!post.isPrivate) {
        return {
            hasAccess: true,
            isAuthor: user?.id === post.authorId,
            isDoctor: user?.role === client_1.UserRole.DOCTOR,
            shouldFilterReplies: false,
            reason: 'Public post',
        };
    }
    // Private posts require authentication
    if (!user) {
        return {
            hasAccess: false,
            isAuthor: false,
            isDoctor: false,
            shouldFilterReplies: false,
            reason: 'Authentication required for private posts',
        };
    }
    // Check if user is the post author
    const isAuthor = user.id === post.authorId;
    if (isAuthor) {
        return {
            hasAccess: true,
            isAuthor: true,
            isDoctor: user.role === client_1.UserRole.DOCTOR,
            shouldFilterReplies: false, // Authors see all replies
            reason: 'Post author',
        };
    }
    // Check if user is an approved doctor
    const isDoctor = user.role === client_1.UserRole.DOCTOR;
    const isApprovedDoctor = isDoctor && user.doctorVerificationStatus === client_1.DoctorVerificationStatus.APPROVED;
    if (isApprovedDoctor) {
        return {
            hasAccess: true,
            isAuthor: false,
            isDoctor: true,
            shouldFilterReplies: true, // Doctors only see their own replies
            reason: 'Approved doctor',
        };
    }
    // Access denied for non-doctors and unapproved doctors
    return {
        hasAccess: false,
        isAuthor: false,
        isDoctor: isDoctor,
        shouldFilterReplies: false,
        reason: isDoctor
            ? 'Doctor verification required for private posts'
            : 'Only doctors can access private posts',
    };
}
