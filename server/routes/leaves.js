const express = require('express');
const router = express.Router();
const { applyLeave, getLeaves, reviewLeave } = require('../controllers/leaveController');
const { protect, protectAdmin } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .post(applyLeave)
  .get(getLeaves);

router.route('/:id')
  .patch(protectAdmin, reviewLeave);

module.exports = router;
