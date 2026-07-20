const express = require('express');
const meetingController = require('../controllers/meeting.controller');
const validate = require('../middleware/validate');
const { protect, authorize } = require('../middleware/auth.middleware');
const {
  mongoIdParam,
  createMeetingValidator,
  updateMeetingValidator,
  verifyJoinValidator,
} = require('../validators/meeting.validator');

const router = express.Router();

const STAFF_ROLES = ['owner', 'super_admin', 'admin', 'committee_member'];

router.use(protect);

router.get('/', meetingController.getAllMeetings);
router.get('/:id', mongoIdParam, validate, meetingController.getMeetingById);

router.post('/', authorize(...STAFF_ROLES), createMeetingValidator, validate, meetingController.createMeeting);
router.patch('/:id', updateMeetingValidator, validate, meetingController.updateMeeting);
router.delete('/:id', mongoIdParam, validate, meetingController.cancelMeeting);

router.post('/:id/verify-join', verifyJoinValidator, validate, meetingController.verifyJoin);
router.get('/:id/attendance', authorize(...STAFF_ROLES), mongoIdParam, validate, meetingController.getAttendance);

module.exports = router;
