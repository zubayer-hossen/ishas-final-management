const Ticket = require('../models/Ticket');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const { getPagination, buildPaginationMeta } = require('../utils/pagination');
const generateTicketNumber = require('../utils/generateTicketNumber');
const { notifyUser } = require('../utils/notify');

const STAFF_ROLES = ['owner', 'super_admin', 'admin'];

/**
 * @route POST /api/v1/support/tickets
 * @access any authenticated member
 */
const createTicket = asyncHandler(async (req, res) => {
  const { subject, description, category, priority } = req.body;

  const ticketNumber = await generateTicketNumber();

  const ticket = await Ticket.create({
    ticketNumber,
    subject,
    description,
    category,
    priority,
    createdBy: req.user._id,
  });

  return res.status(201).json(new ApiResponse(201, ticket, 'টিকেট সফলভাবে জমা দেওয়া হয়েছে'));
});

/**
 * @route GET /api/v1/support/tickets
 * @access staff sees all (filterable); members see only their own via /my
 */
const getAllTickets = asyncHandler(async (req, res) => {
  const { status, category, priority, assignedTo } = req.query;
  const { page, limit, skip } = getPagination(req.query, 20);

  const filter = {};
  if (status) filter.status = status;
  if (category) filter.category = category;
  if (priority) filter.priority = priority;
  if (assignedTo) filter.assignedTo = assignedTo;

  const [tickets, total] = await Promise.all([
    Ticket.find(filter)
      .populate('createdBy', 'fullName memberId email')
      .populate('assignedTo', 'fullName')
      .select('-replies')
      .sort({ priority: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Ticket.countDocuments(filter),
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, { tickets, pagination: buildPaginationMeta(total, page, limit) }, 'টিকেট তালিকা'));
});

/**
 * @route GET /api/v1/support/tickets/my
 * @access self
 */
const getMyTickets = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query, 20);

  const filter = { createdBy: req.user._id };

  const [tickets, total] = await Promise.all([
    Ticket.find(filter).select('-replies').sort({ createdAt: -1 }).skip(skip).limit(limit),
    Ticket.countDocuments(filter),
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, { tickets, pagination: buildPaginationMeta(total, page, limit) }, 'আমার টিকেট'));
});

/**
 * @route GET /api/v1/support/tickets/:id
 */
const getTicketById = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findById(req.params.id)
    .populate('createdBy', 'fullName memberId email profilePicture')
    .populate('assignedTo', 'fullName')
    .populate('replies.user', 'fullName profilePicture role');

  if (!ticket) throw ApiError.notFound('টিকেট পাওয়া যায়নি');

  const isOwner = ticket.createdBy._id.toString() === req.user._id.toString();
  if (!isOwner && !STAFF_ROLES.includes(req.user.role)) {
    throw ApiError.forbidden('এই টিকেট দেখার অনুমতি আপনার নেই');
  }

  return res.status(200).json(new ApiResponse(200, ticket, 'টিকেটের বিস্তারিত'));
});

/**
 * @route POST /api/v1/support/tickets/:id/replies
 */
const addReply = asyncHandler(async (req, res) => {
  const { message } = req.body;
  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) throw ApiError.notFound('টিকেট পাওয়া যায়নি');

  const isOwner = ticket.createdBy.toString() === req.user._id.toString();
  const isStaff = STAFF_ROLES.includes(req.user.role);
  if (!isOwner && !isStaff) throw ApiError.forbidden('এই টিকেটে উত্তর দেওয়ার অনুমতি আপনার নেই');

  ticket.replies.push({ user: req.user._id, message, isStaffReply: isStaff });

  if (isStaff && ticket.status === 'open') ticket.status = 'in_progress';

  await ticket.save();

  if (isStaff && !isOwner) {
    notifyUser(req.app.get('io'), ticket.createdBy.toString(), {
      title: 'আপনার টিকেটে নতুন উত্তর',
      message: `টিকেট #${ticket.ticketNumber} এ একটি নতুন উত্তর যুক্ত হয়েছে`,
      type: 'info',
      link: `/support/tickets/${ticket._id}`,
      relatedType: 'ticket',
      relatedId: ticket._id,
    }).catch(() => null);
  }

  const populated = await ticket.populate('replies.user', 'fullName profilePicture role');
  return res.status(201).json(new ApiResponse(201, populated.replies[populated.replies.length - 1], 'উত্তর যুক্ত করা হয়েছে'));
});

/**
 * @route PATCH /api/v1/support/tickets/:id/status
 * @access owner, super_admin, admin
 */
const updateTicketStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) throw ApiError.notFound('টিকেট পাওয়া যায়নি');

  ticket.status = status;
  if (status === 'resolved' || status === 'closed') ticket.resolvedAt = new Date();

  await ticket.save();

  notifyUser(req.app.get('io'), ticket.createdBy.toString(), {
    title: 'টিকেটের স্ট্যাটাস পরিবর্তন হয়েছে',
    message: `টিকেট #${ticket.ticketNumber} এখন "${status}" অবস্থায় আছে`,
    type: status === 'resolved' ? 'success' : 'info',
    link: `/support/tickets/${ticket._id}`,
    relatedType: 'ticket',
    relatedId: ticket._id,
  }).catch(() => null);

  return res.status(200).json(new ApiResponse(200, ticket, 'টিকেটের স্ট্যাটাস আপডেট হয়েছে'));
});

/**
 * @route PATCH /api/v1/support/tickets/:id/assign
 * @access owner, super_admin, admin
 */
const assignTicket = asyncHandler(async (req, res) => {
  const { assignedTo } = req.body;
  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) throw ApiError.notFound('টিকেট পাওয়া যায়নি');

  ticket.assignedTo = assignedTo || null;
  await ticket.save();

  return res.status(200).json(new ApiResponse(200, ticket, 'টিকেট এসাইন করা হয়েছে'));
});

module.exports = {
  createTicket,
  getAllTickets,
  getMyTickets,
  getTicketById,
  addReply,
  updateTicketStatus,
  assignTicket,
};
