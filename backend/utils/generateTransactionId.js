const Transaction = require('../models/Transaction');

/**
 * Generates the next sequential transaction ID for the current year,
 * e.g. TXN-2026-000001, TXN-2026-000002 ...
 */
const generateTransactionId = async () => {
  const year = new Date().getFullYear();
  const prefix = `TXN-${year}-`;

  const last = await Transaction.findOne({ transactionId: new RegExp(`^${prefix}`) })
    .sort({ transactionId: -1 })
    .select('transactionId');

  let nextNumber = 1;
  if (last?.transactionId) {
    const lastNumber = parseInt(last.transactionId.split('-').pop(), 10);
    nextNumber = lastNumber + 1;
  }

  return `${prefix}${String(nextNumber).padStart(6, '0')}`;
};

module.exports = generateTransactionId;
