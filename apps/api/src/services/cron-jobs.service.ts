// Cron jobs service for scheduled tasks
import { prisma } from '@medthread/database';
import { emailService } from './email.service';
import { digestEmailService } from './digest-email.service';
import cron from 'node-cron';

export class CronJobsService {
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
    const expiringIn30Days = await prisma.user.findMany({
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
    const expiringIn7Days = await prisma.user.findMany({
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
  private async sendLicenseExpiryReminder(doctor: any, daysUntilExpiry: number) {
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

    await emailService.sendEmail({
      to: doctor.email,
      subject: `Medical License Expiring in ${daysUntilExpiry} Days - Action Required`,
      html,
      text: `Your medical license will expire in ${daysUntilExpiry} days. Please renew and update your documents.`
    });

    // Create notification
    await prisma.notification.create({
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
  private async suspendExpiredLicenses() {
    const now = new Date();

    const expiredDoctors = await prisma.user.findMany({
      where: {
        role: 'DOCTOR',
        doctorVerificationStatus: 'APPROVED',
        licenseExpiryDate: {
          lt: now
        }
      }
    });

    for (const doctor of expiredDoctors) {
      await prisma.user.update({
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

      await emailService.sendEmail({
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
    const appointmentsIn24Hours = await prisma.appointment.findMany({
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
    const appointmentsIn1Hour = await prisma.appointment.findMany({
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
  private async sendAppointmentReminder(appointment: any, timeUntil: string) {
    // Send to patient
    await emailService.sendAppointmentReminderEmail(
      appointment.patient.email,
      appointment.patient.username,
      new Date(appointment.startTime),
      appointment.doctor.username
    );

    // Send to doctor
    await emailService.sendAppointmentReminderEmail(
      appointment.doctor.email,
      appointment.doctor.username,
      new Date(appointment.startTime),
      appointment.patient.username
    );

    // Create notifications
    await prisma.notification.createMany({
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
    const replies = await prisma.threadReply.findMany({
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
      } catch (error) {
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
      const count = await digestEmailService.sendDailyDigests();
      console.log(`[CRON] Sent ${count} daily digest emails`);
    } catch (error) {
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
      const count = await digestEmailService.sendWeeklyDigests();
      console.log(`[CRON] Sent ${count} weekly digest emails`);
    } catch (error) {
      console.error('[CRON] Error sending weekly digests:', error);
    }
  }

  /**
   * Initialize all cron jobs
   */
  initializeCronJobs() {
    console.log('[CRON] Initializing cron jobs...');

    // Run license check daily at 9 AM
    cron.schedule('0 9 * * *', async () => {
      await this.checkExpiringLicenses();
    });

    // Run appointment reminders every hour
    cron.schedule('0 * * * *', async () => {
      await this.sendAppointmentReminders();
    });

    // Run CME auto-award daily at midnight
    cron.schedule('0 0 * * *', async () => {
      await this.autoAwardCmeCredits();
    });

    // Run daily digest emails at 8 AM
    cron.schedule('0 8 * * *', async () => {
      await this.sendDailyDigests();
    });

    // Run weekly digest emails on Monday at 8 AM
    cron.schedule('0 8 * * 1', async () => {
      await this.sendWeeklyDigests();
    });

    // Calculate platform analytics daily at 1 AM
    cron.schedule('0 1 * * *', async () => {
      await this.calculateDailyAnalytics();
    });

    // Run symptom heatmap aggregation daily at 2 AM
    cron.schedule('0 2 * * *', async () => {
      await this.runSymptomHeatmapAggregation();
    });

    // Run automated backups daily at 3 AM
    cron.schedule('0 3 * * *', async () => {
      await this.runAutomatedBackup();
    });

    // Cleanup old backups weekly on Sunday at 4 AM
    cron.schedule('0 4 * * 0', async () => {
      await this.cleanupOldBackups();
    });

    // Calculate health trends every 6 hours
    cron.schedule('0 */6 * * *', async () => {
      await this.calculateHealthTrends();
    });

    // Send patient feedback notifications daily at 9 AM
    cron.schedule('0 9 * * *', async () => {
      await this.sendFeedbackNotifications();
    });

    // Calculate community activity daily at 2 AM
    cron.schedule('0 2 * * *', async () => {
      await this.calculateCommunityActivity();
    });

    console.log('[CRON] All cron jobs initialized');
  }

  /**
   * Calculate daily platform analytics
   */
  async calculateDailyAnalytics() {
    console.log('[CRON] Calculating daily analytics...');
    
    try {
      const { platformAnalyticsService } = require('./platform-analytics.service');
      await platformAnalyticsService.calculateDailyMetrics();
      console.log('[CRON] Daily analytics calculated successfully');
    } catch (error) {
      console.error('[CRON] Error calculating daily analytics:', error);
    }
  }

  /**
   * Calculate health trends
   */
  async calculateHealthTrends() {
    console.log('[CRON] Calculating health trends...');
    
    try {
      const { healthAnalyticsService } = require('./health-analytics.service');
      await healthAnalyticsService.calculateHealthTrends('hourly');
      console.log('[CRON] Health trends calculated successfully');
    } catch (error) {
      console.error('[CRON] Error calculating health trends:', error);
    }
  }

  /**
   * Send patient feedback notifications
   */
  async sendFeedbackNotifications() {
    console.log('[CRON] Sending patient feedback notifications...');
    
    try {
      const { feedbackNotificationService } = require('./feedback-notification.service');
      const result = await feedbackNotificationService.sendPendingFeedbackNotifications();
      console.log(`[CRON] Sent ${result.notificationsSent} feedback notifications`);
    } catch (error) {
      console.error('[CRON] Error sending feedback notifications:', error);
    }
  }

  /**
   * Calculate community activity tiers
   */
  async calculateCommunityActivity() {
    console.log('[CRON] Calculating community activity...');
    
    try {
      const { enhancedAnalyticsService } = require('./enhanced-analytics.service');
      const result = await enhancedAnalyticsService.analyzeCommunityActivity();
      console.log(`[CRON] Analyzed ${result.length} communities`);
    } catch (error) {
      console.error('[CRON] Error calculating community activity:', error);
    }
  }

  /**
   * Run symptom heatmap aggregation
   */
  async runSymptomHeatmapAggregation() {
    console.log('[CRON] Running symptom heatmap aggregation...');
    
    try {
      const { runHeatmapAggregation } = require('./heatmapAggregator.service');
      await runHeatmapAggregation();
      console.log('[CRON] Symptom heatmap aggregation completed successfully');
    } catch (error) {
      console.error('[CRON] Error running symptom heatmap aggregation:', error);
    }
  }

  /**
   * Run automated backup
   */
  async runAutomatedBackup() {
    console.log('[CRON] Running automated backup...');
    
    try {
      const { backupService } = require('./backup.service');
      const result = await backupService.createFullBackup();
      console.log(`[CRON] Backup created: ${result.backupId}`);
    } catch (error) {
      console.error('[CRON] Error creating backup:', error);
    }
  }

  /**
   * Cleanup old backups
   */
  async cleanupOldBackups() {
    console.log('[CRON] Cleaning up old backups...');
    
    try {
      const { backupService } = require('./backup.service');
      const result = await backupService.cleanupOldBackups();
      console.log(`[CRON] Cleaned up ${result.deletedCount} old backups`);
    } catch (error) {
      console.error('[CRON] Error cleaning up backups:', error);
    }
  }
}

export const cronJobsService = new CronJobsService();
