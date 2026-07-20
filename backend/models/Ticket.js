const mongoose = require('mongoose');

const TICKET_CATEGORIES = ['complaint', 'suggestion', 'feedback', 'technical', 'financial', 'other'];
const TICKET_STATUSES = ['open', 'in_progress', 'resolved', 'closed'];
const TICKET_PRIORITIES = ['low', 'medium', 'high', 'urgent'];

const ReplySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true, trim: true, maxlength: 2000 },
    isStaffReply: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const TicketSchema = new mongoose.Schema(
  {
    ticketNumber: { type: String, required: true, unique: true },
    subject: { type: String, required: [true, 'বিষয় আবশ্যক'], trim: true, maxlength: 200 },
    description: { type: String, required: [true, 'বিস্তারিত আবশ্যক'], maxlength: 3000 },
    category: { type: String, enum: TICKET_CATEGORIES, default: 'other' },
    priority: { type: String, enum: TICKET_PRIORITIES, default: 'medium' },
    status: { type: String, enum: TICKET_STATUSES, default: 'open' },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

    replies: { type: [ReplySchema], default: [] },
    resolvedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

TicketSchema.index({ status: 1, priority: -1, createdAt: -1 });
TicketSchema.index({ createdBy: 1 });

TicketSchema.statics.CATEGORIES = TICKET_CATEGORIES;
TicketSchema.statics.STATUSES = TICKET_STATUSES;
TicketSchema.statics.PRIORITIES = TICKET_PRIORITIES;

module.exports = mongoose.model('Ticket', TicketSchema);
