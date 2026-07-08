const mongoose = require('mongoose');

const leaveApplicationSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    startDate: {
      type: Date,
      required: [true, 'Please provide a start date'],
    },
    endDate: {
      type: Date,
      required: [true, 'Please provide an end date'],
    },
    type: {
      type: String,
      enum: ['Casual', 'Sick', 'Maternity/Paternity', 'LOP'],
      required: [true, 'Please specify the type of leave'],
    },
    reason: {
      type: String,
      required: [true, 'Please provide a reason for the leave'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
    appliedOn: {
      type: Date,
      default: Date.now,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // The Admin user who approved or rejected the leave
    },
    rejectionReason: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('LeaveApplication', leaveApplicationSchema);
