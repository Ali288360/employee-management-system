const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    firstName: {
      type: String,
      required: [true, 'Please provide a first name'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Please provide a last name'],
      trim: true,
    },
    employeeId: {
      type: String,
      required: [true, 'Please provide an employee ID'],
      unique: true,
      trim: true,
    },
    department: {
      type: String,
      required: [true, 'Please provide a department'],
      trim: true,
    },
    designation: {
      type: String,
      required: [true, 'Please provide a designation'],
      trim: true,
    },
    salary: {
      type: Number,
      required: [true, 'Please provide a salary amount'],
    },
    joiningDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for full name
employeeSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

module.exports = mongoose.model('Employee', employeeSchema);
