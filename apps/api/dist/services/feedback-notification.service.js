"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.feedbackNotificationService = exports.FeedbackNotificationService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class FeedbackNotificationService {
    /**
     * Send feedback notifications to patients who need follow-up
     * Should be called by a cron job every day
     */
    async sendPendingFeedbackNotifications() {
        const twoDaysAgo = new Date();
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
        try {
            const pendingFeedbacks = await prisma.patientFeedback.findMany({
                where: {
                    status: 'NOT_YET',
                    lastFeedbackAt: { lte: twoDaysAgo }
                },
                include: {
                    patient: true,
                    doctor: true
                }
            });
            console.log(`[Feedback] Found ${pendingFeedbacks.length} pending feedback requests`);
            for (const feedback of pendingFeedbacks) {
                try {
                    // Create notification
                    await prisma.notifications.create({
                        data: {
                            type: 'SYSTEM_ANNOUNCEMENT',
                            recipientId: feedback.patientId,
                            actorId: feedback.doctorId,
                            metadata: {
                                title: 'How are you feeling?',
                                message: `It's been 2 days since your consultation with Dr. ${feedback.doctor.username}. Please let us know how you're doing.`,
                                action: 'FEEDBACK_REQUEST',
                                conversationId: feedback.conversationId,
                                appointmentId: feedback.appointmentId,
                                feedbackId: feedback.id
                            }
                        }
                    });
                    console.log(`[Feedback] Sent notification to patient ${feedback.patientId}`);
                }
                catch (error) {
                    console.error(`[Feedback] Failed to send notification to patient ${feedback.patientId}:`, error);
                }
            }
            return {
                success: true,
                notificationsSent: pendingFeedbacks.length
            };
        }
        catch (error) {
            console.error('[Feedback] Error sending feedback notifications:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    /**
     * Check if a specific patient needs to provide feedback
     */
    async checkFeedbackNeeded(patientId, conversationId, appointmentId) {
        const twoDaysAgo = new Date();
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
        const where = {
            patientId,
            status: 'NOT_YET',
            lastFeedbackAt: { lte: twoDaysAgo }
        };
        if (conversationId) {
            where.conversationId = conversationId;
        }
        if (appointmentId) {
            where.appointmentId = appointmentId;
        }
        const feedback = await prisma.patientFeedback.findFirst({ where });
        return {
            needsFeedback: !!feedback,
            feedback
        };
    }
    /**
     * Get feedback statistics for a doctor
     */
    async getDoctorFeedbackStats(doctorId) {
        const feedbacks = await prisma.patientFeedback.findMany({
            where: { doctorId }
        });
        const cured = feedbacks.filter(f => f.status === 'CURED').length;
        const notYet = feedbacks.filter(f => f.status === 'NOT_YET').length;
        const consultNew = feedbacks.filter(f => f.status === 'CONSULT_NEW_DOCTOR').length;
        const total = feedbacks.length;
        return {
            total,
            cured,
            notYet,
            consultNew,
            satisfactionRate: total > 0 ? ((cured / total) * 100).toFixed(2) : '0',
            avgFeedbackCount: total > 0 ? (feedbacks.reduce((sum, f) => sum + f.feedbackCount, 0) / total).toFixed(1) : '0'
        };
    }
    /**
     * Get pending feedbacks for admin dashboard
     */
    async getPendingFeedbacks(limit = 50) {
        const feedbacks = await prisma.patientFeedback.findMany({
            where: {
                status: 'NOT_YET'
            },
            include: {
                patient: {
                    select: {
                        id: true,
                        username: true,
                        email: true
                    }
                },
                doctor: {
                    select: {
                        id: true,
                        username: true,
                        specialty: true
                    }
                }
            },
            orderBy: {
                lastFeedbackAt: 'asc'
            },
            take: limit
        });
        return feedbacks;
    }
}
exports.FeedbackNotificationService = FeedbackNotificationService;
exports.feedbackNotificationService = new FeedbackNotificationService();
