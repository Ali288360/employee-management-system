const express = require('express');
const router = express.Router();
const { loginUser, getSession, logoutUser, setupInitialAdmin, changePassword, testEmail } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/login', loginUser);
router.get('/session', protect, getSession);
router.post('/logout', protect, logoutUser);
router.post('/setup', setupInitialAdmin);
router.post('/change-password', protect, changePassword);
router.post('/test-email', protect, testEmail);

module.exports = router;
