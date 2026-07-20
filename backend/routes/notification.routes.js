const express = require('express');
const { param } = require('express-validator');
const notificationController = require('../controllers/notification.controller');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);

router.get('/', notificationController.getMyNotifications);
router.patch('/read-all', notificationController.markAllAsRead);
router.patch(
  '/:id/read',
  param('id').isMongoId().withMessage('অবৈধ ID'),
  validate,
  notificationController.markAsRead
);
router.delete(
  '/:id',
  param('id').isMongoId().withMessage('অবৈধ ID'),
  validate,
  notificationController.deleteNotification
);

module.exports = router;
