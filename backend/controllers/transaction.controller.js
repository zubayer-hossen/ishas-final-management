const Transaction = require('../models/Transaction');
const User = require('../models/User');
const OrgSettings = require('../models/OrgSettings');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const { getPagination, buildPaginationMeta } = require('../utils/pagination');
const generateTransactionId = require('../utils/generateTransactionId');
const { calculateMemberDues } = require('../utils/duesCalculator');
const generateReceiptPDF = require('../utils/pdfReceipt');
const env = require('../config/env');

const INCOME_CATEGORIES = ['monthly_chada', 'donation', 'emergency_fund', 'special_fund', 'other_income'];

/**
 * @route POST /api/v1/transactions
 * @access owner, super_admin, admin, treasurer
 */
const createTransaction = asyncHandler(async (req, res) => {
  const { type, category, memberId, amount, month, donationType, purpose, description, paymentMethod, date } =
    req.body;

  if (type === 'income' && !INCOME_CATEGORIES.includes(category)) {
    throw ApiError.badRequest('আয়ের জন্য সঠিক ক্যাটাগরি দিন');
  }
  if (type === 'expense' && category !== 'expense') {
    throw ApiError.badRequest('খরচের ক্যাটাগরি অবশ্যই "expense" হতে হবে');
  }

  let member = null;
  if (memberId) {
    member = await User.findById(memberId);
    if (!member) throw ApiError.notFound('সদস্য পাওয়া যায়নি');
  }

  if (category === 'monthly_chada') {
    if (!member) throw ApiError.badRequest('মাসিক চাঁদার জন্য সদস্য উল্লেখ করা আবশ্যক');
    if (!month) throw ApiError.badRequest('মাসিক চাঁদার জন্য মাস উল্লেখ করা আবশ্যক');

    const existing = await Transaction.findOne({
      member: member._id,
      category: 'monthly_chada',
      month,
      isVoided: false,
    });
    if (existing) throw ApiError.conflict(`${month} মাসের চাঁদা ইতিমধ্যে পরিশোধ করা হয়েছে`);
  }

  const transactionId = await generateTransactionId();

  const transaction = await Transaction.create({
    transactionId,
    type,
    category,
    member: member?._id || null,
    amount,
    month: category === 'monthly_chada' ? month : null,
    donationType,
    purpose,
    description,
    paymentMethod,
    date: date || Date.now(),
    recordedBy: req.user._id,
  });

  return res.status(201).json(new ApiResponse(201, transaction, 'লেনদেন সফলভাবে রেকর্ড করা হয়েছে'));
});

/**
 * @route GET /api/v1/transactions
 * @access owner, super_admin, admin, treasurer
 */
const getAllTransactions = asyncHandler(async (req, res) => {
  const { type, category, member, from, to, includeVoided } = req.query;
  const { page, limit, skip } = getPagination(req.query, 20);

  const filter = {};
  if (type) filter.type = type;
  if (category) filter.category = category;
  if (member) filter.member = member;
  if (includeVoided !== 'true') filter.isVoided = false;
  if (from || to) {
    filter.date = {};
    if (from) filter.date.$gte = new Date(from);
    if (to) filter.date.$lte = new Date(to);
  }

  const [transactions, total, summary] = await Promise.all([
    Transaction.find(filter)
      .populate('member', 'fullName memberId email')
      .populate('recordedBy', 'fullName')
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit),
    Transaction.countDocuments(filter),
    Transaction.aggregate([
      { $match: { ...filter, isVoided: false } },
      { $group: { _id: '$type', total: { $sum: '$amount' } } },
    ]),
  ]);

  const totals = { income: 0, expense: 0 };
  summary.forEach((s) => {
    totals[s._id] = s.total;
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        transactions,
        pagination: buildPaginationMeta(total, page, limit),
        summary: { ...totals, balance: totals.income - totals.expense },
      },
      'লেনদেনের তালিকা'
    )
  );
});

/**
 * @route GET /api/v1/transactions/:id
 */
const getTransactionById = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findById(req.params.id)
    .populate('member', 'fullName memberId email phone')
    .populate('recordedBy', 'fullName');
  if (!transaction) throw ApiError.notFound('লেনদেন পাওয়া যায়নি');

  // Members can only view their own transactions; staff can view all
  const staffRoles = ['owner', 'super_admin', 'admin', 'treasurer'];
  if (
    !staffRoles.includes(req.user.role) &&
    (!transaction.member || transaction.member._id.toString() !== req.user._id.toString())
  ) {
    throw ApiError.forbidden('এই লেনদেন দেখার অনুমতি আপনার নেই');
  }

  return res.status(200).json(new ApiResponse(200, transaction, 'লেনদেনের বিস্তারিত'));
});

/**
 * @route PATCH /api/v1/transactions/:id/void
 * @access owner, treasurer
 */
const voidTransaction = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const transaction = await Transaction.findById(req.params.id);
  if (!transaction) throw ApiError.notFound('লেনদেন পাওয়া যায়নি');

  if (transaction.isVoided) throw ApiError.badRequest('লেনদেনটি ইতিমধ্যে বাতিল করা হয়েছে');

  transaction.isVoided = true;
  transaction.voidedBy = req.user._id;
  transaction.voidedAt = new Date();
  transaction.voidReason = reason || '';
  await transaction.save();

  return res.status(200).json(new ApiResponse(200, transaction, 'লেনদেন বাতিল করা হয়েছে'));
});

/**
 * @route GET /api/v1/transactions/dues/me
 * @access any authenticated member
 */
const getMyDues = asyncHandler(async (req, res) => {
  const settings = await OrgSettings.getSettings();
  const dues = await calculateMemberDues(req.user, settings.monthlyChadaAmount);
  return res.status(200).json(new ApiResponse(200, dues, 'আপনার চাঁদার বকেয়া তথ্য'));
});

/**
 * @route GET /api/v1/transactions/dues/:memberId
 * @access owner, super_admin, admin, treasurer
 */
const getMemberDues = asyncHandler(async (req, res) => {
  const member = await User.findById(req.params.memberId);
  if (!member) throw ApiError.notFound('সদস্য পাওয়া যায়নি');

  const settings = await OrgSettings.getSettings();
  const dues = await calculateMemberDues(member, settings.monthlyChadaAmount);

  return res.status(200).json(new ApiResponse(200, dues, `${member.fullName} এর বকেয়া তথ্য`));
});

/**
 * @route GET /api/v1/transactions/:id/receipt
 * @access owner, super_admin, admin, treasurer, or the member themselves
 */
const downloadReceipt = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findById(req.params.id).populate('member');
  if (!transaction) throw ApiError.notFound('লেনদেন পাওয়া যায়নি');

  if (transaction.type !== 'income') {
    throw ApiError.badRequest('শুধুমাত্র আয়ের লেনদেনের জন্য রশিদ তৈরি করা যায়');
  }

  const staffRoles = ['owner', 'super_admin', 'admin', 'treasurer'];
  if (
    !staffRoles.includes(req.user.role) &&
    (!transaction.member || transaction.member._id.toString() !== req.user._id.toString())
  ) {
    throw ApiError.forbidden('এই রশিদ ডাউনলোড করার অনুমতি আপনার নেই');
  }

  const settings = await OrgSettings.getSettings();
  const verifyUrl = `${env.clientUrl}/verify-receipt/${transaction.transactionId}`;

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=receipt-${transaction.transactionId}.pdf`);

  const doc = await generateReceiptPDF({
    transaction,
    member: transaction.member,
    orgSettings: settings,
    verifyUrl,
  });

  doc.pipe(res);
});

/**
 * @route GET /api/v1/transactions/verify/:transactionId
 * @access public (for QR code scanning)
 */
const verifyReceipt = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findOne({ transactionId: req.params.transactionId }).populate(
    'member',
    'fullName memberId'
  );

  if (!transaction || transaction.isVoided) {
    return res.status(200).json(new ApiResponse(200, { valid: false }, 'এই রশিদটি বৈধ নয়'));
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        valid: true,
        transactionId: transaction.transactionId,
        amount: transaction.amount,
        category: transaction.category,
        date: transaction.date,
        memberName: transaction.member?.fullName || 'N/A',
        memberId: transaction.member?.memberId || 'N/A',
      },
      'রশিদটি বৈধ'
    )
  );
});

module.exports = {
  createTransaction,
  getAllTransactions,
  getTransactionById,
  voidTransaction,
  getMyDues,
  getMemberDues,
  downloadReceipt,
  verifyReceipt,
};
