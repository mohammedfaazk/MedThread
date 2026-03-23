#!/usr/bin/env node

/**
 * Test Email System
 * Run this script to verify email configuration
 */

const nodemailer = require('nodemailer');

async function testEmailSystem() {
  console.log('📧 Testing email system...\n');

  // Create transporter
  const transporter = nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  try {
    // Verify connection
    console.log('Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection successful\n');

    // Send test email
    console.log('Sending test email...');
    const info = await transporter.sendMail({
      from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
      to: process.env.TEST_EMAIL || 'test@example.com',
      subject: 'MedThread - Email System Test',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #FF8C42;">🎉 Email System Working!</h1>
          <p>Your MedThread email system is configured correctly.</p>
          <p>This is a test email to verify that:</p>
          <ul>
            <li>✅ SMTP connection is working</li>
            <li>✅ Email sending is functional</li>
            <li>✅ Templates are rendering correctly</li>
          </ul>
          <p>You're ready to send notifications to users!</p>
          <hr style="border: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">
            This is an automated test email from MedThread.
          </p>
        </div>
      `
    });

    console.log('✅ Test email sent successfully!');
    console.log(`Message ID: ${info.messageId}\n`);
    console.log('📋 Email Configuration:');
    console.log(`Host: ${process.env.SMTP_HOST}`);
    console.log(`Port: ${process.env.SMTP_PORT}`);
    console.log(`From: ${process.env.FROM_EMAIL}`);
    console.log('\n✅ Email system is ready!');

  } catch (error) {
    console.error('❌ Email system error:', error.message);
    console.log('\n📋 Troubleshooting:');
    console.log('1. Check SMTP credentials in .env');
    console.log('2. Verify sender email is verified');
    console.log('3. Check firewall/network settings');
    console.log('4. Try different SMTP port (587 or 465)');
    process.exit(1);
  }
}

// Run test
testEmailSystem();
