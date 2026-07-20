const { body, param } = require('express-validator');
const User = require('../models/User');

const mongoIdParam = param('id').isMongoId().withMessage('অবৈধ ID');

const updateRoleValidator = [
  mongoIdParam,
  body('role').isIn(User.ROLES).withMessage('অবৈধ রোল'),
];

const updateStatusValidator = [
  mongoIdParam,
  body('status').isIn(User.MEMBERSHIP_STATUS).withMessage('অবৈধ স্ট্যাটাস'),
];

const rejectMemberValidator = [mongoIdParam, body('reason').optional().trim().isLength({ max: 300 })];

const updateProfileValidator = [
  body('fullName').optional().trim().isLength({ max: 100 }),
  body('phone').optional().trim().isMobilePhone('any').withMessage('সঠিক ফোন নম্বর দিন'),
  body('bloodGroup').optional().trim(),
  body('dateOfBirth').optional().isISO8601().withMessage('সঠিক তারিখ দিন'),
  body('gender').optional().isIn(['male', 'female', 'other']),
  body('occupation').optional().trim().isLength({ max: 150 }),
  body('education').optional().trim().isLength({ max: 150 }),
];

module.exports = {
  mongoIdParam,
  updateRoleValidator,
  updateStatusValidator,
  rejectMemberValidator,
  updateProfileValidator,
};
