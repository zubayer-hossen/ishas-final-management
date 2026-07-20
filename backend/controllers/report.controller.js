const Transaction = require('../models/Transaction');
const User = require('../models/User');
const Event = require('../models/Event');
const Meeting = require('../models/Meeting');
const OrgSettings = require('../models/OrgSettings');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const exportToExcel = require('../utils/exportExcel');
const generateTableReportPDF = require('../utils/generateTableReportPDF');
const { calculateMemberDues } = require('../utils/duesCalculator');

const respondWithReport = async (req, res, { fileName, sheetTitle, title, subtitle, columns, rows }) => {
  const format = (req.query.format || 'pdf').toLowerCase();

  if (format === 'excel') {
    return exportToExcel({ res, fileName, sheetTitle, columns, rows });
  }

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=${fileName}.pdf`);

  const pdfColumns = columns.map((c) => ({ ...c, width: c.width || 100 }));
  const doc = generateTableReportPDF({ title, subtitle, columns: pdfColumns, rows });
  doc.pipe(res);
};

/**
 * @route GET /api/v1/reports/financial?from=&to=&format=pdf|excel
 */
const financialReport = asyncHandler(async (req, res) => {
  const { from, to } = req.query;

  const filter = { isVoided: false };
  if (from || to) {
    filter.date = {};
    if (from) filter.date.$gte = new Date(from);
    if (to) filter.date.$lte = new Date(to);
  }

  const transactions = await Transaction.find(filter)
    .populate('member', 'fullName memberId')
    .populate('recordedBy', 'fullName')
    .sort({ date: -1 });

  const rows = transactions.map((t) => ({
    transactionId: t.transactionId,
    date: new Date(t.date).toLocaleDateString('bn-BD'),
    type: t.type === 'income' ? 'আয়' : 'ব্যয়',
    category: t.category,
    member: t.member?.fullName || '-',
    amount: t.amount,
    paymentMethod: t.paymentMethod,
    recordedBy: t.recordedBy?.fullName || '-',
  }));

  const totalIncome = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  await respondWithReport(req, res, {
    fileName: 'financial-report',
    sheetTitle: 'আর্থিক প্রতিবেদন',
    title: 'আর্থিক প্রতিবেদন (Financial Report)',
    subtitle: `মোট আয়: ${totalIncome} | মোট ব্যয়: ${totalExpense} | ব্যালেন্স: ${totalIncome - totalExpense}`,
    columns: [
      { header: 'রশিদ নম্বর', key: 'transactionId', width: 130 },
      { header: 'তারিখ', key: 'date', width: 90 },
      { header: 'ধরন', key: 'type', width: 60 },
      { header: 'ক্যাটাগরি', key: 'category', width: 110 },
      { header: 'সদস্য', key: 'member', width: 130 },
      { header: 'পরিমাণ', key: 'amount', width: 80 },
      { header: 'পেমেন্ট মাধ্যম', key: 'paymentMethod', width: 90 },
      { header: 'রেকর্ডকারী', key: 'recordedBy', width: 110 },
    ],
    rows,
  });
});

/**
 * @route GET /api/v1/reports/members?format=pdf|excel
 */
const membersReport = asyncHandler(async (req, res) => {
  const { role, membershipStatus } = req.query;

  const filter = {};
  if (role) filter.role = role;
  if (membershipStatus) filter.membershipStatus = membershipStatus;

  const members = await User.find(filter).sort({ createdAt: -1 });

  const rows = members.map((m) => ({
    memberId: m.memberId || '-',
    fullName: m.fullName,
    email: m.email,
    phone: m.phone || '-',
    role: m.role,
    status: m.membershipStatus,
    joinedAt: m.approvedAt ? new Date(m.approvedAt).toLocaleDateString('bn-BD') : '-',
  }));

  await respondWithReport(req, res, {
    fileName: 'members-report',
    sheetTitle: 'সদস্য তালিকা',
    title: 'সদস্য তালিকা প্রতিবেদন (Members Report)',
    columns: [
      { header: 'সদস্য আইডি', key: 'memberId', width: 100 },
      { header: 'নাম', key: 'fullName', width: 140 },
      { header: 'ইমেইল', key: 'email', width: 160 },
      { header: 'ফোন', key: 'phone', width: 100 },
      { header: 'রোল', key: 'role', width: 100 },
      { header: 'স্ট্যাটাস', key: 'status', width: 90 },
      { header: 'যোগদানের তারিখ', key: 'joinedAt', width: 110 },
    ],
    rows,
  });
});

/**
 * @route GET /api/v1/reports/dues?format=pdf|excel
 */
const duesReport = asyncHandler(async (req, res) => {
  const settings = await OrgSettings.getSettings();
  const members = await User.find({ membershipStatus: 'active' });

  const rows = [];
  // eslint-disable-next-line no-restricted-syntax
  for (const member of members) {
    // eslint-disable-next-line no-await-in-loop
    const dues = await calculateMemberDues(member, settings.monthlyChadaAmount);
    if (dues.totalDue > 0) {
      rows.push({
        memberId: member.memberId || '-',
        fullName: member.fullName,
        phone: member.phone || '-',
        totalDue: dues.totalDue,
        dueMonthsCount: dues.dueMonths.length,
        nextDueMonth: dues.nextDueMonth || '-',
      });
    }
  }

  await respondWithReport(req, res, {
    fileName: 'dues-report',
    sheetTitle: 'বকেয়া প্রতিবেদন',
    title: 'চাঁদা বকেয়া প্রতিবেদন (Dues Report)',
    subtitle: `মোট বকেয়া সদস্য: ${rows.length}`,
    columns: [
      { header: 'সদস্য আইডি', key: 'memberId', width: 100 },
      { header: 'নাম', key: 'fullName', width: 150 },
      { header: 'ফোন', key: 'phone', width: 110 },
      { header: 'মোট বকেয়া', key: 'totalDue', width: 100 },
      { header: 'বকেয়া মাস সংখ্যা', key: 'dueMonthsCount', width: 120 },
      { header: 'পরবর্তী বকেয়া মাস', key: 'nextDueMonth', width: 130 },
    ],
    rows,
  });
});

/**
 * @route GET /api/v1/reports/events/:id/attendance?format=pdf|excel
 */
const eventAttendanceReport = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id).populate(
    'registrations.user',
    'fullName memberId phone'
  );
  if (!event) throw ApiError.notFound('ইভেন্ট পাওয়া যায়নি');

  const rows = event.registrations.map((r) => ({
    memberId: r.user?.memberId || '-',
    fullName: r.user?.fullName || '-',
    phone: r.user?.phone || '-',
    isVolunteer: r.isVolunteer ? 'হ্যাঁ' : 'না',
    attended: r.attended ? 'উপস্থিত' : 'অনুপস্থিত',
    attendedAt: r.attendedAt ? new Date(r.attendedAt).toLocaleString('bn-BD') : '-',
  }));

  await respondWithReport(req, res, {
    fileName: `event-attendance-${event._id}`,
    sheetTitle: 'ইভেন্ট উপস্থিতি',
    title: `ইভেন্ট উপস্থিতি প্রতিবেদন: ${event.title}`,
    subtitle: `মোট রেজিস্ট্রেশন: ${event.registrations.length}`,
    columns: [
      { header: 'সদস্য আইডি', key: 'memberId', width: 100 },
      { header: 'নাম', key: 'fullName', width: 140 },
      { header: 'ফোন', key: 'phone', width: 110 },
      { header: 'স্বেচ্ছাসেবক', key: 'isVolunteer', width: 90 },
      { header: 'উপস্থিতি', key: 'attended', width: 90 },
      { header: 'উপস্থিতির সময়', key: 'attendedAt', width: 140 },
    ],
    rows,
  });
});

/**
 * @route GET /api/v1/reports/meetings/:id/attendance?format=pdf|excel
 */
const meetingAttendanceReport = asyncHandler(async (req, res) => {
  const meeting = await Meeting.findById(req.params.id).populate(
    'attendance.user',
    'fullName memberId phone'
  );
  if (!meeting) throw ApiError.notFound('মিটিং পাওয়া যায়নি');

  const rows = meeting.attendance.map((a) => ({
    memberId: a.user?.memberId || '-',
    fullName: a.user?.fullName || '-',
    joinedAt: new Date(a.joinedAt).toLocaleString('bn-BD'),
    leftAt: a.leftAt ? new Date(a.leftAt).toLocaleString('bn-BD') : '-',
    durationMinutes: Math.round((a.durationSeconds || 0) / 60),
  }));

  await respondWithReport(req, res, {
    fileName: `meeting-attendance-${meeting._id}`,
    sheetTitle: 'মিটিং উপস্থিতি',
    title: `মিটিং উপস্থিতি প্রতিবেদন: ${meeting.title}`,
    subtitle: `মোট অংশগ্রহণকারী: ${meeting.attendance.length}`,
    columns: [
      { header: 'সদস্য আইডি', key: 'memberId', width: 100 },
      { header: 'নাম', key: 'fullName', width: 140 },
      { header: 'যোগদানের সময়', key: 'joinedAt', width: 150 },
      { header: 'বের হওয়ার সময়', key: 'leftAt', width: 150 },
      { header: 'সময়কাল (মিনিট)', key: 'durationMinutes', width: 110 },
    ],
    rows,
  });
});

module.exports = {
  financialReport,
  membersReport,
  duesReport,
  eventAttendanceReport,
  meetingAttendanceReport,
};
