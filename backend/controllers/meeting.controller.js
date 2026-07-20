const Meeting = require('../models/Meeting');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const { getPagination, buildPaginationMeta } = require('../utils/pagination');
const generateRoomId = require('../utils/generateRoomId');
const sendBulkEmail = require('../utils/sendBulkEmail');
const meetingInviteEmail = require('../templates/emails/meetingInviteEmail');
const env = require('../config/env');

/**
 * @route POST /api/v1/meetings
 * @access owner, super_admin, admin, committee_member
 */
const createMeeting = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    scheduledStart,
    scheduledEnd,
    password,
    waitingRoomEnabled,
    allowChat,
    allowScreenShare,
    muteOnEntry,
    inviteMemberIds,
    notifyAllActiveMembers,
  } = req.body;

  if (new Date(scheduledEnd) <= new Date(scheduledStart)) {
    throw ApiError.badRequest('শেষের সময় অবশ্যই শুরুর সময়ের পরে হতে হবে');
  }

  const roomId = await generateRoomId();

  const meeting = await Meeting.create({
    title,
    description,
    roomId,
    passwordHash: password || null,
    host: req.user._id,
    scheduledStart,
    scheduledEnd,
    settings: {
      waitingRoomEnabled: waitingRoomEnabled ?? true,
      allowChat: allowChat ?? true,
      allowScreenShare: allowScreenShare ?? true,
      muteOnEntry: muteOnEntry ?? true,
    },
    createdBy: req.user._id,
  });

  // -------- Optional email invitations (fire-and-forget) --------
  if (notifyAllActiveMembers || inviteMemberIds?.length) {
    const filter = notifyAllActiveMembers
      ? { isActive: true, isEmailVerified: true, membershipStatus: 'active' }
      : { _id: { $in: inviteMemberIds } };

    User.find(filter)
      .select('email')
      .then((recipients) => {
        const emails = recipients.map((r) => r.email);
        return sendBulkEmail(
          emails,
          `মিটিং আমন্ত্রণ: ${meeting.title}`,
          meetingInviteEmail({
            title: meeting.title,
            hostName: req.user.fullName,
            scheduledStart: meeting.scheduledStart,
            joinUrl: `${env.clientUrl}/meetings/${meeting.roomId}`,
          })
        );
      })
      .catch(() => null);
  }

  return res.status(201).json(new ApiResponse(201, meeting, 'মিটিং শিডিউল করা হয়েছে'));
});

/**
 * @route GET /api/v1/meetings
 */
const getAllMeetings = asyncHandler(async (req, res) => {
  const { status, upcoming } = req.query;
  const { page, limit, skip } = getPagination(req.query, 15);

  const filter = {};
  if (status) filter.status = status;
  if (upcoming === 'true') filter.scheduledStart = { $gte: new Date() };

  const [meetings, total] = await Promise.all([
    Meeting.find(filter)
      .select('-passwordHash -attendance')
      .populate('host', 'fullName profilePicture')
      .sort({ scheduledStart: upcoming === 'true' ? 1 : -1 })
      .skip(skip)
      .limit(limit),
    Meeting.countDocuments(filter),
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, { meetings, pagination: buildPaginationMeta(total, page, limit) }, 'মিটিং তালিকা'));
});

/**
 * @route GET /api/v1/meetings/:id
 */
const getMeetingById = asyncHandler(async (req, res) => {
  const meeting = await Meeting.findById(req.params.id)
    .select('-passwordHash')
    .populate('host', 'fullName profilePicture')
    .populate('coHosts', 'fullName');
  if (!meeting) throw ApiError.notFound('মিটিং পাওয়া যায়নি');
  return res.status(200).json(new ApiResponse(200, meeting, 'মিটিংয়ের বিস্তারিত'));
});

/**
 * @route PATCH /api/v1/meetings/:id
 * @access host, owner, super_admin, admin
 */
const updateMeeting = asyncHandler(async (req, res) => {
  const meeting = await Meeting.findById(req.params.id);
  if (!meeting) throw ApiError.notFound('মিটিং পাওয়া যায়নি');

  const canEdit =
    ['owner', 'super_admin', 'admin'].includes(req.user.role) || meeting.host.toString() === req.user._id.toString();
  if (!canEdit) throw ApiError.forbidden('এই মিটিং সম্পাদনা করার অনুমতি আপনার নেই');

  if (meeting.status !== 'scheduled') {
    throw ApiError.badRequest('শুধুমাত্র শিডিউলকৃত মিটিং সম্পাদনা করা যাবে');
  }

  const fields = ['title', 'description', 'scheduledStart', 'scheduledEnd'];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) meeting[f] = req.body[f];
  });

  if (req.body.password !== undefined) {
    meeting.passwordHash = req.body.password || null;
  }

  const settingFields = ['waitingRoomEnabled', 'allowChat', 'allowScreenShare', 'muteOnEntry'];
  settingFields.forEach((f) => {
    if (req.body[f] !== undefined) meeting.settings[f] = req.body[f];
  });

  await meeting.save();

  return res.status(200).json(new ApiResponse(200, meeting, 'মিটিং আপডেট হয়েছে'));
});

/**
 * @route DELETE /api/v1/meetings/:id
 * @access host, owner, super_admin, admin
 */
const cancelMeeting = asyncHandler(async (req, res) => {
  const meeting = await Meeting.findById(req.params.id);
  if (!meeting) throw ApiError.notFound('মিটিং পাওয়া যায়নি');

  const canCancel =
    ['owner', 'super_admin', 'admin'].includes(req.user.role) || meeting.host.toString() === req.user._id.toString();
  if (!canCancel) throw ApiError.forbidden('এই মিটিং বাতিল করার অনুমতি আপনার নেই');

  if (meeting.status === 'live') throw ApiError.badRequest('চলমান মিটিং বাতিল করা যাবে না, শেষ করুন');

  meeting.status = 'cancelled';
  await meeting.save();

  return res.status(200).json(new ApiResponse(200, null, 'মিটিং বাতিল করা হয়েছে'));
});

/**
 * @route POST /api/v1/meetings/:id/verify-join
 * @access any authenticated user — validates password before the client
 * connects to the Socket.IO signaling namespace.
 */
const verifyJoin = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const meeting = await Meeting.findById(req.params.id).populate('host', 'fullName');
  if (!meeting) throw ApiError.notFound('মিটিং পাওয়া যায়নি');

  if (meeting.status === 'cancelled') throw ApiError.badRequest('এই মিটিংটি বাতিল করা হয়েছে');
  if (meeting.status === 'ended') throw ApiError.badRequest('এই মিটিং ইতিমধ্যে শেষ হয়ে গেছে');

  const isMatch = await meeting.comparePassword(password);
  if (!isMatch) throw ApiError.unauthorized('মিটিং পাসওয়ার্ড সঠিক নয়');

  const isHost =
    meeting.host._id.toString() === req.user._id.toString() ||
    meeting.coHosts.some((c) => c.toString() === req.user._id.toString());

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        roomId: meeting.roomId,
        title: meeting.title,
        isHost,
        settings: meeting.settings,
      },
      'যোগদানের অনুমতি দেওয়া হয়েছে'
    )
  );
});

/**
 * @route GET /api/v1/meetings/:id/attendance
 * @access host, owner, super_admin, admin
 */
const getAttendance = asyncHandler(async (req, res) => {
  const meeting = await Meeting.findById(req.params.id).populate(
    'attendance.user',
    'fullName memberId profilePicture'
  );
  if (!meeting) throw ApiError.notFound('মিটিং পাওয়া যায়নি');

  return res.status(200).json(
    new ApiResponse(
      200,
      { attendance: meeting.attendance, totalAttendees: meeting.attendance.length },
      'উপস্থিতির তালিকা'
    )
  );
});

module.exports = {
  createMeeting,
  getAllMeetings,
  getMeetingById,
  updateMeeting,
  cancelMeeting,
  verifyJoin,
  getAttendance,
};
