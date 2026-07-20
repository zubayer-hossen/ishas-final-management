const Ticket = require('../models/Ticket');

/**
 * Generates a sequential ticket number for the current year,
 * e.g. TKT-2026-000001.
 */
const generateTicketNumber = async () => {
  const year = new Date().getFullYear();
  const prefix = `TKT-${year}-`;

  const last = await Ticket.findOne({ ticketNumber: new RegExp(`^${prefix}`) })
    .sort({ ticketNumber: -1 })
    .select('ticketNumber');

  let nextNumber = 1;
  if (last?.ticketNumber) {
    nextNumber = parseInt(last.ticketNumber.split('-').pop(), 10) + 1;
  }

  return `${prefix}${String(nextNumber).padStart(6, '0')}`;
};

module.exports = generateTicketNumber;
