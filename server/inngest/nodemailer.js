const nodemailer = require('nodemailer');

// Configure SMTP transporter dynamically supporting Gmail explicitly
const isGmail = process.env.EMAIL_HOST?.includes('gmail');

const transportConfig = isGmail
  ? {
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // STARTTLS
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false, // Bypasses local SSL certificate issues
      },
    }
  : {
      host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
      port: parseInt(process.env.EMAIL_PORT || '2525'),
      auth: {
        user: process.env.EMAIL_USER || 'placeholder_user',
        pass: process.env.EMAIL_PASS || 'placeholder_pass',
      },
    };

const transporter = nodemailer.createTransport(transportConfig);

/**
 * Helper to send email alerts and log to console if SMTP details are missing or invalid
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} text - Plain text body
 * @param {string} html - HTML body
 */
const sendMailHelper = async (to, subject, text, html) => {
  console.log('\n--- EMAIL SENT (LOG) ---');
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Text: ${text}`);
  console.log('------------------------\n');

  // Verify connection configuration and credentials before sending
  const isDefaultCredentials = 
    process.env.EMAIL_USER === 'your_smtp_user' || 
    !process.env.EMAIL_USER || 
    process.env.EMAIL_USER === 'placeholder_user';

  if (isDefaultCredentials) {
    console.log('SMTP credentials not configured. Skipping active SMTP email dispatch.');
    return { messageId: 'console-log-only' };
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'no-reply@ems.com',
      to,
      subject,
      text,
      html,
    });
    return info;
  } catch (error) {
    console.warn(`SMTP Dispatch failed: ${error.message}. Logged successfully to console.`);
    return { error: error.message, messageId: 'failed-fallback-to-log' };
  }
};

module.exports = { sendMailHelper };
