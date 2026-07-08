const express = require('express');
const router = express.Router();
const { getEmployees, createEmployee, updateEmployee, deactivateEmployee } = require('../controllers/employeeController');
const { protect, protectAdmin } = require('../middleware/auth');

// All employee routes are Admin-only
router.use(protect);
router.use(protectAdmin);

router.route('/')
  .get(getEmployees)
  .post(createEmployee);

router.route('/:id')
  .put(updateEmployee)
  .delete(deactivateEmployee);

module.exports = router;
