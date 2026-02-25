"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cronJobsService = exports.CronJobsService = void 0;
// Cron jobs service for scheduled tasks
const database_1 = require("@medthread/database");
const email_service_1 = require("./email.service");
const digest_email_service_1 = require("./digest-email.service");
const node_cron_1 = __importDefault(require("node-cron"));
class CronJobsService {
    /**
     * Check for expiring medical licenses and send reminders
     * Run daily
     */
    async checkExpiringLicenses() {
        console.log('[CRON] Checking expiring licenses...');
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
        // Find doctors with licenses expiring in 30 days
        const expiringIn30Days = await database_1.prisma.user.findMany({
            where: {
                role: 'DOCTOR',
                doctorVerificationStatus: 'APPROVED',
                licenseExpiryDate: {
                    lte: thirtyDaysFromNow,
                    gte: new Date()
                }
            },
            select: {
                id: true,
                email: true,
                username: true,
                licenseExpiryDate: true,
                medicalLicenseNumber: true
            }
        });
        // Send 30-day reminders
        for (const doctor of expiringIn30Days) {
            await this.sendLicenseExpiryReminder(doctor, 30);
        }
        // Find doctors with licenses expiring in 7 days
        const expiringIn7Days = await database_1.prisma.user.findMany({
            where: {
                role: 'DOCTOR',
                doctorVerificationStatus: 'APPROVED',
                licenseExpiryDate: {
                    lte: sevenDaysFromNow,
                    gte: new Date()
                }
            },
            select: {
                id: true,
                email: true,
                username: true,
                licenseExpiryDate: true,
                medicalLicenseNumber: true
            }
        });
        // Send 7-day reminders
        for (const doctor of expiringIn7Days) {
            await this.sendLicenseExpiryReminder(doctor, 7);
        }
        // Auto-suspend expired licenses
        await this.suspendExpiredLicenses();
        console.log(`[CRON] Sent ${expiringIn30Days.length + expiringIn7Days.length} license expiry reminders`);
    }
    /**
     * Send license expiry reminder email
     */
    async sendLicenseExpiryReminder(doctor, daysUntilExpiry) {
        const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: ${daysUntilExpiry <= 7 ? '#dc2626' : '#f59e0b'};">
          Medical License Expiring Soon
        </h2>
        <p>Dear Dr. ${doctor.username},</p>
        <p>This is a reminder that your medical license will expire in <strong>${daysUntilExpiry} days</strong>.</p>
        <div style="background-color: #fef2f2; padding: 16px; border-left: 4px solid ${daysUntilExpiry <= 7 ? '#dc2626' : '#f59e0b'}; margin: 16px 0;">
          <p><strong>License Number:</strong> ${doctor.medicalLicenseNumber}</p>
          <p><strong>Expiry Date:</strong> ${new Date(doctor.licenseExpiryDate).toLocaleDateString()}</p>
        </div>
        <p>Please renew your license and update your verification documents to maintain your verified status on MedThread.</p>
        <p>
          <a href="${process.env.FRONTEND_URL}/doctor/verification" 
             style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Update License
          </a>
        </p>
        <p>If your license expires without renewal, your account will be temporarily suspended until updated.</p>
        <p>Best regards,<br>The MedThread Team</p>
      </div>
    `;
        await email_service_1.emailService.sendEmail({
            to: doctor.email,
            subject: `Medical License Expiring in ${daysUntilExpiry} Days - Action Required`,
            html,
            text: `Your medical license will expire in ${daysUntilExpiry} days. Please renew and update your documents.`
        });
        // Create notification
        await database_1.prisma.notification.create({
            data: {
                userId: doctor.id,
                type: 'LICENSE_EXPIRY_WARNING',
                content: `Your medical license expires in ${daysUntilExpiry} days. Please update your documents.`,
                link: '/doctor/verification'
            }
        });
    }
    /**
     * Auto-suspend doctors with expired licenses
     */
    async suspendExpiredLicenses() {
        const now = new Date();
        const expiredDoctors = await database_1.prisma.user.findMany({
            where: {
                role: 'DOCTOR',
                doctorVerificationStatus: 'APPROVED',
                licenseExpiryDate: {
                    lt: now
                }
            }
        });
        for (const doctor of expiredDoctors) {
            await database_1.prisma.user.update({
                where: { id: doctor.id },
                data: {
                    doctorVerificationStatus: 'SUSPENDED',
                    verified: false,
                    isSuspended: true,
                    verificationNotes: 'Medical license expired - automatic suspension'
                }
            });
            // Send notification
            const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">Account Suspended - License Expired</h2>
          <p>Dear Dr. ${doctor.username},</p>
          <p>Your MedThread account has been suspended because your medical license has expired.</p>
          <p>To reactivate your account, please renew your license and submit updated verification documents.</p>
          <p>
            <a href="${process.env.FRONTEND_URL}/doctor/verification" 
               style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Update License
            </a>
          </p>
          <p>Best regards,<br>The MedThread Team</p>
        </div>
      `;
            await email_service_1.emailService.sendEmail({
                to: doctor.email,
                subject: 'Account Suspended - Medical License Expired',
                html,
                text: 'Your account has been suspended due to expired medical license. Please update your documents.'
            });
        }
        console.log(`[CRON] Suspended ${expiredDoctors.length} doctors with expired licenses`);
    }
    /**
     * Send appointment reminders
     * Run every hour
     */
    async sendAppointmentReminders() {
        console.log('[CRON] Sending appointment reminders...');
        const now = new Date();
        const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
        // 24-hour reminders
        const appointmentsIn24Hours = await database_1.prisma.appointment.findMany({
            where: {
                status: 'APPROVED',
                startTime: {
                    gte: now,
                    lte: twentyFourHoursFromNow
                }
            },
            include: {
                patient: { select: { email: true, username: true } },
                doctor: { select: { email: true, username: true } }
            }
        });
        for (const apt of appointmentsIn24Hours) {
            await this.sendAppointmentReminder(apt, '24 hours');
        }
        // 1-hour reminders
        const appointmentsIn1Hour = await database_1.prisma.appointment.findMany({
            where: {
                status: 'APPROVED',
                startTime: {
                    gte: now,
                    lte: oneHourFromNow
                }
            },
            include: {
                patient: { select: { email: true, username: true } },
                doctor: { select: { email: true, username: true } }
            }
        });
        for (const apt of appointmentsIn1Hour) {
            await this.sendAppointmentReminder(apt, '1 hour');
        }
        console.log(`[CRON] Sent ${appointmentsIn24Hours.length + appointmentsIn1Hour.length} appointment reminders`);
    }
    /**
     * Send appointment reminder email
     */
    async sendAppointmentReminder(appointment, timeUntil) {
        // Send to patient
        await email_service_1.emailService.sendAppointmentReminderEmail(appointment.patient.email, appointment.patient.username, new Date(appointment.startTime), appointment.doctor.username);
        // Send to doctor
        await email_service_1.emailService.sendAppointmentReminderEmail(appointment.doctor.email, appointment.doctor.username, new Date(appointment.startTime), appointment.patient.username);
        // Create notifications
        await database_1.prisma.notification.createMany({
            data: [
                {
                    userId: appointment.patientId,
                    type: 'APPOINTMENT_REMINDER',
                    content: `Reminder: Your appointment with Dr. ${appointment.doctor.username} is in ${timeUntil}`,
                    link: `/appointments/${appointment.id}`
                },
                {
                    userId: appointment.doctorId,
                    type: 'APPOINTMENT_REMINDER',
                    content: `Reminder: Your appointment with ${appointment.patient.username} is in ${timeUntil}`,
                    link: `/appointments/${appointment.id}`
                }
            ]
        });
    }
    /**
     * Auto-award CME credits for quality replies
     * Run daily
     */
    async autoAwardCmeCredits() {
        console.log('[CRON] Auto-awarding CME credits...');
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        // Find replies from yesterday by verified doctors
        const replies = await database_1.prisma.threadReply.findMany({
            where: {
                createdAt: {
                    gte: yesterday
                },
                author: {
                    role: 'DOCTOR',
                    doctorVerificationStatus: 'APPROVED'
                }
            },
            include: {
                author: true,
                thread: true
            }
        });
        const { cmeCreditsService } = require('./cme-credits.service');
        let awarded = 0;
        for (const reply of replies) {
            try {
                const result = await cmeCreditsService.checkAndAwardForReply(reply.id);
                if (result) {
                    awarded++;
                }
            }
            catch (error) {
                console.error(`[CRON] Failed to award CME for reply ${reply.id}:`, error);
            }
        }
        console.log(`[CRON] Auto-awarded CME credits to ${awarded} replies`);
    }
    /**
     * Send daily digest emails
     * Run daily at 8 AM
     */
    async sendDailyDigests() {
        console.log('[CRON] Sending daily digest emails...');
        try {
            const count = await digest_email_service_1.digestEmailService.sendDailyDigests();
            console.log(`[CRON] Sent ${count} daily digest emails`);
        }
        catch (error) {
            console.error('[CRON] Error sending daily digests:', error);
        }
    }
    /**
     * Send weekly digest emails
     * Run weekly on Monday at 8 AM
     */
    async sendWeeklyDigests() {
        console.log('[CRON] Sending weekly digest emails...');
        try {
            const count = await digest_email_service_1.digestEmailService.sendWeeklyDigests();
            console.log(`[CRON] Sent ${count} weekly digest emails`);
        }
        catch (error) {
            console.error('[CRON] Error sending weekly digests:', error);
        }
    }
    /**
     * Initialize all cron jobs
     */
    initializeCronJobs() {
        console.log('[CRON] Initializing cron jobs...');
        // Run license check daily at 9 AM
        node_cron_1.default.schedule('0 9 * * *', async () => {
            await this.checkExpiringLicenses();
        });
        // Run appointment reminders every hour
        node_cron_1.default.schedule('0 * * * *', async () => {
            await this.sendAppointmentReminders();
        });
        // Run CME auto-award daily at midnight
        node_cron_1.default.schedule('0 0 * * *', async () => {
            await this.autoAwardCmeCredits();
        });
        // Run daily digest emails at 8 AM
        node_cron_1.default.schedule('0 8 * * *', async () => {
            await this.sendDailyDigests();
        });
        // Run weekly digest emails on Monday at 8 AM
        node_cron_1.default.schedule('0 8 * * 1', async () => {
            await this.sendWeeklyDigests();
        });
        console.log('[CRON] All cron jobs initialized');
    }
}
exports.CronJobsService = CronJobsService;
exports.cronJobsService = new CronJobsService();
