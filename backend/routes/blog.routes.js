const express = require('express');
const { param } = require('express-validator');
const blogController = require('../controllers/blog.controller');
const validate = require('../middleware/validate');
const { protect, authorize } = require('../middleware/auth.middleware');
const { uploadImage } = require('../middleware/upload.middleware');
const {
  mongoIdParam,
  createBlogValidator,
  updateBlogValidator,
  addCommentValidator,
} = require('../validators/blog.validator');

const router = express.Router();

const STAFF_ROLES = ['owner', 'super_admin', 'admin', 'committee_member'];

router.use(protect);

router.get('/', blogController.getAllBlogs);
router.get('/:slug', blogController.getBlogBySlug);

router.post(
  '/',
  authorize(...STAFF_ROLES),
  uploadImage.single('coverImage'),
  createBlogValidator,
  validate,
  blogController.createBlog
);
router.patch(
  '/:id',
  uploadImage.single('coverImage'),
  updateBlogValidator,
  validate,
  blogController.updateBlog
);
router.delete('/:id', mongoIdParam, validate, blogController.deleteBlog);

router.post('/:id/like', mongoIdParam, validate, blogController.toggleLike);
router.post('/:id/comments', addCommentValidator, validate, blogController.addComment);
router.delete(
  '/:id/comments/:commentId',
  mongoIdParam,
  param('commentId').isMongoId().withMessage('অবৈধ মন্তব্য ID'),
  validate,
  blogController.deleteComment
);

module.exports = router;
