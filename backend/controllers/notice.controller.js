const Notice = require('../models/Notice');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const { getPagination, buildPaginationMeta } = require('../utils/pagination');
const { uploadBufferToCloudinary, deleteFromCloudinary } = require('../utils/cloudinaryUpload');
const sendBulkEmail = require('../utils/sendBulkEmail');
const noticePublishedEmail = require('../templates/emails/noticePublishedEmail');
const { notifyManyUsers } = require('../utils/notify');
const env = require('../config/env');

/**
 * @route POST /api/v1/notices
 * @access owner, super_admin, admin, committee_member
 */
const createNotice = asyncHandler(async (req, res) => {
  const { title, content, category, isPinned, targetRoles, sendEmailNotification } = req.body;

  const attachments = [];
  if (req.files?.length) {
    for (const file of req.files) {
      const isPdf = file.mimetype === 'application/pdf';
      const result = await uploadBufferToCloudinary(file.buffer, 'ishas/notices');
      attachments.push({
        url: result.secure_url,
        publicId: result.public_id,
        fileType: isPdf ? 'pdf' : 'image',
        originalName: file.originalname,
      });
    }
  }

  const notice = await Notice.create({
    title,
    content,
    category,
    isPinned: !!isPinned,
    targetRoles: targetRoles || [],
    attachments,
    publishedBy: req.user._id,
  });

  const targetFilter = { isActive: true, membershipStatus: 'active' };
  if (notice.targetRoles?.length) targetFilter.role = { $in: notice.targetRoles };

  User.find(targetFilter)
    .select('_id')
    .then((targets) => {
      const io = req.app.get('io');
      return notifyManyUsers(
        io,
        targets.map((t) => t._id.toString()),
        {
          title: 'নতুন নোটিশ',
          message: notice.title,
          type: notice.category === 'urgent' ? 'alert' : 'info',
          link: `/dashboard/notices`,
          relatedType: 'notice',
          relatedId: notice._id,
        }
      );
    })
    .catch(() => null);

  if (sendEmailNotification) {
    const filter = { isActive: true, isEmailVerified: true, membershipStatus: 'active' };
    if (notice.targetRoles?.length) filter.role = { $in: notice.targetRoles };

    const recipients = await User.find(filter).select('email');
    const emails = recipients.map((r) => r.email);

    const snippet = notice.content.length > 150 ? `${notice.content.slice(0, 150)}...` : notice.content;

    sendBulkEmail(
      emails,
      `নতুন নোটিশ: ${notice.title}`,
      noticePublishedEmail({
        title: notice.title,
        contentSnippet: snippet,
        category: notice.category,
        noticeUrl: `${env.clientUrl}/notices/${notice._id}`,
      })
    )
      .then(async (result) => {
        notice.emailNotificationSent = true;
        await notice.save({ validateBeforeSave: false });
        return result;
      })
      .catch(() => null); // fire-and-forget; failures are logged inside sendBulkEmail
  }

  return res.status(201).json(new ApiResponse(201, notice, 'নোটিশ প্রকাশ করা হয়েছে'));
});

/**
 * @route GET /api/v1/notices
 */
const getAllNotices = asyncHandler(async (req, res) => {
  const { category } = req.query;
  const { page, limit, skip } = getPagination(req.query, 15);

  const filter = { isActive: true };
  if (category) filter.category = category;

  // Restrict to notices targeted at this user's role (or public notices)
  if (!['owner', 'super_admin'].includes(req.user.role)) {
    filter.$or = [{ targetRoles: { $size: 0 } }, { targetRoles: req.user.role }];
  }

  const [notices, total] = await Promise.all([
    Notice.find(filter)
      .populate('publishedBy', 'fullName role')
      .sort({ isPinned: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Notice.countDocuments(filter),
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, { notices, pagination: buildPaginationMeta(total, page, limit) }, 'নোটিশ তালিকা'));
});

/**
 * @route GET /api/v1/notices/:id
 */
const getNoticeById = asyncHandler(async (req, res) => {
  const notice = await Notice.findById(req.params.id).populate('publishedBy', 'fullName role');
  if (!notice || !notice.isActive) throw ApiError.notFound('নোটিশ পাওয়া যায়নি');
  return res.status(200).json(new ApiResponse(200, notice, 'নোটিশের বিস্তারিত'));
});

/**
 * @route PATCH /api/v1/notices/:id
 * @access owner, super_admin, admin, or the original publisher
 */
const updateNotice = asyncHandler(async (req, res) => {
  const notice = await Notice.findById(req.params.id);
  if (!notice) throw ApiError.notFound('নোটিশ পাওয়া যায়নি');

  const canEdit =
    ['owner', 'super_admin', 'admin'].includes(req.user.role) ||
    notice.publishedBy.toString() === req.user._id.toString();
  if (!canEdit) throw ApiError.forbidden('এই নোটিশ সম্পাদনা করার অনুমতি আপনার নেই');

  const { title, content, category, isPinned, targetRoles } = req.body;
  if (title !== undefined) notice.title = title;
  if (content !== undefined) notice.content = content;
  if (category !== undefined) notice.category = category;
  if (isPinned !== undefined) notice.isPinned = isPinned;
  if (targetRoles !== undefined) notice.targetRoles = targetRoles;

  await notice.save();

  return res.status(200).json(new ApiResponse(200, notice, 'নোটিশ আপডেট হয়েছে'));
});

/**
 * @route PATCH /api/v1/notices/:id/pin
 * @access owner, super_admin, admin
 */
const togglePin = asyncHandler(async (req, res) => {
  const notice = await Notice.findById(req.params.id);
  if (!notice) throw ApiError.notFound('নোটিশ পাওয়া যায়নি');

  notice.isPinned = !notice.isPinned;
  await notice.save();

  return res
    .status(200)
    .json(new ApiResponse(200, notice, notice.isPinned ? 'নোটিশ পিন করা হয়েছে' : 'নোটিশ আনপিন করা হয়েছে'));
});

/**
 * @route DELETE /api/v1/notices/:id
 * @access owner, super_admin, admin
 */
const deleteNotice = asyncHandler(async (req, res) => {
  const notice = await Notice.findById(req.params.id);
  if (!notice) throw ApiError.notFound('নোটিশ পাওয়া যায়নি');

  await Promise.all(notice.attachments.map((a) => deleteFromCloudinary(a.publicId)));

  notice.isActive = false;
  await notice.save({ validateBeforeSave: false });

  return res.status(200).json(new ApiResponse(200, null, 'নোটিশ মুছে ফেলা হয়েছে'));
});

module.exports = { createNotice, getAllNotices, getNoticeById, updateNotice, togglePin, deleteNotice };
