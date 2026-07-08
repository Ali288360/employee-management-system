const express = require('express');
const router = express.Router();
const { checkIn, checkOut, getTodayStatus, getHistory, getStats } = require('../controllers/attendanceController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/check-in', checkIn);
router.post('/check-out', checkOut);
router.get('/today', getTodayStatus);
router.get('/history', getHistory);
router.get('/stats', getStats);

module.exports = router;
