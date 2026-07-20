const { body, param } = require('express-validator');

const mongoIdParam = param('id').isMongoId().withMessage('অবৈধ ID');

const createAlbumValidator = [
  body('title').trim().notEmpty().withMessage('অ্যালবামের শিরোনাম আবশ্যক').isLength({ max: 150 }),
  body('description').optional().trim().isLength({ max: 1000 }),
];

const addVideoValidator = [
  mongoIdParam,
  body('url').trim().isURL().withMessage('সঠিক ভিডিও URL দিন'),
  body('title').optional().trim().isLength({ max: 150 }),
  body('thumbnailUrl').optional().trim().isURL(),
];

module.exports = { mongoIdParam, createAlbumValidator, addVideoValidator };
