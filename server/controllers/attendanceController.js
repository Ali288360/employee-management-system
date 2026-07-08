const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');

/**
 * @desc    Record check-in
 * @route   POST /api/attendance/check-in
 * @access  Private (Employee)
 */
const checkIn = async (req, res) => {
  if (req.user.role !== 'employee') {
    return res.status(403).json({ message: 'Only employees can check in' });
  }

  const todayStr = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD format

  try {
    // Check if check-in already exists for today
    let attendance = await Attendance.findOne({
      employee: req.employee._id,
      date: todayStr,
    });

    if (attendance) {
      return res.status(400).json({ message: 'Already checked in for today' });
    }

    // Determine status (Late if check-in is after 9:15 AM)
    const checkInTime = new Date();
    let status = 'Present';
    
    // 9:15 AM threshold
    const cutOff = new Date();
    cutOff.setHours(9, 15, 0, 0);

    if (checkInTime > cutOff) {
      status = 'Late';
    }

    attendance = await Attendance.create({
      employee: req.employee._id,
      date: todayStr,
      checkIn: checkInTime,
      status,
    });

    res.status(201).json({
      message: 'Checked in successfully',
      attendance,
    });
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({ message: 'Server error during check-in' });
  }
};

/**
 * @desc    Record check-out
 * @route   POST /api/attendance/check-out
 * @access  Private (Employee)
 */
const checkOut = async (req, res) => {
  if (req.user.role !== 'employee') {
    return res.status(403).json({ message: 'Only employees can check out' });
  }

  const todayStr = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD

  try {
    let attendance = await Attendance.findOne({
      employee: req.employee._id,
      date: todayStr,
    });

    if (!attendance) {
      return res.status(400).json({ message: 'Please check in first' });
    }

    if (attendance.checkOut) {
      return res.status(400).json({ message: 'Already checked out for today' });
    }

    attendance.checkOut = new Date();
    
    // Check work hours: if less than 4 hours, mark as Half-Day
    const diffMs = attendance.checkOut - attendance.checkIn;
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours < 4) {
      attendance.status = 'Half-Day';
    }

    await attendance.save();

    res.json({
      message: 'Checked out successfully',
      attendance,
    });
  } catch (error) {
    console.error('Check-out error:', error);
    res.status(500).json({ message: 'Server error during check-out' });
  }
};

/**
 * @desc    Get today's check-in/out status
 * @route   GET /api/attendance/today
 * @access  Private (Employee)
 */
const getTodayStatus = async (req, res) => {
  if (req.user.role !== 'employee') {
    return res.status(403).json({ message: 'Only employees can retrieve daily check-in status' });
  }

  const todayStr = new Date().toLocaleDateString('en-CA');

  try {
    const attendance = await Attendance.findOne({
      employee: req.employee._id,
      date: todayStr,
    });

    res.json({
      checkedIn: !!attendance,
      checkedOut: attendance ? !!attendance.checkOut : false,
      attendance: attendance || null,
    });
  } catch (error) {
    console.error('Retrieve today status error:', error);
    res.status(500).json({ message: 'Server error retrieving today status' });
  }
};

/**
 * @desc    Get attendance history
 * @route   GET /api/attendance/history
 * @access  Private
 */
const getHistory = async (req, res) => {
  try {
    let query = {};

    // If Employee, restrict to their own records. If Admin, show all.
    if (req.user.role === 'employee') {
      query.employee = req.employee._id;
    }

    const history = await Attendance.find(query)
      .populate('employee', 'firstName lastName employeeId department designation')
      .sort({ date: -1 });

    res.json(history);
  } catch (error) {
    console.error('Get attendance history error:', error);
    res.status(500).json({ message: 'Server error retrieving history' });
  }
};

/**
 * @desc    Get attendance stats (Present, Late, Absent, Half-Day counts)
 * @route   GET /api/attendance/stats
 * @access  Private
 */
const getStats = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'employee') {
      query.employee = req.employee._id;
    }

    const attendanceRecords = await Attendance.find(query);

    const stats = {
      Present: 0,
      Late: 0,
      'Half-Day': 0,
      Absent: 0, // In standard practice, we could pull absent days as total work days - present records, but here we count records marked as Absent
    };

    attendanceRecords.forEach((record) => {
      if (stats[record.status] !== undefined) {
        stats[record.status]++;
      }
    });

    res.json({
      totalDays: attendanceRecords.length,
      stats,
    });
  } catch (error) {
    console.error('Get attendance stats error:', error);
    res.status(500).json({ message: 'Server error calculating stats' });
  }
};

module.exports = {
  checkIn,
  checkOut,
  getTodayStatus,
  getHistory,
  getStats,
};
