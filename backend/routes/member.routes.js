const express = require('express');
const memberController = require('../controllers/member.controller');
const validate = require('../middleware/validate');
const { protect, authorize } = require('../middleware/auth.middleware');
const { uploadImage } = require('../middleware/upload.middleware');
const {
  updateRoleValidator,
  updateStatusValidator,
  rejectMemberValidator,
  updateProfileValidator,
  mongoIdParam,
} = require('../validators/member.validator');

const router = express.Router();

const MANAGE_ROLES = ['owner', 'super_admin', 'admin'];

router.use(protect); // every route below requires authentication

// -------- Self-service routes (must come before /:id routes) --------
router.patch('/me', updateProfileValidator, validate, memberController.updateMyProfile);
router.post(
  '/me/profile-picture',
  uploadImage.single('profilePicture'),
  memberController.uploadProfilePicture
);

// -------- Admin / Owner management routes --------
router.get('/', authorize(...MANAGE_ROLES, 'committee_member'), memberController.getAllMembers);
router.get('/:id', mongoIdParam, validate, authorize(...MANAGE_ROLES, 'committee_member'), memberController.getMemberById);

router.patch(
  '/:id/approve',
  mongoIdParam,
  validate,
  authorize(...MANAGE_ROLES),
  memberController.approveMember
);
router.patch(
  '/:id/reject',
  rejectMemberValidator,
  validate,
  authorize(...MANAGE_ROLES),
  memberController.rejectMember
);
router.patch(
  '/:id/role',
  updateRoleValidator,
  validate,
  authorize('owner', 'super_admin'),
  memberController.updateMemberRole
);
router.patch(
  '/:id/status',
  updateStatusValidator,
  validate,
  authorize(...MANAGE_ROLES),
  memberController.updateMemberStatus
);
router.delete('/:id', mongoIdParam, validate, authorize('owner'), memberController.deleteMember);

module.exports = router;
