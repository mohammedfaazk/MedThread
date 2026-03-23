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
exports.BADGE_DEFINITIONS = exports.badgeService = exports.BadgeType = void 0;
const database_1 = require("@medthread/database");
const socket_1 = require("../socket");
var BadgeType;
(function (BadgeType) {
    // Appointment Badges
    BadgeType["FIRST_APPOINTMENT"] = "FIRST_APPOINTMENT";
    BadgeType["TEN_APPOINTMENTS"] = "TEN_APPOINTMENTS";
    BadgeType["FIFTY_APPOINTMENTS"] = "FIFTY_APPOINTMENTS";
    BadgeType["HUNDRED_APPOINTMENTS"] = "HUNDRED_APPOINTMENTS";
    // Consultation Badges (Doctor)
    BadgeType["FIRST_CONSULTATION"] = "FIRST_CONSULTATION";
    BadgeType["TEN_CONSULTATIONS"] = "TEN_CONSULTATIONS";
    BadgeType["FIFTY_CONSULTATIONS"] = "FIFTY_CONSULTATIONS";
    BadgeType["HUNDRED_CONSULTATIONS"] = "HUNDRED_CONSULTATIONS";
    // Social Badges
    BadgeType["FIRST_FOLLOWER"] = "FIRST_FOLLOWER";
    BadgeType["TEN_FOLLOWERS"] = "TEN_FOLLOWERS";
    BadgeType["FIFTY_FOLLOWERS"] = "FIFTY_FOLLOWERS";
    BadgeType["HUNDRED_FOLLOWERS"] = "HUNDRED_FOLLOWERS";
    BadgeType["FIVE_HUNDRED_FOLLOWERS"] = "FIVE_HUNDRED_FOLLOWERS";
    // Verification Badges
    BadgeType["VERIFIED_DOCTOR"] = "VERIFIED_DOCTOR";
    BadgeType["VERIFIED_SPECIALIST"] = "VERIFIED_SPECIALIST";
    // Engagement Badges
    BadgeType["FIRST_POST"] = "FIRST_POST";
    BadgeType["TEN_POSTS"] = "TEN_POSTS";
    BadgeType["FIFTY_POSTS"] = "FIFTY_POSTS";
    BadgeType["HELPFUL_CONTRIBUTOR"] = "HELPFUL_CONTRIBUTOR";
    BadgeType["COMMUNITY_LEADER"] = "COMMUNITY_LEADER";
    // Streak Badges
    BadgeType["SEVEN_DAY_STREAK"] = "SEVEN_DAY_STREAK";
    BadgeType["THIRTY_DAY_STREAK"] = "THIRTY_DAY_STREAK";
    BadgeType["HUNDRED_DAY_STREAK"] = "HUNDRED_DAY_STREAK";
})(BadgeType || (exports.BadgeType = BadgeType = {}));
const BADGE_DEFINITIONS = {
    // Appointment Badges
    [BadgeType.FIRST_APPOINTMENT]: {
        type: BadgeType.FIRST_APPOINTMENT,
        name: 'First Appointment',
        description: 'Booked your first appointment',
        icon: '📅',
        category: 'APPOINTMENT',
        rarity: 'COMMON',
        points: 10
    },
    [BadgeType.TEN_APPOINTMENTS]: {
        type: BadgeType.TEN_APPOINTMENTS,
        name: 'Regular Patient',
        description: 'Completed 10 appointments',
        icon: '🏥',
        category: 'APPOINTMENT',
        rarity: 'RARE',
        points: 50
    },
    [BadgeType.FIFTY_APPOINTMENTS]: {
        type: BadgeType.FIFTY_APPOINTMENTS,
        name: 'Health Conscious',
        description: 'Completed 50 appointments',
        icon: '💪',
        category: 'APPOINTMENT',
        rarity: 'EPIC',
        points: 200
    },
    [BadgeType.HUNDRED_APPOINTMENTS]: {
        type: BadgeType.HUNDRED_APPOINTMENTS,
        name: 'Healthcare Champion',
        description: 'Completed 100 appointments',
        icon: '🏆',
        category: 'APPOINTMENT',
        rarity: 'LEGENDARY',
        points: 500
    },
    // Consultation Badges
    [BadgeType.FIRST_CONSULTATION]: {
        type: BadgeType.FIRST_CONSULTATION,
        name: 'First Consultation',
        description: 'Completed your first consultation',
        icon: '🩺',
        category: 'CONSULTATION',
        rarity: 'COMMON',
        points: 10
    },
    [BadgeType.TEN_CONSULTATIONS]: {
        type: BadgeType.TEN_CONSULTATIONS,
        name: 'Helping Hand',
        description: 'Completed 10 consultations',
        icon: '🤝',
        category: 'CONSULTATION',
        rarity: 'RARE',
        points: 50
    },
    [BadgeType.FIFTY_CONSULTATIONS]: {
        type: BadgeType.FIFTY_CONSULTATIONS,
        name: 'Dedicated Healer',
        description: 'Completed 50 consultations',
        icon: '⚕️',
        category: 'CONSULTATION',
        rarity: 'EPIC',
        points: 200
    },
    [BadgeType.HUNDRED_CONSULTATIONS]: {
        type: BadgeType.HUNDRED_CONSULTATIONS,
        name: 'Master Physician',
        description: 'Completed 100 consultations',
        icon: '👨‍⚕️',
        category: 'CONSULTATION',
        rarity: 'LEGENDARY',
        points: 500
    },
    // Social Badges
    [BadgeType.FIRST_FOLLOWER]: {
        type: BadgeType.FIRST_FOLLOWER,
        name: 'First Follower',
        description: 'Got your first follower',
        icon: '👤',
        category: 'SOCIAL',
        rarity: 'COMMON',
        points: 10
    },
    [BadgeType.TEN_FOLLOWERS]: {
        type: BadgeType.TEN_FOLLOWERS,
        name: 'Rising Star',
        description: 'Reached 10 followers',
        icon: '⭐',
        category: 'SOCIAL',
        rarity: 'RARE',
        points: 50
    },
    [BadgeType.FIFTY_FOLLOWERS]: {
        type: BadgeType.FIFTY_FOLLOWERS,
        name: 'Popular Doctor',
        description: 'Reached 50 followers',
        icon: '🌟',
        category: 'SOCIAL',
        rarity: 'EPIC',
        points: 200
    },
    [BadgeType.HUNDRED_FOLLOWERS]: {
        type: BadgeType.HUNDRED_FOLLOWERS,
        name: 'Community Favorite',
        description: 'Reached 100 followers',
        icon: '💫',
        category: 'SOCIAL',
        rarity: 'LEGENDARY',
        points: 500
    },
    [BadgeType.FIVE_HUNDRED_FOLLOWERS]: {
        type: BadgeType.FIVE_HUNDRED_FOLLOWERS,
        name: 'Medical Influencer',
        description: 'Reached 500 followers',
        icon: '🔥',
        category: 'SOCIAL',
        rarity: 'LEGENDARY',
        points: 1000
    },
    // Verification Badges
    [BadgeType.VERIFIED_DOCTOR]: {
        type: BadgeType.VERIFIED_DOCTOR,
        name: 'Verified Doctor',
        description: 'Successfully verified as a medical professional',
        icon: '✅',
        category: 'VERIFICATION',
        rarity: 'EPIC',
        points: 100
    },
    [BadgeType.VERIFIED_SPECIALIST]: {
        type: BadgeType.VERIFIED_SPECIALIST,
        name: 'Verified Specialist',
        description: 'Verified specialist in your field',
        icon: '🎓',
        category: 'VERIFICATION',
        rarity: 'LEGENDARY',
        points: 200
    },
    // Engagement Badges
    [BadgeType.FIRST_POST]: {
        type: BadgeType.FIRST_POST,
        name: 'First Post',
        description: 'Created your first post',
        icon: '📝',
        category: 'ENGAGEMENT',
        rarity: 'COMMON',
        points: 10
    },
    [BadgeType.TEN_POSTS]: {
        type: BadgeType.TEN_POSTS,
        name: 'Active Contributor',
        description: 'Created 10 posts',
        icon: '✍️',
        category: 'ENGAGEMENT',
        rarity: 'RARE',
        points: 50
    },
    [BadgeType.FIFTY_POSTS]: {
        type: BadgeType.FIFTY_POSTS,
        name: 'Prolific Writer',
        description: 'Created 50 posts',
        icon: '📚',
        category: 'ENGAGEMENT',
        rarity: 'EPIC',
        points: 200
    },
    [BadgeType.HELPFUL_CONTRIBUTOR]: {
        type: BadgeType.HELPFUL_CONTRIBUTOR,
        name: 'Helpful Contributor',
        description: 'Received 100+ upvotes',
        icon: '👍',
        category: 'ENGAGEMENT',
        rarity: 'EPIC',
        points: 150
    },
    [BadgeType.COMMUNITY_LEADER]: {
        type: BadgeType.COMMUNITY_LEADER,
        name: 'Community Leader',
        description: 'Earned 500+ karma points',
        icon: '👑',
        category: 'ENGAGEMENT',
        rarity: 'LEGENDARY',
        points: 300
    },
    // Streak Badges
    [BadgeType.SEVEN_DAY_STREAK]: {
        type: BadgeType.SEVEN_DAY_STREAK,
        name: '7-Day Streak',
        description: 'Active for 7 consecutive days',
        icon: '🔥',
        category: 'STREAK',
        rarity: 'RARE',
        points: 50
    },
    [BadgeType.THIRTY_DAY_STREAK]: {
        type: BadgeType.THIRTY_DAY_STREAK,
        name: '30-Day Streak',
        description: 'Active for 30 consecutive days',
        icon: '🌟',
        category: 'STREAK',
        rarity: 'EPIC',
        points: 200
    },
    [BadgeType.HUNDRED_DAY_STREAK]: {
        type: BadgeType.HUNDRED_DAY_STREAK,
        name: '100-Day Streak',
        description: 'Active for 100 consecutive days',
        icon: '💎',
        category: 'STREAK',
        rarity: 'LEGENDARY',
        points: 500
    },
};
exports.BADGE_DEFINITIONS = BADGE_DEFINITIONS;
class BadgeService {
    /**
     * Award a badge to a user
     */
    async awardBadge(userId, badgeType) {
        try {
            const badgeDefinition = BADGE_DEFINITIONS[badgeType];
            // Check if user already has this badge
            const existingBadge = await database_1.prisma.userBadge.findUnique({
                where: {
                    userId_badgeType: {
                        userId,
                        badgeType
                    }
                }
            });
            if (existingBadge) {
                console.log(`[BADGE] User ${userId} already has badge ${badgeType}`);
                return false;
            }
            // Award the badge
            const userBadge = await database_1.prisma.userBadge.create({
                data: {
                    userId,
                    badgeType,
                    earnedAt: new Date()
                }
            });
            console.log(`[BADGE] Awarded ${badgeType} to user ${userId}`);
            // Update user's badge points
            await database_1.prisma.user.update({
                where: { id: userId },
                data: {
                    badgePoints: {
                        increment: badgeDefinition.points
                    }
                }
            });
            // Send real-time notification
            try {
                const io = (0, socket_1.getSocketInstance)();
                io.to(`user:${userId}`).emit('badge_earned', {
                    badge: {
                        ...badgeDefinition,
                        earnedAt: userBadge.earnedAt
                    }
                });
            }
            catch (socketError) {
                console.error('[BADGE] Socket notification failed:', socketError);
            }
            // Create notification
            try {
                const { notificationService } = await Promise.resolve().then(() => __importStar(require('./notification.service')));
                await notificationService.createNotification({
                    type: 'BADGE_EARNED',
                    recipientIds: [userId],
                    actorId: userId,
                    contentId: badgeType,
                    contentType: 'POST',
                    metadata: {
                        badgeName: badgeDefinition.name,
                        badgeIcon: badgeDefinition.icon,
                        badgeDescription: badgeDefinition.description,
                        points: badgeDefinition.points
                    }
                });
            }
            catch (notifError) {
                console.error('[BADGE] Notification creation failed:', notifError);
            }
            return true;
        }
        catch (error) {
            console.error('[BADGE] Error awarding badge:', error);
            return false;
        }
    }
    /**
     * Check and award appointment badges
     */
    async checkAppointmentBadges(userId) {
        try {
            const appointmentCount = await database_1.prisma.appointment.count({
                where: {
                    OR: [
                        { patientId: userId },
                        { doctorId: userId }
                    ],
                    status: 'COMPLETED'
                }
            });
            console.log(`[BADGE] User ${userId} has ${appointmentCount} completed appointments`);
            if (appointmentCount >= 100) {
                await this.awardBadge(userId, BadgeType.HUNDRED_APPOINTMENTS);
            }
            else if (appointmentCount >= 50) {
                await this.awardBadge(userId, BadgeType.FIFTY_APPOINTMENTS);
            }
            else if (appointmentCount >= 10) {
                await this.awardBadge(userId, BadgeType.TEN_APPOINTMENTS);
            }
            else if (appointmentCount >= 1) {
                await this.awardBadge(userId, BadgeType.FIRST_APPOINTMENT);
            }
        }
        catch (error) {
            console.error('[BADGE] Error checking appointment badges:', error);
        }
    }
    /**
     * Check and award consultation badges (for doctors)
     */
    async checkConsultationBadges(doctorId) {
        try {
            const consultationCount = await database_1.prisma.appointment.count({
                where: {
                    doctorId,
                    status: 'COMPLETED'
                }
            });
            console.log(`[BADGE] Doctor ${doctorId} has ${consultationCount} completed consultations`);
            if (consultationCount >= 100) {
                await this.awardBadge(doctorId, BadgeType.HUNDRED_CONSULTATIONS);
            }
            else if (consultationCount >= 50) {
                await this.awardBadge(doctorId, BadgeType.FIFTY_CONSULTATIONS);
            }
            else if (consultationCount >= 10) {
                await this.awardBadge(doctorId, BadgeType.TEN_CONSULTATIONS);
            }
            else if (consultationCount >= 1) {
                await this.awardBadge(doctorId, BadgeType.FIRST_CONSULTATION);
            }
        }
        catch (error) {
            console.error('[BADGE] Error checking consultation badges:', error);
        }
    }
    /**
     * Check and award follower badges
     */
    async checkFollowerBadges(userId) {
        try {
            const followerCount = await database_1.prisma.follow.count({
                where: {
                    followingId: userId
                }
            });
            console.log(`[BADGE] User ${userId} has ${followerCount} followers`);
            if (followerCount >= 500) {
                await this.awardBadge(userId, BadgeType.FIVE_HUNDRED_FOLLOWERS);
            }
            else if (followerCount >= 100) {
                await this.awardBadge(userId, BadgeType.HUNDRED_FOLLOWERS);
            }
            else if (followerCount >= 50) {
                await this.awardBadge(userId, BadgeType.FIFTY_FOLLOWERS);
            }
            else if (followerCount >= 10) {
                await this.awardBadge(userId, BadgeType.TEN_FOLLOWERS);
            }
            else if (followerCount >= 1) {
                await this.awardBadge(userId, BadgeType.FIRST_FOLLOWER);
            }
        }
        catch (error) {
            console.error('[BADGE] Error checking follower badges:', error);
        }
    }
    /**
     * Check and award verification badges
     */
    async checkVerificationBadges(userId) {
        try {
            const user = await database_1.prisma.user.findUnique({
                where: { id: userId },
                select: {
                    role: true,
                    doctorVerificationStatus: true,
                    specialty: true
                }
            });
            if (!user)
                return;
            if (user.role === 'DOCTOR' && user.doctorVerificationStatus === 'APPROVED') {
                await this.awardBadge(userId, BadgeType.VERIFIED_DOCTOR);
                // Award specialist badge if they have a specialty
                if (user.specialty) {
                    await this.awardBadge(userId, BadgeType.VERIFIED_SPECIALIST);
                }
            }
        }
        catch (error) {
            console.error('[BADGE] Error checking verification badges:', error);
        }
    }
    /**
     * Check and award engagement badges
     */
    async checkEngagementBadges(userId) {
        try {
            // Check post count
            const postCount = await database_1.prisma.post.count({
                where: { authorId: userId }
            });
            if (postCount >= 50) {
                await this.awardBadge(userId, BadgeType.FIFTY_POSTS);
            }
            else if (postCount >= 10) {
                await this.awardBadge(userId, BadgeType.TEN_POSTS);
            }
            else if (postCount >= 1) {
                await this.awardBadge(userId, BadgeType.FIRST_POST);
            }
            // Check karma
            const user = await database_1.prisma.user.findUnique({
                where: { id: userId },
                select: { totalKarma: true }
            });
            if (user && user.totalKarma >= 500) {
                await this.awardBadge(userId, BadgeType.COMMUNITY_LEADER);
            }
            else if (user && user.totalKarma >= 100) {
                await this.awardBadge(userId, BadgeType.HELPFUL_CONTRIBUTOR);
            }
        }
        catch (error) {
            console.error('[BADGE] Error checking engagement badges:', error);
        }
    }
    /**
     * Get all badges for a user
     */
    async getUserBadges(userId) {
        try {
            const userBadges = await database_1.prisma.userBadge.findMany({
                where: { userId },
                orderBy: { earnedAt: 'desc' }
            });
            return userBadges.map(ub => ({
                ...BADGE_DEFINITIONS[ub.badgeType],
                earnedAt: ub.earnedAt
            }));
        }
        catch (error) {
            console.error('[BADGE] Error getting user badges:', error);
            return [];
        }
    }
    /**
     * Get badge statistics for a user
     */
    async getUserBadgeStats(userId) {
        try {
            const badges = await database_1.prisma.userBadge.findMany({
                where: { userId }
            });
            const user = await database_1.prisma.user.findUnique({
                where: { id: userId },
                select: { badgePoints: true }
            });
            const byCategory = badges.reduce((acc, badge) => {
                const def = BADGE_DEFINITIONS[badge.badgeType];
                acc[def.category] = (acc[def.category] || 0) + 1;
                return acc;
            }, {});
            const byRarity = badges.reduce((acc, badge) => {
                const def = BADGE_DEFINITIONS[badge.badgeType];
                acc[def.rarity] = (acc[def.rarity] || 0) + 1;
                return acc;
            }, {});
            return {
                totalBadges: badges.length,
                totalPoints: user?.badgePoints || 0,
                byCategory,
                byRarity,
                recentBadges: badges
                    .sort((a, b) => b.earnedAt.getTime() - a.earnedAt.getTime())
                    .slice(0, 5)
                    .map(b => ({
                    ...BADGE_DEFINITIONS[b.badgeType],
                    earnedAt: b.earnedAt
                }))
            };
        }
        catch (error) {
            console.error('[BADGE] Error getting badge stats:', error);
            return null;
        }
    }
    /**
     * Get all available badges
     */
    getAllBadges() {
        return Object.values(BADGE_DEFINITIONS);
    }
    /**
     * Background job to check all badges for a user
     */
    async evaluateAllBadges(userId) {
        console.log(`[BADGE] Evaluating all badges for user ${userId}`);
        try {
            await Promise.all([
                this.checkAppointmentBadges(userId),
                this.checkConsultationBadges(userId),
                this.checkFollowerBadges(userId),
                this.checkVerificationBadges(userId),
                this.checkEngagementBadges(userId)
            ]);
            console.log(`[BADGE] Completed badge evaluation for user ${userId}`);
        }
        catch (error) {
            console.error('[BADGE] Error evaluating badges:', error);
        }
    }
}
exports.badgeService = new BadgeService();
