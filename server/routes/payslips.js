const express = require('express');
const router = express.Router();
const { generatePayslip, getPayslips, getPayslipById } = require('../controllers/payslipController');
const { protect, protectAdmin } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .post(protectAdmin, generatePayslip)
  .get(getPayslips);

router.route('/:id')
  .get(getPayslipById);

module.exports = router;
