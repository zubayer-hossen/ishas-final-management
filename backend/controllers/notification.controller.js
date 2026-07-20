const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const { getPagination, buildPaginationMeta } = require('../utils/pagination');

/**
 * @route GET /api/v1/notifications
 */
const getMyNotifications = asyncHandler(async (req, res) => {
  const { unreadOnly } = req.query;
  const { page, limit, skip } = getPagination(req.query, 20);

  const filter = { user: req.user._id };
  if (unreadOnly === 'true') filter.isRead = false;

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Notification.countDocuments(filter),
    Notification.countDocuments({ user: req.user._id, isRead: false }),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      { notifications, unreadCount, pagination: buildPaginationMeta(total, page, limit) },
      'নোটিফিকেশন তালিকা'
    )
  );
});

/**
 * @route PATCH /api/v1/notifications/:id/read
 */
const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({ _id: req.params.id, user: req.user._id });
  if (!notification) throw ApiError.notFound('নোটিফিকেশন পাওয়া যায়নি');

  notification.isRead = true;
  await notification.save();

  return res.status(200).json(new ApiResponse(200, notification, 'পঠিত হিসেবে চিহ্নিত হয়েছে'));
});

/**
 * @route PATCH /api/v1/notifications/read-all
 */
const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
  return res.status(200).json(new ApiResponse(200, null, 'সব নোটিফিকেশন পঠিত হিসেবে চিহ্নিত হয়েছে'));
});

/**
 * @route DELETE /api/v1/notifications/:id
 */
const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!notification) throw ApiError.notFound('নোটিফিকেশন পাওয়া যায়নি');

  return res.status(200).json(new ApiResponse(200, null, 'নোটিফিকেশন মুছে ফেলা হয়েছে'));
});

module.exports = { getMyNotifications, markAsRead, markAllAsRead, deleteNotification };
