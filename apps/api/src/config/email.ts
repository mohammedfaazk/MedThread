import nodemailer from 'nodemailer';

// Email configuration
export const EMAIL_CONFIG = {
  from: process.env.EMAIL_FROM || 'MedThread <noreply@medthread.com>',
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  user: process.env.EMAIL_USER || '',
  password: process.env.EMAIL_PASSWORD || '',
};

// Create transporter
export const createEmailTransporter = () => {
  // For development, use Ethereal (fake SMTP service)
  if (!EMAIL_CONFIG.user || !EMAIL_CONFIG.password) {
    console.log('⚠️  Email credentials not set. Using console logging for emails.');
    return null;
  }

  return nodemailer.createTransport({
    host: EMAIL_CONFIG.host,
    port: EMAIL_CONFIG.port,
    secure: EMAIL_CONFIG.secure,
    auth: {
      user: EMAIL_CONFIG.user,
      pass: EMAIL_CONFIG.password,
    },
    tls: {
      rejectUnauthorized: false, // Allow self-signed certificates
    },
  });
};

export const transporter = createEmailTransporter();
