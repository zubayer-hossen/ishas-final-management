const { body, param } = require('express-validator');
const Committee = require('../models/Committee');

const createCommitteeValidator = [
  body('name').trim().notEmpty().withMessage('কমিটির নাম আবশ্যক'),
  body('termYear').trim().notEmpty().withMessage('মেয়াদকাল আবশ্যক'),
  body('description').optional().trim().isLength({ max: 1000 }),
];

const updateCommitteeValidator = [
  param('id').isMongoId().withMessage('অবৈধ ID'),
  body('name').optional().trim().notEmpty(),
  body('termYear').optional().trim().notEmpty(),
  body('description').optional().trim().isLength({ max: 1000 }),
  body('isActive').optional().isBoolean(),
];

const addMemberValidator = [
  param('id').isMongoId().withMessage('অবৈধ ID'),
  body('userId').isMongoId().withMessage('অবৈধ সদস্য ID'),
  body('position').isIn(Committee.POSITIONS).withMessage('অবৈধ পদ'),
];

module.exports = { createCommitteeValidator, updateCommitteeValidator, addMemberValidator };
