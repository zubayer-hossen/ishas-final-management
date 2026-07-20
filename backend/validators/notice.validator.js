const { body, param } = require('express-validator');
const Notice = require('../models/Notice');
const User = require('../models/User');

const createNoticeValidator = [
  body('title').trim().notEmpty().withMessage('শিরোনাম আবশ্যক').isLength({ max: 200 }),
  body('content').trim().notEmpty().withMessage('বিস্তারিত আবশ্যক'),
  body('category').optional().isIn(Notice.CATEGORIES).withMessage('অবৈধ ক্যাটাগরি'),
  body('isPinned').optional().isBoolean(),
  body('sendEmailNotification').optional().isBoolean(),
  body('targetRoles').optional().isArray().withMessage('targetRoles অবশ্যই array হতে হবে'),
  body('targetRoles.*').optional().isIn(User.ROLES),
];

const updateNoticeValidator = [
  param('id').isMongoId().withMessage('অবৈধ ID'),
  body('title').optional().trim().notEmpty().isLength({ max: 200 }),
  body('content').optional().trim().notEmpty(),
  body('category').optional().isIn(Notice.CATEGORIES),
  body('isPinned').optional().isBoolean(),
  body('targetRoles').optional().isArray(),
];

const mongoIdParam = param('id').isMongoId().withMessage('অবৈধ ID');

module.exports = { createNoticeValidator, updateNoticeValidator, mongoIdParam };
