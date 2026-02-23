"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReputationService = void 0;
const database_1 = require("@medthread/database");
class ReputationService {
    static async updateDoctorReputation(doctorId, action) {
        const user = await database_1.prisma.user.findUnique({ where: { id: doctorId } });
        if (!user)
            return;
        let scoreChange = 0;
        switch (action) {
            case 'HELPFUL_REPLY':
                scoreChange = 5;
                break;
            case 'VERIFIED_ANSWER':
                scoreChange = 10;
                break;
            case 'PEER_REVIEW':
                scoreChange = 15;
                break;
            case 'PATIENT_RATING':
                scoreChange = 3;
                break;
        }
        // Update total karma instead of reputationScore
        await database_1.prisma.user.update({
            where: { id: doctorId },
            data: { totalKarma: user.totalKarma + scoreChange }
        });
    }
    static async getDoctorLeaderboard(limit = 10) {
        return await database_1.prisma.user.findMany({
            where: {
                role: 'DOCTOR',
                doctorVerificationStatus: 'APPROVED'
            },
            orderBy: { totalKarma: 'desc' },
            take: limit,
            select: {
                id: true,
                username: true,
                totalKarma: true,
                doctorVerificationStatus: true,
                specialty: true,
            }
        });
    }
}
exports.ReputationService = ReputationService;
