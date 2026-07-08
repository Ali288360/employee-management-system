const Payslip = require('../models/Payslip');
const Employee = require('../models/Employee');

/**
 * @desc    Generate a payslip
 * @route   POST /api/payslips
 * @access  Private/Admin
 */
const generatePayslip = async (req, res) => {
  const { employeeId, month, allowances, deductions } = req.body;

  if (!employeeId || !month) {
    return res.status(400).json({ message: 'Please provide employee profile ID and month' });
  }

  // month format validation (YYYY-MM)
  const monthRegex = /^\d{4}-\d{2}$/;
  if (!monthRegex.test(month)) {
    return res.status(400).json({ message: 'Month must be in YYYY-MM format' });
  }

  try {
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Check if payslip already exists for this month
    const payslipExists = await Payslip.findOne({ employee: employeeId, month });
    if (payslipExists) {
      return res.status(400).json({ message: `Payslip already generated for ${month}` });
    }

    const basicSalary = employee.salary;
    const allowanceVal = Number(allowances) || 0;
    const deductionVal = Number(deductions) || 0;
    const netSalary = basicSalary + allowanceVal - deductionVal;

    const payslip = await Payslip.create({
      employee: employeeId,
      month,
      basicSalary,
      allowances: allowanceVal,
      deductions: deductionVal,
      netSalary,
    });

    const populatedPayslip = await Payslip.findById(payslip._id).populate(
      'employee',
      'firstName lastName employeeId department designation salary'
    );

    res.status(201).json({
      message: 'Payslip generated successfully',
      payslip: populatedPayslip,
    });
  } catch (error) {
    console.error('Generate payslip error:', error);
    res.status(500).json({ message: 'Server error generating payslip' });
  }
};

/**
 * @desc    Get payslips list
 * @route   GET /api/payslips
 * @access  Private
 */
const getPayslips = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'employee') {
      query.employee = req.employee._id;
    }

    const payslips = await Payslip.find(query)
      .populate('employee', 'firstName lastName employeeId department designation')
      .sort({ month: -1 });

    res.json(payslips);
  } catch (error) {
    console.error('Get payslips error:', error);
    res.status(500).json({ message: 'Server error retrieving payslips list' });
  }
};

/**
 * @desc    Get details of a single payslip
 * @route   GET /api/payslips/:id
 * @access  Private
 */
const getPayslipById = async (req, res) => {
  try {
    const payslip = await Payslip.findById(req.params.id).populate(
      'employee',
      'firstName lastName employeeId department designation salary'
    );

    if (!payslip) {
      return res.status(404).json({ message: 'Payslip not found' });
    }

    // Authorization: Admin or Employee owner
    if (req.user.role === 'employee' && payslip.employee._id.toString() !== req.employee._id.toString()) {
      return res.status(403).json({ message: 'Access denied: cannot view another employee\'s payslip' });
    }

    res.json(payslip);
  } catch (error) {
    console.error('Get payslip by ID error:', error);
    res.status(500).json({ message: 'Server error retrieving payslip' });
  }
};

module.exports = {
  generatePayslip,
  getPayslips,
  getPayslipById,
};
