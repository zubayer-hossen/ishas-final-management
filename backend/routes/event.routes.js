const express = require('express');
const eventController = require('../controllers/event.controller');
const validate = require('../middleware/validate');
const { protect, authorize, requireActiveMembership } = require('../middleware/auth.middleware');
const { uploadImage } = require('../middleware/upload.middleware');
const {
  mongoIdParam,
  createEventValidator,
  updateEventValidator,
  registerValidator,
  markAttendanceValidator,
} = require('../validators/event.validator');

const router = express.Router();

const STAFF_ROLES = ['owner', 'super_admin', 'admin', 'committee_member'];

router.use(protect);

router.get('/', eventController.getAllEvents);
router.get('/:id', mongoIdParam, validate, eventController.getEventById);

router.post(
  '/',
  authorize(...STAFF_ROLES),
  uploadImage.single('coverImage'),
  createEventValidator,
  validate,
  eventController.createEvent
);
router.patch(
  '/:id',
  authorize(...STAFF_ROLES),
  uploadImage.single('coverImage'),
  updateEventValidator,
  validate,
  eventController.updateEvent
);
router.delete('/:id', authorize(...STAFF_ROLES), mongoIdParam, validate, eventController.deleteEvent);

// -------- Registration & Attendance --------
router.post(
  '/:id/register',
  requireActiveMembership,
  registerValidator,
  validate,
  eventController.registerForEvent
);
router.delete('/:id/register', mongoIdParam, validate, eventController.unregisterFromEvent);
router.get('/:id/ticket', mongoIdParam, validate, eventController.getMyTicketQr);

router.post(
  '/:id/attendance',
  authorize(...STAFF_ROLES),
  markAttendanceValidator,
  validate,
  eventController.markAttendance
);
router.get('/:id/attendance', authorize(...STAFF_ROLES), mongoIdParam, validate, eventController.getAttendanceList);

router.get('/:id/certificate', mongoIdParam, validate, eventController.downloadCertificate);

module.exports = router;
