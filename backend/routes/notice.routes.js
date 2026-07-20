const express = require('express');
const noticeController = require('../controllers/notice.controller');
const validate = require('../middleware/validate');
const { protect, authorize } = require('../middleware/auth.middleware');
const { uploadDocument } = require('../middleware/upload.middleware');
const { createNoticeValidator, updateNoticeValidator, mongoIdParam } = require('../validators/notice.validator');

const router = express.Router();

const PUBLISH_ROLES = ['owner', 'super_admin', 'admin', 'committee_member'];

router.use(protect);

router.get('/', noticeController.getAllNotices);
router.get('/:id', mongoIdParam, validate, noticeController.getNoticeById);

router.post(
  '/',
  authorize(...PUBLISH_ROLES),
  uploadDocument.array('attachments', 5),
  createNoticeValidator,
  validate,
  noticeController.createNotice
);
router.patch('/:id', updateNoticeValidator, validate, noticeController.updateNotice);
router.patch('/:id/pin', authorize('owner', 'super_admin', 'admin'), mongoIdParam, validate, noticeController.togglePin);
router.delete('/:id', authorize('owner', 'super_admin', 'admin'), mongoIdParam, validate, noticeController.deleteNotice);

module.exports = router;
