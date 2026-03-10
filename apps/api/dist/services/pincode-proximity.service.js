"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pincodeProximityService = exports.PincodeProximityService = void 0;
const database_1 = require("@medthread/database");
const prisma = new database_1.PrismaClient();
/**
 * Service for calculating pincode proximity and area-based sorting
 */
class PincodeProximityService {
    /**
     * Calculate proximity score between two pincodes
     * Lower score = closer proximity
     *
     * Logic:
     * - Same pincode: 0 (highest priority)
     * - Same first 3 digits (same region): 1
     * - Same first 2 digits (same state): 2
     * - Same first digit (same zone): 3
     * - Different zone: 4
     */
    calculateProximity(pincode1, pincode2) {
        if (!pincode1 || !pincode2)
            return 999; // No pincode = lowest priority
        if (pincode1 === pincode2)
            return 0; // Exact match
        // Compare digit by digit
        if (pincode1.substring(0, 3) === pincode2.substring(0, 3))
            return 1; // Same region
        if (pincode1.substring(0, 2) === pincode2.substring(0, 2))
            return 2; // Same state
        if (pincode1.substring(0, 1) === pincode2.substring(0, 1))
            return 3; // Same zone
        return 4; // Different zone
    }
    /**
     * Sort items by pincode proximity to a reference pincode
     * Items with closer pincodes appear first
     */
    sortByProximity(items, referencePincode) {
        return items.sort((a, b) => {
            const proximityA = this.calculateProximity(referencePincode, a.pincode || null);
            const proximityB = this.calculateProximity(referencePincode, b.pincode || null);
            return proximityA - proximityB;
        });
    }
    /**
     * Group items by proximity level
     */
    groupByProximity(items, referencePincode) {
        const groups = {
            exact: [],
            sameRegion: [],
            sameState: [],
            sameZone: [],
            others: []
        };
        items.forEach(item => {
            const proximity = this.calculateProximity(referencePincode, item.pincode || null);
            switch (proximity) {
                case 0:
                    groups.exact.push(item);
                    break;
                case 1:
                    groups.sameRegion.push(item);
                    break;
                case 2:
                    groups.sameState.push(item);
                    break;
                case 3:
                    groups.sameZone.push(item);
                    break;
                default:
                    groups.others.push(item);
            }
        });
        return groups;
    }
    /**
     * Get doctors sorted by proximity to a patient's pincode
     */
    async getDoctorsByProximity(patientPincode, filters) {
        const where = {
            role: 'DOCTOR'
        };
        if (filters?.specialty) {
            where.specialty = filters.specialty;
        }
        if (filters?.verified !== undefined) {
            where.doctorVerificationStatus = filters.verified ? 'APPROVED' : undefined;
        }
        const doctors = await prisma.user.findMany({
            where,
            select: {
                id: true,
                username: true,
                email: true,
                avatar: true,
                specialty: true,
                subSpecialty: true,
                yearsOfExperience: true,
                hospitalAffiliation: true,
                clinicAddress: true,
                pincode: true,
                totalKarma: true,
                doctorVerificationStatus: true,
                bio: true,
            },
            take: filters?.limit || 100,
            skip: filters?.offset || 0
        });
        // Sort by proximity first, then by karma
        const sorted = doctors.sort((a, b) => {
            const proximityA = this.calculateProximity(patientPincode, a.pincode);
            const proximityB = this.calculateProximity(patientPincode, b.pincode);
            if (proximityA !== proximityB) {
                return proximityA - proximityB;
            }
            // If same proximity, sort by karma
            return (b.totalKarma || 0) - (a.totalKarma || 0);
        });
        return sorted;
    }
    /**
     * Get thread replies sorted by area proximity
     */
    async getRepliesByProximity(threadId, patientPincode) {
        const replies = await prisma.threadReply.findMany({
            where: { threadId },
            include: {
                author: {
                    select: {
                        id: true,
                        username: true,
                        avatar: true,
                        role: true,
                        specialty: true,
                        yearsOfExperience: true,
                        pincode: true,
                        totalKarma: true,
                        doctorVerificationStatus: true,
                    }
                },
                childReplies: {
                    include: {
                        author: {
                            select: {
                                id: true,
                                username: true,
                                avatar: true,
                                role: true,
                            }
                        }
                    }
                }
            }
        });
        // Sort replies by multiple criteria:
        // 1. Verified doctors first
        // 2. Proximity to patient's pincode
        // 3. Upvotes
        // 4. Helpful status
        const sorted = replies.sort((a, b) => {
            // Priority 1: Verified doctors
            const aVerified = a.author.role === 'DOCTOR' && a.author.doctorVerificationStatus === 'APPROVED';
            const bVerified = b.author.role === 'DOCTOR' && b.author.doctorVerificationStatus === 'APPROVED';
            if (aVerified && !bVerified)
                return -1;
            if (!aVerified && bVerified)
                return 1;
            // Priority 2: Proximity (only for verified doctors)
            if (aVerified && bVerified) {
                const proximityA = this.calculateProximity(patientPincode, a.author.pincode);
                const proximityB = this.calculateProximity(patientPincode, b.author.pincode);
                if (proximityA !== proximityB) {
                    return proximityA - proximityB;
                }
            }
            // Priority 3: Helpful status
            if (a.isHelpful && !b.isHelpful)
                return -1;
            if (!a.isHelpful && b.isHelpful)
                return 1;
            // Priority 4: Upvotes
            const scoreA = (a.upvotes || 0) - (a.downvotes || 0);
            const scoreB = (b.upvotes || 0) - (b.downvotes || 0);
            if (scoreA !== scoreB) {
                return scoreB - scoreA;
            }
            // Priority 5: Creation time (newer first)
            return b.createdAt.getTime() - a.createdAt.getTime();
        });
        return sorted;
    }
    /**
     * Get top doctors in a specific area for a time period
     */
    async getTopDoctorsByArea(pincode, period = 'week', limit = 10) {
        const now = new Date();
        const startDate = new Date();
        switch (period) {
            case 'day':
                startDate.setDate(now.getDate() - 1);
                break;
            case 'week':
                startDate.setDate(now.getDate() - 7);
                break;
            case 'month':
                startDate.setMonth(now.getMonth() - 1);
                break;
        }
        // Get doctors in the same region (first 3 digits match)
        const regionPrefix = pincode.substring(0, 3);
        const doctors = await prisma.user.findMany({
            where: {
                role: 'DOCTOR',
                doctorVerificationStatus: 'APPROVED',
                pincode: {
                    startsWith: regionPrefix
                }
            },
            select: {
                id: true,
                username: true,
                avatar: true,
                specialty: true,
                subSpecialty: true,
                yearsOfExperience: true,
                pincode: true,
                totalKarma: true,
                bio: true,
                threadReplies: {
                    where: {
                        createdAt: {
                            gte: startDate
                        }
                    },
                    select: {
                        id: true,
                        upvotes: true,
                        downvotes: true,
                        isHelpful: true,
                        createdAt: true,
                    }
                }
            }
        });
        // Calculate scores for each doctor
        const doctorsWithScores = doctors.map(doctor => {
            let score = 0;
            // Points for replies
            score += doctor.threadReplies.length * 10;
            // Points for upvotes
            const totalUpvotes = doctor.threadReplies.reduce((sum, reply) => sum + (reply.upvotes || 0), 0);
            score += totalUpvotes * 5;
            // Points for helpful marks
            const helpfulCount = doctor.threadReplies.filter(r => r.isHelpful).length;
            score += helpfulCount * 20;
            // Bonus for new doctors (registered in last 30 days)
            const accountAge = (now.getTime() - doctor.threadReplies[0]?.createdAt?.getTime() || 0) / (1000 * 60 * 60 * 24);
            if (accountAge <= 30) {
                score *= 1.5; // 50% bonus for new doctors
            }
            // Proximity bonus (exact pincode match)
            const proximity = this.calculateProximity(pincode, doctor.pincode);
            if (proximity === 0)
                score *= 1.2; // 20% bonus for exact match
            return {
                ...doctor,
                periodScore: Math.round(score),
                replyCount: doctor.threadReplies.length,
                helpfulCount,
                totalUpvotes
            };
        });
        // Sort by score and return top N
        return doctorsWithScores
            .sort((a, b) => b.periodScore - a.periodScore)
            .slice(0, limit)
            .map(({ threadReplies, ...doctor }) => doctor); // Remove replies from response
    }
    /**
     * Find nearby pincodes (within same region)
     */
    async findNearbyPincodes(pincode, radius = 'region') {
        let prefixLength = 3; // region
        if (radius === 'state')
            prefixLength = 2;
        if (radius === 'zone')
            prefixLength = 1;
        const prefix = pincode.substring(0, prefixLength);
        const users = await prisma.user.findMany({
            where: {
                pincode: {
                    startsWith: prefix
                }
            },
            select: {
                pincode: true
            },
            distinct: ['pincode']
        });
        return users.map(u => u.pincode).filter(p => p !== null);
    }
}
exports.PincodeProximityService = PincodeProximityService;
exports.pincodeProximityService = new PincodeProximityService();
