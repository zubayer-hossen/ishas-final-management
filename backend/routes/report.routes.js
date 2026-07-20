const express = require('express');
const { param, query } = require('express-validator');
const reportController = require('../controllers/report.controller');
const validate = require('../middleware/validate');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

const STAFF_ROLES = ['owner', 'super_admin', 'admin', 'treasurer'];
const formatValidator = query('format')
  .optional()
  .isIn(['pdf', 'excel'])
  .withMessage('format অবশ্যই pdf অথবা excel হতে হবে');

router.use(protect, authorize(...STAFF_ROLES));

router.get('/financial', formatValidator, validate, reportController.financialReport);
router.get('/members', formatValidator, validate, reportController.membersReport);
router.get('/dues', formatValidator, validate, reportController.duesReport);
router.get(
  '/events/:id/attendance',
  param('id').isMongoId(),
  formatValidator,
  validate,
  reportController.eventAttendanceReport
);
router.get(
  '/meetings/:id/attendance',
  param('id').isMongoId(),
  formatValidator,
  validate,
  reportController.meetingAttendanceReport
);

module.exports = router;
