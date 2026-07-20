const Committee = require('../models/Committee');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const { getPagination, buildPaginationMeta } = require('../utils/pagination');

/**
 * @route POST /api/v1/committees
 * @access owner, super_admin
 */
const createCommittee = asyncHandler(async (req, res) => {
  const { name, termYear, description } = req.body;

  const committee = await Committee.create({
    name,
    termYear,
    description,
    createdBy: req.user._id,
  });

  return res.status(201).json(new ApiResponse(201, committee, 'কমিটি তৈরি হয়েছে'));
});

/**
 * @route GET /api/v1/committees
 */
const getAllCommittees = asyncHandler(async (req, res) => {
  const { isActive } = req.query;
  const { page, limit, skip } = getPagination(req.query, 10);

  const filter = {};
  if (isActive !== undefined) filter.isActive = isActive === 'true';

  const [committees, total] = await Promise.all([
    Committee.find(filter)
      .populate('members.user', 'fullName email profilePicture memberId')
      .populate('createdBy', 'fullName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Committee.countDocuments(filter),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      { committees, pagination: buildPaginationMeta(total, page, limit) },
      'কমিটির তালিকা'
    )
  );
});

/**
 * @route GET /api/v1/committees/:id
 */
const getCommitteeById = asyncHandler(async (req, res) => {
  const committee = await Committee.findById(req.params.id).populate(
    'members.user',
    'fullName email profilePicture memberId phone'
  );
  if (!committee) throw ApiError.notFound('কমিটি পাওয়া যায়নি');
  return res.status(200).json(new ApiResponse(200, committee, 'কমিটির তথ্য'));
});

/**
 * @route PATCH /api/v1/committees/:id
 * @access owner, super_admin
 */
const updateCommittee = asyncHandler(async (req, res) => {
  const { name, termYear, description, isActive } = req.body;

  const committee = await Committee.findById(req.params.id);
  if (!committee) throw ApiError.notFound('কমিটি পাওয়া যায়নি');

  if (name !== undefined) committee.name = name;
  if (termYear !== undefined) committee.termYear = termYear;
  if (description !== undefined) committee.description = description;
  if (isActive !== undefined) committee.isActive = isActive;

  await committee.save();

  return res.status(200).json(new ApiResponse(200, committee, 'কমিটি আপডেট হয়েছে'));
});

/**
 * @route DELETE /api/v1/committees/:id
 * @access owner
 */
const deleteCommittee = asyncHandler(async (req, res) => {
  const committee = await Committee.findById(req.params.id);
  if (!committee) throw ApiError.notFound('কমিটি পাওয়া যায়নি');
  await committee.deleteOne();
  return res.status(200).json(new ApiResponse(200, null, 'কমিটি মুছে ফেলা হয়েছে'));
});

/**
 * @route POST /api/v1/committees/:id/members
 * @access owner, super_admin
 * body: { userId, position }
 */
const addCommitteeMember = asyncHandler(async (req, res) => {
  const { userId, position } = req.body;

  const committee = await Committee.findById(req.params.id);
  if (!committee) throw ApiError.notFound('কমিটি পাওয়া যায়নি');

  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound('সদস্য পাওয়া যায়নি');

  const alreadyMember = committee.members.some((m) => m.user.toString() === userId);
  if (alreadyMember) throw ApiError.conflict('এই সদস্য ইতিমধ্যে কমিটিতে আছেন');

  const positionTaken = committee.members.some((m) => m.position === position);
  if (positionTaken) throw ApiError.conflict('এই পদটি ইতিমধ্যে পূরণ করা হয়েছে');

  committee.members.push({ user: userId, position });
  await committee.save();

  // Promote user's role to committee_member if they are currently a general_member
  if (user.role === 'general_member') {
    user.role = 'committee_member';
    await user.save({ validateBeforeSave: false });
  }

  const updated = await committee.populate('members.user', 'fullName email profilePicture memberId');

  return res.status(200).json(new ApiResponse(200, updated, 'কমিটিতে সদস্য যুক্ত করা হয়েছে'));
});

/**
 * @route DELETE /api/v1/committees/:id/members/:memberEntryId
 * @access owner, super_admin
 */
const removeCommitteeMember = asyncHandler(async (req, res) => {
  const { id, memberEntryId } = req.params;

  const committee = await Committee.findById(id);
  if (!committee) throw ApiError.notFound('কমিটি পাওয়া যায়নি');

  const entry = committee.members.id(memberEntryId);
  if (!entry) throw ApiError.notFound('কমিটিতে এই সদস্য পাওয়া যায়নি');

  entry.deleteOne();
  await committee.save();

  return res.status(200).json(new ApiResponse(200, committee, 'কমিটি থেকে সদস্য সরানো হয়েছে'));
});

module.exports = {
  createCommittee,
  getAllCommittees,
  getCommitteeById,
  updateCommittee,
  deleteCommittee,
  addCommitteeMember,
  removeCommitteeMember,
};
