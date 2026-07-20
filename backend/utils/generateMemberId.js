const User = require('../models/User');

/**
 * Generates the next sequential member ID for the current year,
 * e.g. ISHAS-2026-0001, ISHAS-2026-0002 ...
 * Scoped per year so numbering restarts annually.
 */
const generateMemberId = async () => {
  const year = new Date().getFullYear();
  const prefix = `ISHAS-${year}-`;

  const lastMember = await User.findOne({ memberId: new RegExp(`^${prefix}`) })
    .sort({ memberId: -1 })
    .select('memberId');

  let nextNumber = 1;
  if (lastMember?.memberId) {
    const lastNumber = parseInt(lastMember.memberId.split('-').pop(), 10);
    nextNumber = lastNumber + 1;
  }

  return `${prefix}${String(nextNumber).padStart(4, '0')}`;
};

module.exports = generateMemberId;
