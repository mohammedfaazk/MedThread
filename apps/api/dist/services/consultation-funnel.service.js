"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.consultationFunnelService = exports.ConsultationFunnelService = void 0;
const database_1 = require("@medthread/database");
const errors_1 = require("../utils/errors");
class ConsultationFunnelService {
    /**
     * Create consultation request from thread
     */
    async createConsultationRequest(request) {
        // Validate doctor exists and is verified
        const doctor = await database_1.prisma.user.findUnique({
            where: { id: request.doctorId },
            select: {
                role: true,
                doctorVerificationStatus: true,
                specialty: true,
                consultationFee: true
            }
        });
        if (!doctor || doctor.role !== 'DOCTOR') {
            throw new errors_1.NotFoundError('Doctor not found');
        }
        if (doctor.doctorVerificationStatus !== 'APPROVED') {
            throw new errors_1.ValidationError('Doctor is not verified');
        }
        // Get case context from thread if provided
        let caseContext = null;
        if (request.sourceThreadId) {
            const thread = await database_1.prisma.medicalThread.findUnique({
                where: { id: request.sourceThreadId },
                include: {
                    replies: {
                        where: { authorId: request.doctorId },
                        take: 1,
                        orderBy: { createdAt: 'desc' }
                    }
                }
            });
            if (thread) {
                caseContext = {
                    threadTitle: thread.title,
                    symptoms: thread.symptoms,
                    severityScore: thread.severityScore,
                    tags: thread.tags,
                    doctorReply: thread.replies[0]?.content
                };
            }
        }
        // Create funnel entry (using temporary storage until schema is updated)
        // For now, we'll use the Appointment model with extended data
        const consultation = await database_1.prisma.appointment.create({
            data: {
                patientId: request.patientId,
                doctorId: request.doctorId,
                startTime: request.preferredDateTime || new Date(),
                endTime: request.preferredDateTime || new Date(),
                status: 'PENDING',
                reason: JSON.stringify({
                    type: 'CONSULTATION_REQUEST',
                    sourceThreadId: request.sourceThreadId,
                    sourceReplyId: request.sourceReplyId,
                    consultationType: request.consultationType,
                    caseContext,
                    patientNotes: request.patientNotes,
                    inquirySentAt: new Date()
                })
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
                        specialty: true,
                        consultationFee: true
                    }
                }
            }
        });
        // Send notification to doctor
        await this.notifyDoctor(request.doctorId, consultation.id);
        return {
            consultationId: consultation.id,
            status: 'INQUIRY_SENT',
            doctor: consultation.doctor,
            caseContext,
            message: 'Consultation request sent successfully'
        };
    }
    /**
     * Doctor responds to consultation request
     */
    async doctorRespond(consultationId, doctorId, response) {
        const consultation = await database_1.prisma.appointment.findUnique({
            where: { id: consultationId }
        });
        if (!consultation || consultation.doctorId !== doctorId) {
            throw new errors_1.NotFoundError('Consultation request not found');
        }
        const reasonData = JSON.parse(consultation.reason || '{}');
        reasonData.doctorRespondedAt = new Date();
        reasonData.doctorResponse = response;
        reasonData.status = 'DOCTOR_RESPONDED';
        await database_1.prisma.appointment.update({
            where: { id: consultationId },
            data: {
                reason: JSON.stringify(reasonData)
            }
        });
        // Notify patient
        await this.notifyPatient(consultation.patientId, consultationId);
        return {
            message: 'Response sent to patient',
            status: 'DOCTOR_RESPONDED'
        };
    }
    /**
     * Patient schedules appointment
     */
    async scheduleAppointment(consultationId, patientId, appointmentData) {
        const consultation = await database_1.prisma.appointment.findUnique({
            where: { id: consultationId },
            include: {
                doctor: {
                    select: {
                        consultationFee: true
                    }
                }
            }
        });
        if (!consultation || consultation.patientId !== patientId) {
            throw new errors_1.NotFoundError('Consultation request not found');
        }
        const reasonData = JSON.parse(consultation.reason || '{}');
        reasonData.appointmentRequestedAt = new Date();
        reasonData.appointmentScheduledAt = new Date();
        reasonData.status = 'APPOINTMENT_SCHEDULED';
        reasonData.paymentIntentId = appointmentData.paymentIntentId;
        const endTime = new Date(appointmentData.selectedDateTime);
        endTime.setMinutes(endTime.getMinutes() + appointmentData.duration);
        await database_1.prisma.appointment.update({
            where: { id: consultationId },
            data: {
                startTime: appointmentData.selectedDateTime,
                endTime: endTime,
                status: 'APPROVED',
                reason: JSON.stringify(reasonData)
            }
        });
        // Create conversation for the appointment
        const conversation = await database_1.prisma.conversation.create({
            data: {
                appointmentId: consultationId,
                participants: {
                    connect: [
                        { id: patientId },
                        { id: consultation.doctorId }
                    ]
                }
            }
        });
        return {
            appointmentId: consultationId,
            conversationId: conversation.id,
            status: 'APPOINTMENT_SCHEDULED',
            startTime: appointmentData.selectedDateTime,
            endTime: endTime,
            message: 'Appointment scheduled successfully'
        };
    }
    /**
     * Mark consultation as completed
     */
    async completeConsultation(consultationId, doctorId, notes) {
        const consultation = await database_1.prisma.appointment.findUnique({
            where: { id: consultationId }
        });
        if (!consultation || consultation.doctorId !== doctorId) {
            throw new errors_1.NotFoundError('Consultation not found');
        }
        const reasonData = JSON.parse(consultation.reason || '{}');
        reasonData.consultationCompletedAt = new Date();
        reasonData.status = 'CONSULTATION_COMPLETED';
        reasonData.doctorNotes = notes;
        await database_1.prisma.appointment.update({
            where: { id: consultationId },
            data: {
                status: 'COMPLETED',
                reason: JSON.stringify(reasonData)
            }
        });
        // Request patient review
        await this.requestReview(consultation.patientId, consultationId);
        return {
            message: 'Consultation marked as completed',
            status: 'CONSULTATION_COMPLETED'
        };
    }
    /**
     * Get funnel metrics for doctor
     */
    async getDoctorFunnelMetrics(doctorId, timeframe = 'month') {
        const startDate = this.getStartDate(timeframe);
        const consultations = await database_1.prisma.appointment.findMany({
            where: {
                doctorId,
                createdAt: startDate ? { gte: startDate } : undefined
            }
        });
        let totalInquiries = 0;
        let doctorResponses = 0;
        let appointmentsRequested = 0;
        let appointmentsScheduled = 0;
        let consultationsCompleted = 0;
        let totalRevenue = 0;
        const conversionTimes = [];
        consultations.forEach(consultation => {
            try {
                const reasonData = JSON.parse(consultation.reason || '{}');
                if (reasonData.type === 'CONSULTATION_REQUEST') {
                    totalInquiries++;
                    if (reasonData.doctorRespondedAt) {
                        doctorResponses++;
                    }
                    if (reasonData.appointmentRequestedAt) {
                        appointmentsRequested++;
                    }
                    if (reasonData.appointmentScheduledAt) {
                        appointmentsScheduled++;
                        // Calculate conversion time
                        const inquiryTime = new Date(reasonData.inquirySentAt).getTime();
                        const scheduledTime = new Date(reasonData.appointmentScheduledAt).getTime();
                        conversionTimes.push((scheduledTime - inquiryTime) / (1000 * 60 * 60)); // hours
                    }
                    if (reasonData.consultationCompletedAt) {
                        consultationsCompleted++;
                        // Add revenue calculation here
                    }
                }
            }
            catch (e) {
                // Skip invalid data
            }
        });
        const conversionRate = totalInquiries > 0 ? (appointmentsScheduled / totalInquiries) * 100 : 0;
        const averageTimeToConversion = conversionTimes.length > 0
            ? conversionTimes.reduce((a, b) => a + b, 0) / conversionTimes.length
            : 0;
        return {
            totalInquiries,
            doctorResponses,
            appointmentsRequested,
            appointmentsScheduled,
            consultationsCompleted,
            conversionRate: Math.round(conversionRate * 10) / 10,
            averageTimeToConversion: Math.round(averageTimeToConversion * 10) / 10,
            revenue: totalRevenue
        };
    }
    /**
     * Get top converting threads for doctor
     */
    async getTopConvertingThreads(doctorId, limit = 10) {
        const consultations = await database_1.prisma.appointment.findMany({
            where: { doctorId }
        });
        const threadConversions = new Map();
        consultations.forEach(consultation => {
            try {
                const reasonData = JSON.parse(consultation.reason || '{}');
                if (reasonData.sourceThreadId && reasonData.appointmentScheduledAt) {
                    const threadId = reasonData.sourceThreadId;
                    threadConversions.set(threadId, (threadConversions.get(threadId) || 0) + 1);
                }
            }
            catch (e) {
                // Skip
            }
        });
        const topThreadIds = Array.from(threadConversions.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([threadId]) => threadId);
        const threads = await database_1.prisma.medicalThread.findMany({
            where: {
                id: { in: topThreadIds }
            },
            select: {
                id: true,
                title: true,
                tags: true,
                createdAt: true
            }
        });
        return threads.map(thread => ({
            ...thread,
            conversions: threadConversions.get(thread.id) || 0
        }));
    }
    getStartDate(timeframe) {
        if (timeframe === 'all')
            return null;
        const now = new Date();
        if (timeframe === 'week') {
            return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        }
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
    async notifyDoctor(doctorId, consultationId) {
        await database_1.prisma.notification.create({
            data: {
                userId: doctorId,
                type: 'CONSULTATION_REQUEST',
                content: 'You have a new consultation request',
                link: `/dashboard/doctor/consultations/${consultationId}`
            }
        });
    }
    async notifyPatient(patientId, consultationId) {
        await database_1.prisma.notification.create({
            data: {
                userId: patientId,
                type: 'DOCTOR_RESPONSE',
                content: 'Doctor has responded to your consultation request',
                link: `/consultations/${consultationId}`
            }
        });
    }
    async requestReview(patientId, consultationId) {
        await database_1.prisma.notification.create({
            data: {
                userId: patientId,
                type: 'REVIEW_REQUEST',
                content: 'Please review your consultation experience',
                link: `/consultations/${consultationId}/review`
            }
        });
    }
}
exports.ConsultationFunnelService = ConsultationFunnelService;
exports.consultationFunnelService = new ConsultationFunnelService();
