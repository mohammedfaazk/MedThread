"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailService = exports.EmailService = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const email_1 = require("../config/email");
class EmailService {
    constructor() {
        this.templatesPath = path_1.default.join(__dirname, '../templates/email');
    }
    /**
     * Load email template
     */
    loadTemplate(templateName) {
        const templatePath = path_1.default.join(this.templatesPath, `${templateName}.html`);
        return fs_1.default.readFileSync(templatePath, 'utf-8');
    }
    /**
     * Replace template variables
     */
    replaceVariables(template, data) {
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
    async sendEmail(options) {
        try {
            if (!email_1.transporter) {
                // Log to console if no transporter configured
                console.log('\n📧 EMAIL (Console Mode):');
                console.log('To:', options.to);
                console.log('Subject:', options.subject);
                console.log('Content:', options.text || 'HTML email');
                console.log('---\n');
                return true;
            }
            await email_1.transporter.sendMail({
                from: email_1.EMAIL_CONFIG.from,
                to: options.to,
                subject: options.subject,
                html: options.html,
                text: options.text,
            });
            console.log(`✅ Email sent to ${options.to}: ${options.subject}`);
            return true;
        }
        catch (error) {
            console.error('❌ Failed to send email:', error);
            return false;
        }
    }
    /**
     * Send welcome email
     */
    async sendWelcomeEmail(data) {
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
    async sendVerificationEmail(data) {
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
    async sendPasswordResetEmail(data) {
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
    async sendAppointmentReminder(data) {
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
    async sendNotificationEmail(data) {
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
    async sendNewCommentNotification(data) {
        return this.sendNotificationEmail({
            username: data.username,
            email: data.email,
            title: 'New Comment on Your Post',
            content: `${data.commenterName} commented on your post "${data.postTitle}": "${data.commentPreview}"`,
            actionUrl: data.postUrl,
            actionText: 'View Comment',
        });
    }
    /**
     * Send new reply notification
     */
    async sendNewReplyNotification(data) {
        return this.sendNotificationEmail({
            username: data.username,
            email: data.email,
            title: 'New Reply to Your Comment',
            content: `${data.replierName} replied to your comment: "${data.replyPreview}"`,
            actionUrl: data.postUrl,
            actionText: 'View Reply',
        });
    }
    /**
     * Send doctor verification approved email
     */
    async sendDoctorVerificationApproved(data) {
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
    async sendDoctorVerificationRejected(data) {
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
exports.EmailService = EmailService;
exports.emailService = new EmailService();
