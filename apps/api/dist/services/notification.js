"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = exports.NotificationType = void 0;
const database_1 = require("@medthread/database");
var NotificationType;
(function (NotificationType) {
    NotificationType["REPLY_ALERT"] = "REPLY_ALERT";
    NotificationType["DOCTOR_RESPONSE"] = "DOCTOR_RESPONSE";
    NotificationType["CASE_FOLLOWUP"] = "CASE_FOLLOWUP";
    NotificationType["EMERGENCY_ALERT"] = "EMERGENCY_ALERT";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
class NotificationService {
    static async createNotification(userId, type, data) {
        // In production, this would integrate with push notification services
        console.log(`Notification for user ${userId}:`, { type, data });
        // Store notification in database
        // await prisma.notification.create({ ... })
        return { success: true };
    }
    static async notifyDoctorResponse(threadId, doctorId) {
        const thread = await database_1.prisma.medicalThread.findUnique({
            where: { id: threadId },
            include: { patient: true }
        });
        if (thread) {
            await this.createNotification(thread.patientId, NotificationType.DOCTOR_RESPONSE, { threadId, doctorId });
        }
    }
    static async notifyEmergency(threadId) {
        // Alert medical staff about emergency cases
        console.log(`EMERGENCY ALERT for thread ${threadId}`);
    }
}
exports.NotificationService = NotificationService;
