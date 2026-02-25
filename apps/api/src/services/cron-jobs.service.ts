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

    await emailService.sendWelcomeEmail({
      username: doctor.username,
      email: doctor.email
    });

    // Create notification
    await prisma.notifications.create({
      data: {
        recipientId: doctor.id, 
        actorId: doctor.id,
        type: 'LICENSE_EXPIRY_WARNING',
        metadata: {
          daysUntilExpiry,
          link: '/doctor/verification'
        }
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

      await emailService.sendWelcomeEmail({
        username: doctor.username,
        email: doctor.email
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
    await emailService.sendAppointmentReminder({
      patientName: appointment.patient.username,
      email: appointment.patient.email,
      doctorName: appointment.doctor.username,
      appointmentDate: new Date(appointment.startTime).toLocaleDateString(),
      appointmentTime: new Date(appointment.startTime).toLocaleTimeString(),
      appointmentType: 'Consultation',
      appointmentUrl: `${process.env.FRONTEND_URL}/appointments/${appointment.id}`
    });

    // Send to doctor
    await emailService.sendAppointmentReminder({
      patientName: appointment.doctor.username,
      email: appointment.doctor.email,
      doctorName: appointment.patient.username,
      appointmentDate: new Date(appointment.startTime).toLocaleDateString(),
      appointmentTime: new Date(appointment.startTime).toLocaleTimeString(),
      appointmentType: 'Consultation',
      appointmentUrl: `${process.env.FRONTEND_URL}/appointments/${appointment.id}`
    });

    // Create notifications
    await prisma.notifications.createMany({
      data: [
        {
          recipientId: appointment.patientId,
          actorId: appointment.doctorId,
          type: 'APPOINTMENT_REMINDER',
          contentId: appointment.id,
          contentType: 'APPOINTMENT',
          metadata: {
            timeUntil,
            link: `/appointments/${appointment.id}`
          }
        },
        {
          recipientId: appointment.doctorId,
          actorId: appointment.patientId,
          type: 'APPOINTMENT_REMINDER',
          contentId: appointment.id,
          contentType: 'APPOINTMENT',
          metadata: {
            timeUntil,
            link: `/appointments/${appointment.id}`
          }
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
   * Update leaderboards
   * Run every 6 hours
   */
  async updateLeaderboards() {
    console.log('[CRON] Updating leaderboards...');
    
    try {
      await prisma.$executeRaw`SELECT update_leaderboards()`;
      console.log('[CRON] Leaderboards updated successfully');
    } catch (error) {
      console.error('[CRON] Error updating leaderboards:', error);
    }
  }

  /**
   * Check and award badges for all active doctors
   * Run daily at 2 AM
   */
  async checkAllBadges() {
    console.log('[CRON] Checking badges for all doctors...');
    
    try {
      const doctors = await prisma.user.findMany({
        where: {
          role: 'DOCTOR',
          doctorVerificationStatus: 'APPROVED',
          isSuspended: false
        },
        select: { id: true }
      });

      let checked = 0;
      for (const doctor of doctors) {
        try {
          await prisma.$executeRaw`SELECT check_and_award_badges(${doctor.id})`;
          checked++;
        } catch (error) {
          console.error(`[CRON] Failed to check badges for doctor ${doctor.id}:`, error);
        }
      }

      console.log(`[CRON] Checked badges for ${checked} doctors`);
    } catch (error) {
      console.error('[CRON] Error checking badges:', error);
    }
  }

  /**
   * Clean up old notifications
   * Run weekly on Sunday at 3 AM
   */
  async cleanupOldNotifications() {
    console.log('[CRON] Cleaning up old notifications...');
    
    try {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const result = await prisma.notifications.deleteMany({
        where: {
          createdAt: { lt: sixMonthsAgo },
          isRead: true
        }
      });

      console.log(`[CRON] Deleted ${result.count} old notifications`);
    } catch (error) {
      console.error('[CRON] Error cleaning notifications:', error);
    }
  }

  /**
   * Clean up old sessions
   * Run daily at 4 AM
   */
  async cleanupOldSessions() {
    console.log('[CRON] Cleaning up old sessions...');
    
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const result = await prisma.userSession.deleteMany({
        where: {
          startTime: { lt: thirtyDaysAgo }
        }
      });

      console.log(`[CRON] Deleted ${result.count} old sessions`);
    } catch (error) {
      console.error('[CRON] Error cleaning sessions:', error);
    }
  }

  /**
   * Archive old posts
   * Run weekly on Sunday at 2 AM
   */
  async archiveOldPosts() {
    console.log('[CRON] Archiving old posts...');
    
    try {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      const result = await prisma.post.updateMany({
        where: {
          createdAt: { lt: oneYearAgo },
          isArchived: false,
          commentCount: { lt: 5 }
        },
        data: {
          isArchived: true
        }
      });

      console.log(`[CRON] Archived ${result.count} old posts`);
    } catch (error) {
      console.error('[CRON] Error archiving posts:', error);
    }
  }

  /**
   * Check subscription renewals
   * Run daily at 6 AM
   */
  async checkSubscriptionRenewals() {
    console.log('[CRON] Checking subscription renewals...');
    
    try {
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

      const expiringSubscriptions = await prisma.subscription.findMany({
        where: {
          status: 'ACTIVE',
          currentPeriodEnd: {
            lte: threeDaysFromNow,
            gte: new Date()
          }
        },
        include: {
          User: { select: { email: true, username: true } }
        }
      });

      for (const sub of expiringSubscriptions) {
        // Send renewal reminder
        await prisma.notifications.create({
          data: {
            recipientId: sub.userId,
            actorId: sub.userId,
            type: 'SYSTEM_ANNOUNCEMENT',
            metadata: {
              message: `Your ${sub.planName} subscription expires in 3 days`,
              link: '/subscription'
            }
          }
        });
      }

      console.log(`[CRON] Sent ${expiringSubscriptions.length} subscription renewal reminders`);
    } catch (error) {
      console.error('[CRON] Error checking subscriptions:', error);
    }
  }

  /**
   * Auto-resolve old pending reports
   * Run daily at 5 AM
   */
  async autoResolveOldReports() {
    console.log('[CRON] Auto-resolving old reports...');
    
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const result = await prisma.report.updateMany({
        where: {
          status: 'PENDING',
          createdAt: { lt: thirtyDaysAgo }
        },
        data: {
          status: 'AUTO_RESOLVED'
        }
      });

      console.log(`[CRON] Auto-resolved ${result.count} old reports`);
    } catch (error) {
      console.error('[CRON] Error auto-resolving reports:', error);
    }
  }

  /**
   * Clean up failed email queue entries
   * Run daily at 3 AM
   */
  async cleanupFailedEmails() {
    console.log('[CRON] Cleaning up failed emails...');
    
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const result = await prisma.email_queue.deleteMany({
        where: {
          status: 'failed',
          attempts: { gte: 3 },
          createdAt: { lt: sevenDaysAgo }
        }
      });

      console.log(`[CRON] Deleted ${result.count} failed email entries`);
    } catch (error) {
      console.error('[CRON] Error cleaning failed emails:', error);
    }
  }

  /**
   * Update doctor analytics
   * Run daily at 1 AM
   */
  async updateDoctorAnalytics() {
    console.log('[CRON] Updating doctor analytics...');
    
    try {
      // Update response times, ratings, etc.
      await prisma.$executeRaw`
        INSERT INTO "DoctorRating" (doctor_id, total_replies_count, helpful_replies_count, updated_at)
        SELECT 
          "authorId" as doctor_id,
          COUNT(*) as total_replies_count,
          SUM(CASE WHEN "isHelpful" = true THEN 1 ELSE 0 END) as helpful_replies_count,
          CURRENT_TIMESTAMP as updated_at
        FROM "ThreadReply"
        WHERE "authorRole" = 'DOCTOR'
        GROUP BY "authorId"
        ON CONFLICT (doctor_id) DO UPDATE
        SET total_replies_count = EXCLUDED.total_replies_count,
            helpful_replies_count = EXCLUDED.helpful_replies_count,
            updated_at = CURRENT_TIMESTAMP
      `;

      console.log('[CRON] Doctor analytics updated');
    } catch (error) {
      console.error('[CRON] Error updating doctor analytics:', error);
    }
  }

  /**
   * Warn inactive users
   * Run weekly on Wednesday at 10 AM
   */
  async warnInactiveUsers() {
    console.log('[CRON] Warning inactive users...');
    
    try {
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

      const inactiveUsers = await prisma.user.findMany({
        where: {
          updatedAt: { lt: sixtyDaysAgo },
          isSuspended: false,
          role: { in: ['DOCTOR', 'PATIENT'] }
        },
        select: { id: true, email: true, username: true }
      });

      for (const user of inactiveUsers) {
        await prisma.notifications.create({
          data: {
            recipientId: user.id,
            actorId: user.id,
            type: 'SYSTEM_ANNOUNCEMENT',
            metadata: {
              message: 'We miss you! Come back and check what\'s new on MedThread',
              link: '/dashboard'
            }
          }
        });
      }

      console.log(`[CRON] Sent ${inactiveUsers.length} inactive user reminders`);
    } catch (error) {
      console.error('[CRON] Error warning inactive users:', error);
    }
  }

  /**
   * Generate monthly reports
   * Run on 1st of each month at 7 AM
   */
  async generateMonthlyReports() {
    console.log('[CRON] Generating monthly reports...');
    
    try {
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      const startOfLastMonth = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1);
      const endOfLastMonth = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0);

      // Count new users
      const newUsers = await prisma.user.count({
        where: {
          createdAt: {
            gte: startOfLastMonth,
            lte: endOfLastMonth
          }
        }
      });

      // Count new posts
      const newPosts = await prisma.post.count({
        where: {
          createdAt: {
            gte: startOfLastMonth,
            lte: endOfLastMonth
          }
        }
      });

      // Count appointments
      const appointments = await prisma.appointment.count({
        where: {
          createdAt: {
            gte: startOfLastMonth,
            lte: endOfLastMonth
          }
        }
      });

      console.log(`[CRON] Monthly Report - Users: ${newUsers}, Posts: ${newPosts}, Appointments: ${appointments}`);
      
      // Store report in database or send to admins
      // TODO: Implement report storage/notification
    } catch (error) {
      console.error('[CRON] Error generating monthly reports:', error);
    }
  }

  /**
   * Initialize all cron jobs
   */
  initializeCronJobs() {
    console.log('[CRON] Initializing cron jobs...');

    // Daily jobs
    cron.schedule('0 0 * * *', () => this.autoAwardCmeCredits()); // Midnight
    cron.schedule('0 1 * * *', () => this.updateDoctorAnalytics()); // 1 AM
    cron.schedule('0 2 * * *', () => this.checkAllBadges()); // 2 AM
    cron.schedule('0 3 * * *', () => this.cleanupFailedEmails()); // 3 AM
    cron.schedule('0 4 * * *', () => this.cleanupOldSessions()); // 4 AM
    cron.schedule('0 5 * * *', () => this.autoResolveOldReports()); // 5 AM
    cron.schedule('0 6 * * *', () => this.checkSubscriptionRenewals()); // 6 AM
    cron.schedule('0 8 * * *', () => this.sendDailyDigests()); // 8 AM
    cron.schedule('0 9 * * *', () => this.checkExpiringLicenses()); // 9 AM

    // Hourly jobs
    cron.schedule('0 * * * *', () => this.sendAppointmentReminders()); // Every hour

    // Every 6 hours
    cron.schedule('0 */6 * * *', () => this.updateLeaderboards()); // Every 6 hours

    // Weekly jobs
    cron.schedule('0 8 * * 1', () => this.sendWeeklyDigests()); // Monday 8 AM
    cron.schedule('0 2 * * 0', () => this.archiveOldPosts()); // Sunday 2 AM
    cron.schedule('0 3 * * 0', () => this.cleanupOldNotifications()); // Sunday 3 AM
    cron.schedule('0 10 * * 3', () => this.warnInactiveUsers()); // Wednesday 10 AM

    // Monthly jobs
    cron.schedule('0 7 1 * *', () => this.generateMonthlyReports()); // 1st of month 7 AM

    console.log('[CRON] All cron jobs initialized');
    console.log('[CRON] Schedules:');
    console.log('  - Hourly: Appointment reminders, Leaderboards (6h)');
    console.log('  - Daily: CME awards, Analytics, Badges, Cleanups, Digests, Licenses');
    console.log('  - Weekly: Digests, Archives, Notifications, Inactive users');
    console.log('  - Monthly: Reports');
  }
}

export const cronJobsService = new CronJobsService();


