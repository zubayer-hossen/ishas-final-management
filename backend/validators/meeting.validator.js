const { body, param } = require('express-validator');

const mongoIdParam = param('id').isMongoId().withMessage('অবৈধ ID');

const createMeetingValidator = [
  body('title').trim().notEmpty().withMessage('মিটিং শিরোনাম আবশ্যক').isLength({ max: 200 }),
  body('scheduledStart').isISO8601().withMessage('সঠিক শুরুর সময় দিন'),
  body('scheduledEnd').isISO8601().withMessage('সঠিক শেষের সময় দিন'),
  body('password').optional().isLength({ min: 4 }).withMessage('পাসওয়ার্ড কমপক্ষে ৪ ক্যারেক্টার হতে হবে'),
  body('waitingRoomEnabled').optional().isBoolean(),
  body('allowChat').optional().isBoolean(),
  body('allowScreenShare').optional().isBoolean(),
  body('muteOnEntry').optional().isBoolean(),
  body('inviteMemberIds').optional().isArray(),
  body('inviteMemberIds.*').optional().isMongoId(),
  body('notifyAllActiveMembers').optional().isBoolean(),
];

const updateMeetingValidator = [
  mongoIdParam,
  body('title').optional().trim().notEmpty().isLength({ max: 200 }),
  body('scheduledStart').optional().isISO8601(),
  body('scheduledEnd').optional().isISO8601(),
  body('password').optional(),
  body('waitingRoomEnabled').optional().isBoolean(),
  body('allowChat').optional().isBoolean(),
  body('allowScreenShare').optional().isBoolean(),
  body('muteOnEntry').optional().isBoolean(),
];

const verifyJoinValidator = [mongoIdParam, body('password').optional()];

module.exports = { mongoIdParam, createMeetingValidator, updateMeetingValidator, verifyJoinValidator };
