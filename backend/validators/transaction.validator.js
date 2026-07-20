const { body, param } = require('express-validator');
const Transaction = require('../models/Transaction');

const createTransactionValidator = [
  body('type').isIn(['income', 'expense']).withMessage('type অবশ্যই income অথবা expense হতে হবে'),
  body('category').isIn(Transaction.CATEGORIES).withMessage('অবৈধ ক্যাটাগরি'),
  body('amount').isFloat({ min: 1 }).withMessage('সঠিক পরিমাণ দিন'),
  body('memberId').optional().isMongoId().withMessage('অবৈধ সদস্য ID'),
  body('month')
    .optional()
    .matches(/^\d{4}-(0[1-9]|1[0-2])$/)
    .withMessage('মাস অবশ্যই YYYY-MM ফরম্যাটে হতে হবে'),
  body('paymentMethod').optional().isIn(Transaction.PAYMENT_METHODS).withMessage('অবৈধ পেমেন্ট মাধ্যম'),
  body('date').optional().isISO8601().withMessage('সঠিক তারিখ দিন'),
];

const voidTransactionValidator = [
  param('id').isMongoId().withMessage('অবৈধ ID'),
  body('reason').optional().trim().isLength({ max: 300 }),
];

const mongoIdParam = param('id').isMongoId().withMessage('অবৈধ ID');
const memberIdParam = param('memberId').isMongoId().withMessage('অবৈধ সদস্য ID');

module.exports = {
  createTransactionValidator,
  voidTransactionValidator,
  mongoIdParam,
  memberIdParam,
};
