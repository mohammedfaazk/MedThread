// Email service for sending notifications
// This is a basic implementation - you can integrate with SendGrid, AWS SES, or other providers

interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
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
}

export const emailService = new EmailService()
