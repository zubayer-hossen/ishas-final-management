const { body, param } = require('express-validator');

const mongoIdParam = param('id').isMongoId().withMessage('অবৈধ ID');

const createBannerValidator = [
  body('title').trim().notEmpty().withMessage('শিরোনাম আবশ্যক').isLength({ max: 150 }),
  body('subtitle').optional({ checkFalsy: true }).trim().isLength({ max: 300 }),
  body('buttonText').optional({ checkFalsy: true }).trim().isLength({ max: 40 }),
  body('linkUrl').optional({ checkFalsy: true }).trim(),
  body('order').optional().isInt().withMessage('অবস্থান সংখ্যা হতে হবে'),
  body('isActive').optional().isBoolean(),
];

const updateBannerValidator = [
  mongoIdParam,
  body('title').optional({ checkFalsy: true }).trim().notEmpty().isLength({ max: 150 }),
  body('subtitle').optional({ checkFalsy: true }).trim().isLength({ max: 300 }),
  body('buttonText').optional({ checkFalsy: true }).trim().isLength({ max: 40 }),
  body('linkUrl').optional({ checkFalsy: true }).trim(),
  body('order').optional().isInt(),
  body('isActive').optional().isBoolean(),
];

module.exports = { mongoIdParam, createBannerValidator, updateBannerValidator };
