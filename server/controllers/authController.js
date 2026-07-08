const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Employee = require('../models/Employee');

/**
 * Generate JWT Token
 * @param {string} id - User ID
 * @returns {string} JWT Token
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecretkeyforemployeemanagementsystem', {
    expiresIn: '30d',
  });
};

/**
 * @desc    Auth user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  try {
    // Find user and select password (which is excluded by default)
    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
      const token = generateToken(user._id);

      // Set cookie options
      const cookieOptions = {
        httpOnly: true,
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      };

      res.cookie('token', token, cookieOptions);

      // If user is employee, fetch employee details
      let employee = null;
      if (user.role === 'employee') {
        employee = await Employee.findOne({ user: user._id });
      }

      res.json({
        user: {
          _id: user._id,
          email: user.email,
          role: user.role,
        },
        employee,
        token,
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

/**
 * @desc    Get current user session
 * @route   GET /api/auth/session
 * @access  Private
 */
const getSession = async (req, res) => {
  try {
    const user = {
      _id: req.user._id,
      email: req.user.email,
      role: req.user.role,
    };

    res.json({
      user,
      employee: req.employee || null,
    });
  } catch (error) {
    console.error('Session retrieve error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Logout user & clear cookie
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logoutUser = async (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
  res.json({ message: 'Logged out successfully' });
};

/**
 * @desc    Initial Admin Setup (Helper endpoint)
 * @route   POST /api/auth/setup
 * @access  Public
 */
const setupInitialAdmin = async (req, res) => {
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    if (adminExists) {
      return res.status(400).json({ message: 'Admin account already exists.' });
    }

    const admin = await User.create({
      email: 'admin@ems.com',
      password: 'adminpassword123',
      role: 'admin',
    });

    res.status(201).json({
      message: 'Initial admin account created successfully',
      email: 'admin@ems.com',
      password: 'adminpassword123',
    });
  } catch (error) {
    console.error('Setup admin error:', error);
    res.status(500).json({ message: 'Server error during setup' });
  }
};

/**
 * @desc    Change user password
 * @route   POST /api/auth/change-password
 * @access  Private
 */
const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Please provide current and new password' });
  }

  try {
    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Send test email
 * @route   POST /api/auth/test-email
 * @access  Private
 */
const testEmail = async (req, res) => {
  const { email } = req.body;
  const { sendMailHelper } = require('../inngest/nodemailer');

  if (!email) {
    return res.status(400).json({ message: 'Email address is required' });
  }

  try {
    const subject = "Attendance Reminder — Please Mark Your Attendance";
    const textBody = `Hi Test User, 👋\n\nWe noticed you haven't marked your attendance yet today.\n\nThe deadline was 11:30 AM and your attendance is still missing.\n\nPlease check in as soon as possible or contact your admin if you're facing any issues.\n\nDepartment: Marketing\n\nBest Regards,\nQuickEMS`;
    const htmlBody = `
      <div style="font-family: sans-serif; color: #1e293b; max-width: 600px; line-height: 1.6;">
        <p style="font-size: 16px; font-weight: bold; margin-bottom: 20px;">Hi Test User, 👋</p>
        <p>We noticed you haven't marked your attendance yet today.</p>
        <p>The deadline was <strong>11:30 AM</strong> and your attendance is still missing.</p>
        <p>Please check in as soon as possible or contact your admin if you're facing any issues.</p>
        <br />
        <p style="margin: 0; color: #64748b;">Department: Marketing</p>
        <br />
        <p style="margin: 0; font-weight: bold;">Best Regards,</p>
        <p style="margin: 0; font-weight: bold; color: #4f46e5;">QuickEMS</p>
      </div>
    `;

    const info = await sendMailHelper(email, subject, textBody, htmlBody);

    if (info.messageId === 'console-log-only') {
      return res.status(400).json({ 
        message: 'SMTP credentials are not configured. Please edit server/.env with your SMTP keys.'
      });
    }

    if (info.error) {
      return res.status(500).json({ 
        message: `SMTP Dispatch failed: ${info.error}. Please verify keys in server/.env file.`
      });
    }

    res.json({ 
      message: `Test email sent successfully to ${email}`, 
      messageId: info.messageId 
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to send test email', error: err.message });
  }
};

module.exports = {
  loginUser,
  getSession,
  logoutUser,
  setupInitialAdmin,
  changePassword,
  testEmail,
};

