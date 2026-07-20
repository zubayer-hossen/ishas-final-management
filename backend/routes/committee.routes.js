const express = require('express');
const committeeController = require('../controllers/committee.controller');
const validate = require('../middleware/validate');
const { protect, authorize } = require('../middleware/auth.middleware');
const {
  createCommitteeValidator,
  updateCommitteeValidator,
  addMemberValidator,
} = require('../validators/committee.validator');
const { param } = require('express-validator');

const router = express.Router();

router.use(protect);

router.get('/', committeeController.getAllCommittees);
router.get('/:id', param('id').isMongoId(), validate, committeeController.getCommitteeById);

router.post(
  '/',
  authorize('owner', 'super_admin'),
  createCommitteeValidator,
  validate,
  committeeController.createCommittee
);
router.patch(
  '/:id',
  authorize('owner', 'super_admin'),
  updateCommitteeValidator,
  validate,
  committeeController.updateCommittee
);
router.delete('/:id', authorize('owner'), param('id').isMongoId(), validate, committeeController.deleteCommittee);

router.post(
  '/:id/members',
  authorize('owner', 'super_admin'),
  addMemberValidator,
  validate,
  committeeController.addCommitteeMember
);
router.delete(
  '/:id/members/:memberEntryId',
  authorize('owner', 'super_admin'),
  committeeController.removeCommitteeMember
);

module.exports = router;
