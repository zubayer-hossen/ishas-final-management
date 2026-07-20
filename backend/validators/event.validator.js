const { body, param } = require('express-validator');
const Event = require('../models/Event');

const mongoIdParam = param('id').isMongoId().withMessage('অবৈধ ID');

const createEventValidator = [
  body('title').trim().notEmpty().withMessage('শিরোনাম আবশ্যক').isLength({ max: 200 }),
  body('description').trim().notEmpty().withMessage('বিবরণ আবশ্যক'),
  body('category').optional().isIn(Event.CATEGORIES).withMessage('অবৈধ ক্যাটাগরি'),
  body('startDate').isISO8601().withMessage('সঠিক শুরুর তারিখ দিন'),
  body('endDate').isISO8601().withMessage('সঠিক শেষের তারিখ দিন'),
  body('registrationRequired').optional().isBoolean(),
  body('registrationDeadline').optional().isISO8601(),
  body('maxParticipants').optional().isInt({ min: 1 }).withMessage('সঠিক সংখ্যা দিন'),
];

const updateEventValidator = [
  mongoIdParam,
  body('title').optional().trim().notEmpty().isLength({ max: 200 }),
  body('description').optional().trim().notEmpty(),
  body('category').optional().isIn(Event.CATEGORIES),
  body('startDate').optional().isISO8601(),
  body('endDate').optional().isISO8601(),
  body('registrationRequired').optional().isBoolean(),
  body('registrationDeadline').optional().isISO8601(),
  body('maxParticipants').optional().isInt({ min: 1 }),
  body('isActive').optional().isBoolean(),
];

const registerValidator = [mongoIdParam, body('isVolunteer').optional().isBoolean()];

const markAttendanceValidator = [mongoIdParam, body('qrCode').notEmpty().withMessage('QR কোড আবশ্যক')];

module.exports = {
  mongoIdParam,
  createEventValidator,
  updateEventValidator,
  registerValidator,
  markAttendanceValidator,
};
