const Transaction = require('../models/Transaction');

/**
 * Converts a Date to 'YYYY-MM' string.
 */
const toMonthString = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
};

/**
 * Builds the list of 'YYYY-MM' month strings from `startDate` (inclusive)
 * up to the current month (inclusive).
 */
const buildMonthRange = (startDate) => {
  const months = [];
  const cursor = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth(), 1);

  while (cursor <= end) {
    months.push(toMonthString(cursor));
    cursor.setMonth(cursor.getMonth() + 1);
  }

  return months;
};

/**
 * Computes a member's monthly-chada due summary:
 * which months are paid, which are due, and the total due amount.
 *
 * @param {Object} user - a User mongoose document (must have approvedAt or createdAt)
 * @param {number} monthlyAmount - the organization's configured monthly chada amount
 */
const calculateMemberDues = async (user, monthlyAmount) => {
  const membershipStartDate = user.approvedAt || user.createdAt;
  const allMonths = buildMonthRange(membershipStartDate);

  const paidTransactions = await Transaction.find({
    member: user._id,
    category: 'monthly_chada',
    isVoided: false,
  }).select('month amount');

  const paidMonthsSet = new Set(paidTransactions.map((t) => t.month));
  const totalPaid = paidTransactions.reduce((sum, t) => sum + t.amount, 0);

  const dueMonths = allMonths.filter((m) => !paidMonthsSet.has(m));
  const totalExpected = allMonths.length * monthlyAmount;
  const totalDue = Math.max(totalExpected - totalPaid, 0);

  return {
    membershipStartDate,
    monthlyAmount,
    totalMonthsSinceMembership: allMonths.length,
    paidMonths: allMonths.filter((m) => paidMonthsSet.has(m)),
    dueMonths,
    totalPaid,
    totalDue,
    nextDueMonth: dueMonths[0] || null,
  };
};

module.exports = { calculateMemberDues, buildMonthRange, toMonthString };
