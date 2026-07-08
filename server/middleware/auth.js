const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Employee = require('../models/Employee');

/**
 * Protect routes by verifying JWT in authorization header or cookies
 */
const protect = async (req, res, next) => {
  let token;

  // Read token from cookie or Authorization header
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkeyforemployeemanagementsystem');

    // Get user from database (excluding password)
    const user = await User.findById(decoded.id).select('+role');
    if (!user) {
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }

    req.user = user;

    // If user is an employee, fetch and attach the corresponding Employee model
    if (user.role === 'employee') {
      const employee = await Employee.findOne({ user: user._id });
      if (!employee) {
        return res.status(404).json({ message: 'Employee profile not found' });
      }
      if (employee.status !== 'active') {
        return res.status(403).json({ message: 'Employee account is deactivated' });
      }
      req.employee = employee;
    }

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ message: 'Not authorized, token validation failed' });
  }
};

/**
 * Limit route access to Admins only
 */
const protectAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ message: 'Access denied: Admin authorization required' });
  }
};

module.exports = {
  protect,
  protectAdmin,
};
