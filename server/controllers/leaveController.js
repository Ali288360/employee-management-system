const LeaveApplication = require('../models/LeaveApplication');
const { inngest } = require('../inngest/client');

/**
 * @desc    Apply for leave
 * @route   POST /api/leaves
 * @access  Private (Employee)
 */
const applyLeave = async (req, res) => {
  if (req.user.role !== 'employee') {
    return res.status(403).json({ message: 'Only employees can apply for leaves' });
  }

  const { startDate, endDate, type, reason } = req.body;

  if (!startDate || !endDate || !type || !reason) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }

  try {
    const leave = await LeaveApplication.create({
      employee: req.employee._id,
      startDate,
      endDate,
      type,
      reason,
    });

    // Populate employee details for response
    const populatedLeave = await LeaveApplication.findById(leave._id).populate(
      'employee',
      'firstName lastName employeeId department designation'
    );

    // Send event to Inngest for leave application alert (e.g. to admin or logging)
    try {
      await inngest.send({
        name: 'ems/leave.applied',
        data: {
          leaveId: leave._id,
          employeeName: req.employee.fullName || `${req.employee.firstName} ${req.employee.lastName}`,
          startDate,
          endDate,
          type,
          reason,
        },
      });
    } catch (err) {
      console.error('Failed to send Inngest ems/leave.applied event:', err.message);
    }

    res.status(201).json({
      message: 'Leave application submitted successfully',
      leave: populatedLeave,
    });
  } catch (error) {
    console.error('Apply leave error:', error);
    res.status(500).json({ message: 'Server error applying for leave' });
  }
};

/**
 * @desc    Get leave applications history
 * @route   GET /api/leaves
 * @access  Private
 */
const getLeaves = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'employee') {
      query.employee = req.employee._id;
    }

    const leaves = await LeaveApplication.find(query)
      .populate('employee', 'firstName lastName employeeId department designation')
      .populate('reviewedBy', 'email')
      .sort({ appliedOn: -1 });

    res.json(leaves);
  } catch (error) {
    console.error('Get leaves history error:', error);
    res.status(500).json({ message: 'Server error retrieving leaves history' });
  }
};

/**
 * @desc    Approve or Reject leave application
 * @route   PATCH /api/leaves/:id
 * @access  Private/Admin
 */
const reviewLeave = async (req, res) => {
  const { status, rejectionReason } = req.body;

  if (!status || !['Approved', 'Rejected'].includes(status)) {
    return res.status(400).json({ message: 'Please specify a valid status (Approved or Rejected)' });
  }

  try {
    const leave = await LeaveApplication.findById(req.params.id).populate({
      path: 'employee',
      populate: { path: 'user', select: 'email' },
    });

    if (!leave) {
      return res.status(404).json({ message: 'Leave application not found' });
    }

    if (leave.status !== 'Pending') {
      return res.status(400).json({ message: `Leave has already been reviewed and is ${leave.status}` });
    }

    leave.status = status;
    leave.reviewedBy = req.user._id;
    if (status === 'Rejected' && rejectionReason) {
      leave.rejectionReason = rejectionReason;
    }

    await leave.save();

    // Send event to Inngest to notify the employee via email
    try {
      await inngest.send({
        name: 'ems/leave.status.updated',
        data: {
          leaveId: leave._id,
          employeeEmail: leave.employee.user.email,
          employeeName: `${leave.employee.firstName} ${leave.employee.lastName}`,
          status: leave.status,
          startDate: leave.startDate,
          endDate: leave.endDate,
          type: leave.type,
          rejectionReason: leave.rejectionReason || '',
        },
      });
    } catch (err) {
      console.error('Failed to send Inngest ems/leave.status.updated event:', err.message);
    }

    res.json({
      message: `Leave application status updated to ${status}`,
      leave,
    });
  } catch (error) {
    console.error('Review leave error:', error);
    res.status(500).json({ message: 'Server error reviewing leave application' });
  }
};

module.exports = {
  applyLeave,
  getLeaves,
  reviewLeave,
};
