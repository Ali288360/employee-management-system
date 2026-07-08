const mongoose = require('mongoose');
const User = require('../models/User');
const Employee = require('../models/Employee');

/**
 * @desc    Get all employees
 * @route   GET /api/employees
 * @access  Private/Admin
 */
const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find({}).populate('user', 'email role');
    res.json(employees);
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({ message: 'Server error retrieving employees list' });
  }
};

/**
 * @desc    Create new employee (User + Employee record)
 * @route   POST /api/employees
 * @access  Private/Admin
 */
const createEmployee = async (req, res) => {
  const {
    email,
    password,
    firstName,
    lastName,
    employeeId,
    department,
    designation,
    salary,
    phoneNumber,
    joiningDate,
  } = req.body;

  if (
    !email ||
    !password ||
    !firstName ||
    !lastName ||
    !employeeId ||
    !department ||
    !designation ||
    !salary
  ) {
    return res.status(400).json({ message: 'Please enter all required fields' });
  }

  // Pre-validate unique constraints to prevent partial writes
  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const empIdExists = await Employee.findOne({ employeeId });
    if (empIdExists) {
      return res.status(400).json({ message: 'Employee with this ID already exists' });
    }
  } catch (err) {
    console.error('Unique checks fail:', err);
    return res.status(500).json({ message: 'Server database check error' });
  }

  let session = null;
  let useTransactions = false;
  try {
    const hello = await mongoose.connection.db.command({ hello: 1 });
    useTransactions = !!hello.setName;
    if (useTransactions) {
      session = await mongoose.startSession();
      session.startTransaction();
    }
  } catch (err) {
    useTransactions = false;
  }

  try {
    let user, employee;

    if (useTransactions && session) {
      const userCreated = await User.create([{ email, password, role: 'employee' }], { session });
      const employeeCreated = await Employee.create(
        [
          {
            user: userCreated[0]._id,
            firstName,
            lastName,
            employeeId,
            department,
            designation,
            salary,
            phoneNumber,
            joiningDate: joiningDate || new Date(),
          },
        ],
        { session }
      );

      await session.commitTransaction();
      session.endSession();

      user = userCreated[0];
      employee = employeeCreated[0];
    } else {
      // Standalone execution without transaction session
      user = await User.create({ email, password, role: 'employee' });
      try {
        employee = await Employee.create({
          user: user._id,
          firstName,
          lastName,
          employeeId,
          department,
          designation,
          salary,
          phoneNumber,
          joiningDate: joiningDate || new Date(),
        });
      } catch (empErr) {
        // If employee creation fails, roll back user creation manually
        await User.findByIdAndDelete(user._id);
        throw empErr;
      }
    }

    res.status(201).json({
      message: 'Employee created successfully',
      employee,
    });
  } catch (error) {
    if (useTransactions && session) {
      await session.abortTransaction();
      session.endSession();
    }
    console.error('Create employee error:', error);
    res.status(500).json({ message: 'Server error creating employee record' });
  }
};

/**
 * @desc    Update employee details
 * @route   PUT /api/employees/:id
 * @access  Private/Admin
 */
const updateEmployee = async (req, res) => {
  const {
    email,
    firstName,
    lastName,
    department,
    designation,
    salary,
    phoneNumber,
    status,
  } = req.body;

  try {
    let employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee profile not found' });
    }

    // Update Employee document
    employee.firstName = firstName || employee.firstName;
    employee.lastName = lastName || employee.lastName;
    employee.department = department || employee.department;
    employee.designation = designation || employee.designation;
    employee.salary = salary !== undefined ? salary : employee.salary;
    employee.phoneNumber = phoneNumber !== undefined ? phoneNumber : employee.phoneNumber;
    employee.status = status || employee.status;

    await employee.save();

    // If email is changing, update the linked User
    if (email && email !== req.body.oldEmail) {
      const user = await User.findById(employee.user);
      if (user) {
        // Check if email already in use by someone else
        const emailExists = await User.findOne({ email, _id: { $ne: user._id } });
        if (emailExists) {
          return res.status(400).json({ message: 'Email already in use by another user' });
        }
        user.email = email;
        await user.save();
      }
    }

    const updatedEmployee = await Employee.findById(req.params.id).populate('user', 'email role');
    res.json({
      message: 'Employee updated successfully',
      employee: updatedEmployee,
    });
  } catch (error) {
    console.error('Update employee error:', error);
    res.status(500).json({ message: 'Server error updating employee details' });
  }
};

/**
 * @desc    Deactivate employee (set status to inactive)
 * @route   DELETE /api/employees/:id
 * @access  Private/Admin
 */
const deactivateEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    employee.status = 'inactive';
    await employee.save();

    res.json({ message: 'Employee account deactivated successfully' });
  } catch (error) {
    console.error('Deactivate employee error:', error);
    res.status(500).json({ message: 'Server error deactivating employee' });
  }
};

module.exports = {
  getEmployees,
  createEmployee,
  updateEmployee,
  deactivateEmployee,
};
