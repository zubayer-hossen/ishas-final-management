const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const { getPagination, buildPaginationMeta } = require('../utils/pagination');
const generateMemberId = require('../utils/generateMemberId');
const { uploadBufferToCloudinary, deleteFromCloudinary } = require('../utils/cloudinaryUpload');
const sendEmail = require('../utils/sendEmail');
const membershipApprovedEmail = require('../templates/emails/membershipApprovedEmail');
const { notifyUser } = require('../utils/notify');
const logger = require('../utils/logger');
const env = require('../config/env');

/**
 * @route GET /api/v1/members
 * @access admin, super_admin, owner, committee_member
 * Supports filters: role, membershipStatus, search (name/email/memberId), pagination
 */
const getAllMembers = asyncHandler(async (req, res) => {
  const { role, membershipStatus, search } = req.query;
  const { page, limit, skip } = getPagination(req.query);

  const filter = {};
  if (role) filter.role = role;
  if (membershipStatus) filter.membershipStatus = membershipStatus;
  if (search) {
    filter.$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { memberId: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
    ];
  }

  const [members, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        members: members.map((m) => m.toSafeObject()),
        pagination: buildPaginationMeta(total, page, limit),
      },
      'সদস্য তালিকা'
    )
  );
});

/**
 * @route GET /api/v1/members/:id
 */
const getMemberById = asyncHandler(async (req, res) => {
  const member = await User.findById(req.params.id);
  if (!member) throw ApiError.notFound('সদস্য পাওয়া যায়নি');
  return res.status(200).json(new ApiResponse(200, member.toSafeObject(), 'সদস্যের তথ্য'));
});

/**
 * @route PATCH /api/v1/members/:id/approve
 * @access owner, super_admin, admin
 */
const approveMember = asyncHandler(async (req, res) => {
  const member = await User.findById(req.params.id);
  if (!member) throw ApiError.notFound('সদস্য পাওয়া যায়নি');

  if (member.membershipStatus === 'active') {
    throw ApiError.badRequest('এই সদস্য ইতিমধ্যে অনুমোদিত');
  }

  if (!member.isEmailVerified) {
    throw ApiError.badRequest('সদস্যের ইমেইল এখনো ভেরিফাই করা হয়নি');
  }

  if (!member.memberId) {
    member.memberId = await generateMemberId();
  }

  member.membershipStatus = 'active';
  member.approvedBy = req.user._id;
  member.approvedAt = new Date();
  await member.save({ validateBeforeSave: false });

  try {
    await sendEmail({
      to: member.email,
      subject: 'আপনার সদস্যপদ অনুমোদিত হয়েছে — ISHAS Organization',
      html: membershipApprovedEmail({
        name: member.fullName,
        memberId: member.memberId,
        loginUrl: `${env.clientUrl}/login`,
      }),
    });
  } catch (error) {
    logger.error(`Approval email failed for ${member.email}: ${error.message}`);
  }

  notifyUser(req.app.get('io'), member._id.toString(), {
    title: 'সদস্যপদ অনুমোদিত হয়েছে',
    message: `অভিনন্দন! আপনার সদস্য আইডি: ${member.memberId}`,
    type: 'success',
    link: '/dashboard',
    relatedType: 'membership',
    relatedId: member._id,
  }).catch(() => null);

  return res.status(200).json(new ApiResponse(200, member.toSafeObject(), 'সদস্যপদ অনুমোদন করা হয়েছে'));
});

/**
 * @route PATCH /api/v1/members/:id/reject
 * @access owner, super_admin, admin
 */
const rejectMember = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const member = await User.findById(req.params.id);
  if (!member) throw ApiError.notFound('সদস্য পাওয়া যায়নি');

  if (member.membershipStatus === 'active') {
    throw ApiError.badRequest('একজন সক্রিয় সদস্যকে সরাসরি বাতিল করা যাবে না, প্রথমে সাসপেন্ড করুন');
  }

  member.membershipStatus = 'rejected';
  member.approvedBy = req.user._id;
  member.approvedAt = new Date();
  await member.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, member.toSafeObject(), reason ? `আবেদন বাতিল করা হয়েছে: ${reason}` : 'আবেদন বাতিল করা হয়েছে'));
});

/**
 * @route PATCH /api/v1/members/:id/role
 * @access owner, super_admin
 */
const updateMemberRole = asyncHandler(async (req, res) => {
  const { role } = req.body;

  if (!User.ROLES.includes(role)) {
    throw ApiError.badRequest('অবৈধ রোল');
  }

  const member = await User.findById(req.params.id);
  if (!member) throw ApiError.notFound('সদস্য পাওয়া যায়নি');

  if (member.role === 'owner' && req.user.role !== 'owner') {
    throw ApiError.forbidden('Owner এর রোল পরিবর্তন করার অনুমতি নেই');
  }

  if (role === 'owner' && req.user.role !== 'owner') {
    throw ApiError.forbidden('শুধুমাত্র Owner অন্য কাউকে Owner বানাতে পারবে');
  }

  member.role = role;
  await member.save({ validateBeforeSave: false });

  return res.status(200).json(new ApiResponse(200, member.toSafeObject(), 'সদস্যের রোল পরিবর্তন করা হয়েছে'));
});

/**
 * @route PATCH /api/v1/members/:id/status
 * @access owner, super_admin, admin
 * body: { status: 'active' | 'suspended' | 'inactive' }
 */
const updateMemberStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!User.MEMBERSHIP_STATUS.includes(status)) {
    throw ApiError.badRequest('অবৈধ স্ট্যাটাস');
  }

  const member = await User.findById(req.params.id);
  if (!member) throw ApiError.notFound('সদস্য পাওয়া যায়নি');

  if (member.role === 'owner') {
    throw ApiError.forbidden('Owner এর স্ট্যাটাস পরিবর্তন করা যাবে না');
  }

  member.membershipStatus = status;

  if (status === 'suspended' || status === 'inactive') {
    // Force logout from all devices when suspended/deactivated
    member.tokenVersion += 1;
    member.sessions = [];
    member.isActive = status !== 'inactive';
  } else {
    member.isActive = true;
  }

  await member.save({ validateBeforeSave: false });

  return res.status(200).json(new ApiResponse(200, member.toSafeObject(), 'সদস্যের স্ট্যাটাস পরিবর্তন করা হয়েছে'));
});

/**
 * @route DELETE /api/v1/members/:id
 * @access owner only
 */
const deleteMember = asyncHandler(async (req, res) => {
  const member = await User.findById(req.params.id);
  if (!member) throw ApiError.notFound('সদস্য পাওয়া যায়নি');

  if (member.role === 'owner') {
    throw ApiError.forbidden('Owner কে ডিলিট করা যাবে না');
  }

  if (member.profilePicture?.publicId) {
    await deleteFromCloudinary(member.profilePicture.publicId);
  }

  await member.deleteOne();

  return res.status(200).json(new ApiResponse(200, null, 'সদস্য মুছে ফেলা হয়েছে'));
});

/**
 * @route PATCH /api/v1/members/me
 * @access self (any logged-in user updating their own profile)
 */
const updateMyProfile = asyncHandler(async (req, res) => {
  const editableFields = [
    'fullName',
    'phone',
    'bloodGroup',
    'dateOfBirth',
    'gender',
    'occupation',
    'education',
  ];

  editableFields.forEach((field) => {
    if (req.body[field] !== undefined) req.user[field] = req.body[field];
  });

  if (req.body.address) {
    req.user.address = { ...req.user.address.toObject(), ...req.body.address };
  }
  if (req.body.emergencyContact) {
    req.user.emergencyContact = { ...req.user.emergencyContact.toObject(), ...req.body.emergencyContact };
  }
  if (req.body.socialLinks) {
    req.user.socialLinks = { ...req.user.socialLinks.toObject(), ...req.body.socialLinks };
  }

  await req.user.save();

  return res.status(200).json(new ApiResponse(200, req.user.toSafeObject(), 'প্রোফাইল আপডেট হয়েছে'));
});

/**
 * @route POST /api/v1/members/me/profile-picture
 * @access self
 */
const uploadProfilePicture = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest('কোনো ছবি পাওয়া যায়নি');

  const oldPublicId = req.user.profilePicture?.publicId;

  const result = await uploadBufferToCloudinary(req.file.buffer, 'ishas/profile-pictures');

  req.user.profilePicture = { url: result.secure_url, publicId: result.public_id };
  await req.user.save({ validateBeforeSave: false });

  if (oldPublicId) {
    await deleteFromCloudinary(oldPublicId);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { profilePicture: req.user.profilePicture }, 'প্রোফাইল ছবি আপলোড হয়েছে'));
});

module.exports = {
  getAllMembers,
  getMemberById,
  approveMember,
  rejectMember,
  updateMemberRole,
  updateMemberStatus,
  deleteMember,
  updateMyProfile,
  uploadProfilePicture,
};
