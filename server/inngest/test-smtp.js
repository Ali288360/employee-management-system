const nodemailer = require('nodemailer');
require('dotenv').config({ path: '../.env' });

console.log('Testing SMTP connection with:');
console.log('HOST:', process.env.EMAIL_HOST);
console.log('PORT:', process.env.EMAIL_PORT);
console.log('USER:', process.env.EMAIL_USER);
console.log('PASS LENGTH:', process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 0);

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // STARTTLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  debug: true, // Show SMTP traffic
  logger: true, // Log to console
});

transporter.verify((error, success) => {
  if (error) {
    console.error('Verify failed:', error);
  } else {
    console.log('Server is ready to take our messages');
  }
  process.exit();
});
