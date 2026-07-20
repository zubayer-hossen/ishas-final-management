const { body, param } = require('express-validator');
const Blog = require('../models/Blog');

const mongoIdParam = param('id').isMongoId().withMessage('অবৈধ ID');

const createBlogValidator = [
  body('title').trim().notEmpty().withMessage('শিরোনাম আবশ্যক').isLength({ max: 200 }),
  body('content').trim().notEmpty().withMessage('কন্টেন্ট আবশ্যক'),
  body('excerpt').optional().trim().isLength({ max: 300 }),
  body('category').optional().isIn(Blog.CATEGORIES).withMessage('অবৈধ ক্যাটাগরি'),
  body('status').optional().isIn(['draft', 'published']),
];

const updateBlogValidator = [
  mongoIdParam,
  body('title').optional().trim().notEmpty().isLength({ max: 200 }),
  body('content').optional().trim().notEmpty(),
  body('excerpt').optional().trim().isLength({ max: 300 }),
  body('category').optional().isIn(Blog.CATEGORIES),
  body('status').optional().isIn(['draft', 'published']),
];

const addCommentValidator = [
  mongoIdParam,
  body('text').trim().notEmpty().withMessage('মন্তব্য খালি রাখা যাবে না').isLength({ max: 1000 }),
];

module.exports = { mongoIdParam, createBlogValidator, updateBlogValidator, addCommentValidator };
