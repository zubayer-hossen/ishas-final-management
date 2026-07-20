const express = require('express');
const { body } = require('express-validator');
const settingsController = require('../controllers/settings.controller');
const validate = require('../middleware/validate');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);

router.get('/', settingsController.getSettings);
router.patch(
  '/',
  authorize('owner'),
  [
    body('orgName').optional().trim().notEmpty(),
    body('currency').optional().trim().notEmpty(),
    body('monthlyChadaAmount').optional().isFloat({ min: 0 }).withMessage('সঠিক পরিমাণ দিন'),
  ],
  validate,
  settingsController.updateSettings
);

module.exports = router;
