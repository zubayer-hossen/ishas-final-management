const { body, param } = require('express-validator');
const Ticket = require('../models/Ticket');

const mongoIdParam = param('id').isMongoId().withMessage('অবৈধ ID');

const createTicketValidator = [
  body('subject').trim().notEmpty().withMessage('বিষয় আবশ্যক').isLength({ max: 200 }),
  body('description').trim().notEmpty().withMessage('বিস্তারিত আবশ্যক').isLength({ max: 3000 }),
  body('category').optional().isIn(Ticket.CATEGORIES).withMessage('অবৈধ ক্যাটাগরি'),
  body('priority').optional().isIn(Ticket.PRIORITIES).withMessage('অবৈধ অগ্রাধিকার'),
];

const addReplyValidator = [
  mongoIdParam,
  body('message').trim().notEmpty().withMessage('বার্তা খালি রাখা যাবে না').isLength({ max: 2000 }),
];

const updateStatusValidator = [
  mongoIdParam,
  body('status').isIn(Ticket.STATUSES).withMessage('অবৈধ স্ট্যাটাস'),
];

const assignTicketValidator = [
  mongoIdParam,
  body('assignedTo').optional({ nullable: true }).isMongoId().withMessage('অবৈধ সদস্য ID'),
];

const createFaqValidator = [
  body('question').trim().notEmpty().withMessage('প্রশ্ন আবশ্যক').isLength({ max: 300 }),
  body('answer').trim().notEmpty().withMessage('উত্তর আবশ্যক').isLength({ max: 2000 }),
  body('category').optional().trim(),
  body('order').optional().isInt(),
];

module.exports = {
  mongoIdParam,
  createTicketValidator,
  addReplyValidator,
  updateStatusValidator,
  assignTicketValidator,
  createFaqValidator,
};
