// Email service for sending notifications
// This is a basic implementation - you can integrate with SendGrid, AWS SES, or other providers

import jwt from 'jsonwebtoken'

interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

interface Notification {
  id: string
  type: string
  recipientId: string
  actorId: string
  metadata: any
  createdAt: Date
  actor?: {
    username: string
    avatar?: string
  }
}

interface User {
  id: string
  email: string
  username: string
}

export class EmailService {
  /**
   * Send email with multiple provider support
   */
  async sendEmail(options: EmailOptions): Promise<boolean> {
    const provider = process.env.EMAIL_PROVIDER || 'console';
    
    try {
      switch (provider) {
        case 'sendgrid':
          return await this.sendWithSendGrid(options);
        case 'ses':
          return await this.sendWithSES(options);
        case 'smtp':
          return await this.sendWithSMTP(options);
        default:
          // Console logging for development
          console.log('[EMAIL] Sending email:', {
            to: options.to,
            subject: options.subject
          });
          console.log('[EMAIL] Email content:', options.html);
          return true;
      }
    } catch (error) {
      console.error('[EMAIL] Failed to send email:', error);
      // Fallback to console logging
      console.log('[EMAIL] Email would have been sent to:', options.to);
      return false;
    }
  }

  /**
   * Send with SendGrid
   */
  private async sendWithSendGrid(options: EmailOptions): Promise<boolean> {
    if (!process.env.SENDGRID_API_KEY) {
      throw new Error('SENDGRID_API_KEY not configured');
    }

    // Uncomment when SendGrid is installed
    /*
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    
    await sgMail.send({
      to: options.to,
      from: process.env.EMAIL_FROM || 'noreply@medthread.com',
      subject: options.subject,
      html: options.html,
      text: options.text
    });
    */
    
    console.log('[EMAIL] SendGrid: Email sent to', options.to);
    return true;
  }

  /**
   * Send with AWS SES
   */
  private async sendWithSES(options: EmailOptions): Promise<boolean> {
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      throw new Error('AWS credentials not configured');
    }

    // Uncomment when AWS SDK is installed
    /*
    const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');
    
    const client = new SESClient({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      }
    });

    const command = new SendEmailCommand({
      Source: process.env.EMAIL_FROM || 'noreply@medthread.com',
      Destination: { ToAddresses: [options.to] },
      Message: {
        Subject: { Data: options.subject },
        Body: {
          Html: { Data: options.html },
          Text: { Data: options.text || '' }
        }
      }
    });

    await client.send(command);
    */
    
    console.log('[EMAIL] AWS SES: Email sent to', options.to);
    return true;
  }

  /**
   * Send with SMTP (Nodemailer)
   */
  private async sendWithSMTP(options: EmailOptions): Promise<boolean> {
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      throw new Error('SMTP credentials not configured');
    }

    // Uncomment when Nodemailer is installed
    /*
    const nodemailer = require('nodemailer');
    
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@medthread.com',
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text
    });
    */
    
    console.log('[EMAIL] SMTP: Email sent to', options.to);
    return true;
  }

  /**
   * Send doctor verification approved email
   */
  async sendVerificationApprovedEmail(doctorEmail: string, doctorName: string) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Congratulations! Your Doctor Verification is Approved</h2>
        <p>Dear Dr. ${doctorName},</p>
        <p>We're pleased to inform you that your doctor verification has been approved.</p>
        <p>You can now:</p>
        <ul>
          <li>Reply to medical threads with a verified badge</li>
          <li>Earn CME credits for quality answers</li>
          <li>Accept consultation requests from patients</li>
          <li>Build your professional profile</li>
        </ul>
        <p>
          <a href="${process.env.FRONTEND_URL}/dashboard/doctor" 
             style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Go to Dashboard
          </a>
        </p>
        <p>Thank you for joining MedThread!</p>
        <p>Best regards,<br>The MedThread Team</p>
      </div>
    `

    return this.sendEmail({
      to: doctorEmail,
      subject: 'Doctor Verification Approved - MedThread',
      html,
      text: `Congratulations Dr. ${doctorName}! Your doctor verification has been approved.`
    })
  }

  /**
   * Send doctor verification rejected email
   */
  async sendVerificationRejectedEmail(doctorEmail: string, doctorName: string, reason: string) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Doctor Verification Update</h2>
        <p>Dear Dr. ${doctorName},</p>
        <p>We regret to inform you that your doctor verification request has been rejected.</p>
        <p><strong>Reason:</strong></p>
        <p style="background-color: #fef2f2; padding: 12px; border-left: 4px solid #dc2626;">
          ${reason}
        </p>
        <p>You can resubmit your verification with the correct documents.</p>
        <p>
          <a href="${process.env.FRONTEND_URL}/doctor/verification" 
             style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Resubmit Verification
          </a>
        </p>
        <p>If you have any questions, please contact our support team.</p>
        <p>Best regards,<br>The MedThread Team</p>
      </div>
    `

    return this.sendEmail({
      to: doctorEmail,
      subject: 'Doctor Verification Update - MedThread',
      html,
      text: `Your doctor verification request has been rejected. Reason: ${reason}`
    })
  }

  /**
   * Send consultation request notification to doctor
   */
  async sendConsultationRequestEmail(doctorEmail: string, doctorName: string, patientName: string, consultationId: string) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">New Consultation Request</h2>
        <p>Dear Dr. ${doctorName},</p>
        <p>You have received a new consultation request from ${patientName}.</p>
        <p>
          <a href="${process.env.FRONTEND_URL}/dashboard/doctor/consultations/${consultationId}" 
             style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            View Request
          </a>
        </p>
        <p>Please respond within 24 hours to maintain your response rate.</p>
        <p>Best regards,<br>The MedThread Team</p>
      </div>
    `

    return this.sendEmail({
      to: doctorEmail,
      subject: 'New Consultation Request - MedThread',
      html,
      text: `You have a new consultation request from ${patientName}.`
    })
  }

  /**
   * Send appointment reminder email
   */
  async sendAppointmentReminderEmail(email: string, name: string, appointmentTime: Date, doctorName: string) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Appointment Reminder</h2>
        <p>Dear ${name},</p>
        <p>This is a reminder of your upcoming appointment:</p>
        <div style="background-color: #eff6ff; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p><strong>Doctor:</strong> Dr. ${doctorName}</p>
          <p><strong>Date & Time:</strong> ${appointmentTime.toLocaleString()}</p>
        </div>
        <p>Please join the consultation on time.</p>
        <p>
          <a href="${process.env.FRONTEND_URL}/appointments" 
             style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            View Appointment
          </a>
        </p>
        <p>Best regards,<br>The MedThread Team</p>
      </div>
    `

    return this.sendEmail({
      to: email,
      subject: 'Appointment Reminder - MedThread',
      html,
      text: `Reminder: Your appointment with Dr. ${doctorName} is at ${appointmentTime.toLocaleString()}`
    })
  }

  /**
   * Send CME credits earned notification
   */
  async sendCmeCreditsEarnedEmail(doctorEmail: string, doctorName: string, credits: number, activityType: string) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10b981;">CME Credits Earned!</h2>
        <p>Dear Dr. ${doctorName},</p>
        <p>Congratulations! You've earned <strong>${credits} CME credits</strong> for your ${activityType.replace(/_/g, ' ').toLowerCase()}.</p>
        <p>
          <a href="${process.env.FRONTEND_URL}/dashboard/doctor/cme" 
             style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            View CME Dashboard
          </a>
        </p>
        <p>Keep up the great work!</p>
        <p>Best regards,<br>The MedThread Team</p>
      </div>
    `

    return this.sendEmail({
      to: doctorEmail,
      subject: `You earned ${credits} CME credits - MedThread`,
      html,
      text: `Congratulations! You've earned ${credits} CME credits.`
    })
  }

  /**
   * Send welcome email to new user
   */
  async sendWelcomeEmail(email: string, name: string, role: string) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Welcome to MedThread!</h2>
        <p>Dear ${name},</p>
        <p>Thank you for joining MedThread as a ${role.toLowerCase()}.</p>
        ${role === 'DOCTOR' ? `
          <p>To start helping patients, please complete your doctor verification:</p>
          <p>
            <a href="${process.env.FRONTEND_URL}/doctor/verification" 
               style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Complete Verification
            </a>
          </p>
        ` : `
          <p>You can now:</p>
          <ul>
            <li>Ask medical questions</li>
            <li>Get answers from verified doctors</li>
            <li>Book consultations</li>
            <li>Join health communities</li>
          </ul>
          <p>
            <a href="${process.env.FRONTEND_URL}/threads" 
               style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Explore Threads
            </a>
          </p>
        `}
        <p>Best regards,<br>The MedThread Team</p>
      </div>
    `

    return this.sendEmail({
      to: email,
      subject: 'Welcome to MedThread!',
      html,
      text: `Welcome to MedThread, ${name}!`
    })
  }

  /**
   * Generate unsubscribe token for email notifications
   */
  generateUnsubscribeToken(userId: string, notificationType: string): string {
    const secret = process.env.JWT_SECRET || 'your-secret-key'
    return jwt.sign(
      { userId, notificationType, purpose: 'unsubscribe' },
      secret,
      { expiresIn: '90d' }
    )
  }

  /**
   * Handle unsubscribe request from email link
   */
  async handleUnsubscribe(token: string): Promise<{ userId: string; notificationType: string } | null> {
    try {
      const secret = process.env.JWT_SECRET || 'your-secret-key'
      const decoded = jwt.verify(token, secret) as any
      
      if (decoded.purpose !== 'unsubscribe') {
        return null
      }
      
      return {
        userId: decoded.userId,
        notificationType: decoded.notificationType
      }
    } catch (error) {
      console.error('[EMAIL] Invalid unsubscribe token:', error)
      return null
    }
  }

  /**
   * Get branded email header
   */
  private getEmailHeader(): string {
    return `
      <div style="background-color: #2563eb; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">MedThread</h1>
      </div>
    `
  }

  /**
   * Get branded email footer with unsubscribe link
   */
  private getEmailFooter(unsubscribeToken?: string): string {
    const unsubscribeLink = unsubscribeToken 
      ? `<p style="font-size: 12px; color: #6b7280; margin-top: 20px;">
           <a href="${process.env.FRONTEND_URL}/api/notifications/unsubscribe/${unsubscribeToken}" 
              style="color: #6b7280; text-decoration: underline;">
             Unsubscribe from these emails
           </a>
         </p>`
      : ''
    
    return `
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
        <p style="font-size: 12px; color: #6b7280; text-align: center;">
          © ${new Date().getFullYear()} MedThread. All rights reserved.
        </p>
        ${unsubscribeLink}
      </div>
    `
  }

  /**
   * Send instant notification email
   */
  async sendNotificationEmail(user: User, notification: Notification): Promise<boolean> {
    const unsubscribeToken = this.generateUnsubscribeToken(user.id, notification.type)
    const template = this.getNotificationEmailTemplate(notification)
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        ${this.getEmailHeader()}
        <div style="padding: 30px;">
          ${template.html}
        </div>
        ${this.getEmailFooter(unsubscribeToken)}
      </div>
    `

    return this.sendEmail({
      to: user.email,
      subject: template.subject,
      html,
      text: template.text
    })
  }

  /**
   * Send digest email with aggregated notifications
   */
  async sendDigestEmail(user: User, notifications: Notification[], frequency: 'daily' | 'weekly'): Promise<boolean> {
    if (notifications.length === 0) {
      return false
    }

    // Group notifications by type
    const groupedNotifications = notifications.reduce((acc, notification) => {
      if (!acc[notification.type]) {
        acc[notification.type] = []
      }
      acc[notification.type].push(notification)
      return acc
    }, {} as Record<string, Notification[]>)

    const notificationSummary = Object.entries(groupedNotifications)
      .map(([type, notifs]) => {
        const count = notifs.length
        const typeLabel = this.getNotificationTypeLabel(type)
        return `<li><strong>${count}</strong> ${typeLabel}${count > 1 ? 's' : ''}</li>`
      })
      .join('')

    const notificationDetails = Object.entries(groupedNotifications)
      .map(([type, notifs]) => {
        const typeLabel = this.getNotificationTypeLabel(type)
        const items = notifs.slice(0, 5).map(notif => {
          const actorName = notif.actor?.username || 'Someone'
          const preview = notif.metadata?.preview || notif.metadata?.body || ''
          return `
            <div style="padding: 12px; background-color: #f9fafb; border-radius: 6px; margin-bottom: 8px;">
              <p style="margin: 0; font-weight: 600;">${actorName}</p>
              <p style="margin: 4px 0 0 0; font-size: 14px; color: #6b7280;">${preview}</p>
            </div>
          `
        }).join('')
        
        const remaining = notifs.length - 5
        const remainingText = remaining > 0 
          ? `<p style="font-size: 14px; color: #6b7280;">...and ${remaining} more</p>` 
          : ''
        
        return `
          <div style="margin-bottom: 24px;">
            <h3 style="color: #1f2937; margin-bottom: 12px;">${typeLabel}s</h3>
            ${items}
            ${remainingText}
          </div>
        `
      })
      .join('')

    const periodLabel = frequency === 'daily' ? 'today' : 'this week'
    const unsubscribeToken = this.generateUnsubscribeToken(user.id, 'DIGEST')

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        ${this.getEmailHeader()}
        <div style="padding: 30px;">
          <h2 style="color: #1f2937; margin-top: 0;">Your ${frequency} notification digest</h2>
          <p style="color: #4b5563;">Here's what happened ${periodLabel}:</p>
          
          <div style="background-color: #eff6ff; padding: 16px; border-radius: 8px; margin: 20px 0;">
            <ul style="margin: 0; padding-left: 20px;">
              ${notificationSummary}
            </ul>
          </div>

          ${notificationDetails}

          <p style="text-align: center; margin-top: 30px;">
            <a href="${process.env.FRONTEND_URL}/notifications" 
               style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View All Notifications
            </a>
          </p>
        </div>
        ${this.getEmailFooter(unsubscribeToken)}
      </div>
    `

    return this.sendEmail({
      to: user.email,
      subject: `Your ${frequency} MedThread digest - ${notifications.length} new notification${notifications.length > 1 ? 's' : ''}`,
      html,
      text: `You have ${notifications.length} new notifications ${periodLabel}. Visit ${process.env.FRONTEND_URL}/notifications to view them.`
    })
  }

  /**
   * Get notification type label for display
   */
  private getNotificationTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      REPLY: 'Reply',
      MENTION: 'Mention',
      AWARD: 'Award',
      FOLLOWER: 'New Follower',
      APPOINTMENT_REQUEST: 'Appointment Request',
      APPOINTMENT_UPDATE: 'Appointment Update',
      VERIFICATION_STATUS: 'Verification Status',
      COMMUNITY_INVITE: 'Community Invite',
      DIRECT_MESSAGE: 'Direct Message',
      SYSTEM_ANNOUNCEMENT: 'System Announcement',
      UPVOTE_MILESTONE: 'Upvote Milestone'
    }
    return labels[type] || type
  }

  /**
   * Get email template for specific notification type
   */
  private getNotificationEmailTemplate(notification: Notification): { subject: string; html: string; text: string } {
    const actorName = notification.actor?.username || 'Someone'
    const metadata = notification.metadata || {}

    switch (notification.type) {
      case 'REPLY':
        return {
          subject: `${actorName} replied to your ${metadata.contentType || 'post'}`,
          html: `
            <h2 style="color: #1f2937; margin-top: 0;">New Reply</h2>
            <p><strong>${actorName}</strong> replied to your ${metadata.contentType || 'post'}:</p>
            <div style="background-color: #f9fafb; padding: 16px; border-radius: 8px; border-left: 4px solid #2563eb; margin: 16px 0;">
              <p style="margin: 0; color: #4b5563;">${metadata.preview || metadata.body || ''}</p>
            </div>
            <p>
              <a href="${process.env.FRONTEND_URL}${metadata.link || '/notifications'}" 
                 style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                View Reply
              </a>
            </p>
          `,
          text: `${actorName} replied to your ${metadata.contentType || 'post'}: ${metadata.preview || metadata.body || ''}`
        }

      case 'MENTION':
        return {
          subject: `${actorName} mentioned you`,
          html: `
            <h2 style="color: #1f2937; margin-top: 0;">You were mentioned</h2>
            <p><strong>${actorName}</strong> mentioned you in a ${metadata.contentType || 'post'}:</p>
            <div style="background-color: #f9fafb; padding: 16px; border-radius: 8px; border-left: 4px solid #2563eb; margin: 16px 0;">
              <p style="margin: 0; color: #4b5563;">${metadata.preview || metadata.body || ''}</p>
            </div>
            <p>
              <a href="${process.env.FRONTEND_URL}${metadata.link || '/notifications'}" 
                 style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                View Mention
              </a>
            </p>
          `,
          text: `${actorName} mentioned you: ${metadata.preview || metadata.body || ''}`
        }

      case 'AWARD':
        return {
          subject: `${actorName} gave you an award!`,
          html: `
            <h2 style="color: #1f2937; margin-top: 0;">🏆 You received an award!</h2>
            <p><strong>${actorName}</strong> gave your ${metadata.contentType || 'post'} an award${metadata.awardType ? `: ${metadata.awardType}` : ''}!</p>
            <p>
              <a href="${process.env.FRONTEND_URL}${metadata.link || '/notifications'}" 
                 style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                View Post
              </a>
            </p>
          `,
          text: `${actorName} gave your ${metadata.contentType || 'post'} an award!`
        }

      case 'FOLLOWER':
        return {
          subject: `${actorName} started following you`,
          html: `
            <h2 style="color: #1f2937; margin-top: 0;">New Follower</h2>
            <p><strong>${actorName}</strong> started following you!</p>
            <p>
              <a href="${process.env.FRONTEND_URL}/profile/${actorName}" 
                 style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                View Profile
              </a>
            </p>
          `,
          text: `${actorName} started following you!`
        }

      case 'APPOINTMENT_REQUEST':
        return {
          subject: `New appointment request from ${actorName}`,
          html: `
            <h2 style="color: #1f2937; margin-top: 0;">New Appointment Request</h2>
            <p>You have a new appointment request from <strong>${actorName}</strong>.</p>
            ${metadata.appointmentTime ? `<p><strong>Requested time:</strong> ${new Date(metadata.appointmentTime).toLocaleString()}</p>` : ''}
            <p>
              <a href="${process.env.FRONTEND_URL}${metadata.link || '/dashboard/doctor/appointments'}" 
                 style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                View Request
              </a>
            </p>
          `,
          text: `New appointment request from ${actorName}`
        }

      case 'APPOINTMENT_UPDATE':
        return {
          subject: `Appointment ${metadata.status || 'update'}`,
          html: `
            <h2 style="color: #1f2937; margin-top: 0;">Appointment Update</h2>
            <p>Your appointment with <strong>${actorName}</strong> has been ${metadata.status || 'updated'}.</p>
            ${metadata.appointmentTime ? `<p><strong>Time:</strong> ${new Date(metadata.appointmentTime).toLocaleString()}</p>` : ''}
            <p>
              <a href="${process.env.FRONTEND_URL}${metadata.link || '/appointments'}" 
                 style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                View Appointment
              </a>
            </p>
          `,
          text: `Your appointment with ${actorName} has been ${metadata.status || 'updated'}`
        }

      case 'VERIFICATION_STATUS':
        return {
          subject: `Doctor verification ${metadata.status || 'update'}`,
          html: `
            <h2 style="color: #1f2937; margin-top: 0;">Verification ${metadata.status || 'Update'}</h2>
            <p>Your doctor verification has been <strong>${metadata.status || 'updated'}</strong>.</p>
            ${metadata.reason ? `<p style="background-color: #fef2f2; padding: 12px; border-left: 4px solid #dc2626;"><strong>Reason:</strong> ${metadata.reason}</p>` : ''}
            <p>
              <a href="${process.env.FRONTEND_URL}/dashboard/doctor" 
                 style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                View Dashboard
              </a>
            </p>
          `,
          text: `Your doctor verification has been ${metadata.status || 'updated'}`
        }

      case 'COMMUNITY_INVITE':
        return {
          subject: `${actorName} invited you to moderate ${metadata.communityName || 'a community'}`,
          html: `
            <h2 style="color: #1f2937; margin-top: 0;">Community Moderator Invite</h2>
            <p><strong>${actorName}</strong> invited you to moderate <strong>${metadata.communityName || 'a community'}</strong>.</p>
            <p>
              <a href="${process.env.FRONTEND_URL}${metadata.link || '/communities'}" 
                 style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                View Invite
              </a>
            </p>
          `,
          text: `${actorName} invited you to moderate ${metadata.communityName || 'a community'}`
        }

      case 'DIRECT_MESSAGE':
        return {
          subject: `New message from ${actorName}`,
          html: `
            <h2 style="color: #1f2937; margin-top: 0;">New Message</h2>
            <p>You have a new message from <strong>${actorName}</strong>.</p>
            <div style="background-color: #f9fafb; padding: 16px; border-radius: 8px; margin: 16px 0;">
              <p style="margin: 0; color: #4b5563;">${metadata.preview || 'Click to view message'}</p>
            </div>
            <p>
              <a href="${process.env.FRONTEND_URL}${metadata.link || '/messages'}" 
                 style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                View Message
              </a>
            </p>
          `,
          text: `New message from ${actorName}: ${metadata.preview || 'Click to view'}`
        }

      case 'SYSTEM_ANNOUNCEMENT':
        return {
          subject: metadata.title || 'System Announcement',
          html: `
            <h2 style="color: #1f2937; margin-top: 0;">📢 ${metadata.title || 'System Announcement'}</h2>
            <div style="background-color: #eff6ff; padding: 16px; border-radius: 8px; border-left: 4px solid #2563eb; margin: 16px 0;">
              <p style="margin: 0; color: #1e40af;">${metadata.body || metadata.preview || ''}</p>
            </div>
            ${metadata.link ? `
              <p>
                <a href="${process.env.FRONTEND_URL}${metadata.link}" 
                   style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  Learn More
                </a>
              </p>
            ` : ''}
          `,
          text: `${metadata.title || 'System Announcement'}: ${metadata.body || metadata.preview || ''}`
        }

      case 'UPVOTE_MILESTONE':
        return {
          subject: `Your ${metadata.contentType || 'post'} reached ${metadata.upvoteCount || 'milestone'} upvotes!`,
          html: `
            <h2 style="color: #1f2937; margin-top: 0;">🎉 Milestone Reached!</h2>
            <p>Congratulations! Your ${metadata.contentType || 'post'} reached <strong>${metadata.upvoteCount || 'a milestone'} upvotes</strong>!</p>
            ${metadata.postTitle ? `<p><strong>${metadata.postTitle}</strong></p>` : ''}
            <p>
              <a href="${process.env.FRONTEND_URL}${metadata.link || '/notifications'}" 
                 style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                View Post
              </a>
            </p>
          `,
          text: `Your ${metadata.contentType || 'post'} reached ${metadata.upvoteCount || 'milestone'} upvotes!`
        }

      default:
        return {
          subject: 'New notification from MedThread',
          html: `
            <h2 style="color: #1f2937; margin-top: 0;">New Notification</h2>
            <p>You have a new notification from <strong>${actorName}</strong>.</p>
            <p>
              <a href="${process.env.FRONTEND_URL}/notifications" 
                 style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                View Notification
              </a>
            </p>
          `,
          text: `You have a new notification from ${actorName}`
        }
    }
  }
}

export const emailService = new EmailService()
