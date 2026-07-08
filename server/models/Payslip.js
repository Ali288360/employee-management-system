const mongoose = require('mongoose');

const payslipSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    month: {
      type: String, // format YYYY-MM
      required: true,
    },
    basicSalary: {
      type: Number,
      required: true,
    },
    allowances: {
      type: Number,
      default: 0,
    },
    deductions: {
      type: Number,
      default: 0,
    },
    netSalary: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['Paid', 'Unpaid'],
      default: 'Paid',
    },
    generatedOn: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure only one payslip is generated per employee per month
payslipSchema.index({ employee: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('Payslip', payslipSchema);
