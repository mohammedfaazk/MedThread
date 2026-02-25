import fs from 'fs';
import path from 'path';
import { transporter, EMAIL_CONFIG } from '../config/email';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

interface WelcomeEmailData {
  username: string;
  email: string;
  loginUrl?: string;
}

interface VerificationEmailData {
  username: string;
  email: string;
  verificationUrl: string;
}

interface PasswordResetEmailData {
  username: string;
  email: string;
  resetUrl: string;
}

interface AppointmentReminderData {
  patientName: string;
  email: string;
  doctorName: string;
  appointmentDate: string;
  appointmentTime: string;
  appointmentType: string;
  appointmentUrl: string;
}

interface NotificationEmailData {
  username: string;
  email: string;
  title: string;
  content: string;
  actionUrl?: string;
  actionText?: string;
}

export class EmailService {
  private templatesPath = path.join(__dirname, '../templates/email');

  /**
   * Load email template
   */
  private loadTemplate(templateName: string): string {
    const templatePath = path.join(this.templatesPath, `${templateName}.html`);
    return fs.readFileSync(templatePath, 'utf-8');
  }

  /**
   * Replace template variables
   */
  private replaceVariables(template: string, data: Record<string, any>): string {
    let result = template;
    Object.keys(data).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, data[key] || '');
    });
    return result;
  }

  /**
   * Send email
   */
  private async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      if (!transporter) {
        // Log to console if no transporter configured
        console.log('\n📧 EMAIL (Console Mode):');
        console.log('To:', options.to);
        console.log('Subject:', options.subject);
        console.log('Content:', options.text || 'HTML email');
        console.log('---\n');
        return true;
      }

      await transporter.sendMail({
        from: EMAIL_CONFIG.from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });

      console.log(`✅ Email sent to ${options.to}: ${options.subject}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to send email:', error);
      return false;
    }
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(data: WelcomeEmailData): Promise<boolean> {
    const template = this.loadTemplate('welcome');
    const html = this.replaceVariables(template, {
      username: data.username,
      loginUrl: data.loginUrl || 'http://localhost:3000/login',
      unsubscribeUrl: 'http://localhost:3000/unsubscribe',
    });

    return this.sendEmail({
      to: data.email,
      subject: 'Welcome to MedThread!',
      html,
      text: `Hi ${data.username}, Welcome to MedThread! Your account has been successfully created.`,
    });
  }

  /**
   * Send verification email
   */
  async sendVerificationEmail(data: VerificationEmailData): Promise<boolean> {
    const template = this.loadTemplate('verification');
    const html = this.replaceVariables(template, {
      username: data.username,
      verificationUrl: data.verificationUrl,
    });

    return this.sendEmail({
      to: data.email,
      subject: 'Verify Your Email - MedThread',
      html,
      text: `Hi ${data.username}, Please verify your email: ${data.verificationUrl}`,
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(data: PasswordResetEmailData): Promise<boolean> {
    const template = this.loadTemplate('password-reset');
    const html = this.replaceVariables(template, {
      username: data.username,
      resetUrl: data.resetUrl,
    });

    return this.sendEmail({
      to: data.email,
      subject: 'Reset Your Password - MedThread',
      html,
      text: `Hi ${data.username}, Reset your password: ${data.resetUrl}`,
    });
  }

  /**
   * Send appointment reminder
   */
  async sendAppointmentReminder(data: AppointmentReminderData): Promise<boolean> {
    const template = this.loadTemplate('appointment-reminder');
    const html = this.replaceVariables(template, {
      patientName: data.patientName,
      doctorName: data.doctorName,
      appointmentDate: data.appointmentDate,
      appointmentTime: data.appointmentTime,
      appointmentType: data.appointmentType,
      appointmentUrl: data.appointmentUrl,
    });

    return this.sendEmail({
      to: data.email,
      subject: 'Appointment Reminder - MedThread',
      html,
      text: `Hi ${data.patientName}, Reminder: You have an appointment with Dr. ${data.doctorName} on ${data.appointmentDate} at ${data.appointmentTime}.`,
    });
  }

  /**
   * Send notification email
   */
  async sendNotificationEmail(data: NotificationEmailData): Promise<boolean> {
    const template = this.loadTemplate('notification');
    const html = this.replaceVariables(template, {
      username: data.username,
      title: data.title,
      content: data.content,
      actionUrl: data.actionUrl || '',
      actionText: data.actionText || 'View Details',
    });

    return this.sendEmail({
      to: data.email,
      subject: data.title,
      html,
      text: `Hi ${data.username}, ${data.content}`,
    });
  }

  /**
   * Send new comment notification
   */
  async sendNewCommentNotification(data: {
    username: string;
    email: string;
    postTitle: string;
    commenterName: string;
    commentPreview: string;
    postUrl: string;
    isPrivate?: boolean; // Privacy indicator
  }): Promise<boolean> {
    const privacyBadge = data.isPrivate 
      ? '<span style="background-color: #dc3545; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; margin-left: 8px;">🔒 PRIVATE</span>' 
      : '';
    
    const privacyNote = data.isPrivate
      ? '<p style="color: #dc3545; font-size: 14px; margin-top: 10px;"><strong>Note:</strong> This is a private post. Only you and approved doctors can see this content.</p>'
      : '';
    
    return this.sendNotificationEmail({
      username: data.username,
      email: data.email,
      title: `New Comment on Your Post${data.isPrivate ? ' (Private)' : ''}`,
      content: `${data.commenterName} commented on your post "${data.postTitle}"${privacyBadge}: "${data.commentPreview}"${privacyNote}`,
      actionUrl: data.postUrl,
      actionText: 'View Comment',
    });
  }

  /**
   * Send new reply notification
   */
  async sendNewReplyNotification(data: {
    username: string;
    email: string;
    replierName: string;
    replyPreview: string;
    postUrl: string;
    isPrivateReply?: boolean; // Privacy indicator
    isDoctor?: boolean; // Is recipient a doctor
  }): Promise<boolean> {
    const privacyBadge = data.isPrivateReply 
      ? '<span style="background-color: #dc3545; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; margin-left: 8px;">🔒 PRIVATE REPLY</span>' 
      : '';
    
    let privacyNote = '';
    if (data.isPrivateReply && data.isDoctor) {
      privacyNote = '<p style="color: #dc3545; font-size: 14px; margin-top: 10px;"><strong>Note:</strong> This is a private reply. Only you and the post author can see this reply. Other doctors cannot see your response.</p>';
    } else if (data.isPrivateReply) {
      privacyNote = '<p style="color: #dc3545; font-size: 14px; margin-top: 10px;"><strong>Note:</strong> This is a private reply from a doctor. Only you and the doctor can see this conversation.</p>';
    }
    
    return this.sendNotificationEmail({
      username: data.username,
      email: data.email,
      title: `New Reply to Your Comment${data.isPrivateReply ? ' (Private)' : ''}`,
      content: `${data.replierName} replied to your comment${privacyBadge}: "${data.replyPreview}"${privacyNote}`,
      actionUrl: data.postUrl,
      actionText: 'View Reply',
    });
  }

  /**
   * Send doctor verification approved email
   */
  async sendDoctorVerificationApproved(data: {
    username: string;
    email: string;
  }): Promise<boolean> {
    return this.sendNotificationEmail({
      username: data.username,
      email: data.email,
      title: 'Doctor Verification Approved',
      content: 'Congratulations! Your doctor verification has been approved. You can now access all doctor features on MedThread.',
      actionUrl: 'http://localhost:3000/dashboard/doctor',
      actionText: 'Go to Dashboard',
    });
  }

  /**
   * Send doctor verification rejected email
   */
  async sendDoctorVerificationRejected(data: {
    username: string;
    email: string;
    reason?: string;
  }): Promise<boolean> {
    return this.sendNotificationEmail({
      username: data.username,
      email: data.email,
      title: 'Doctor Verification Update',
      content: `Your doctor verification request has been reviewed. ${data.reason || 'Please contact support for more information.'}`,
      actionUrl: 'http://localhost:3000/doctor-verification',
      actionText: 'Resubmit Application',
    });
  }
}

export const emailService = new EmailService();
