const mongoose = require('mongoose');

const CATEGORIES = [
  'monthly_chada',
  'donation',
  'emergency_fund',
  'special_fund',
  'other_income',
  'expense',
];

const PAYMENT_METHODS = ['cash', 'bkash', 'nagad', 'rocket', 'bank', 'other'];

const TransactionSchema = new mongoose.Schema(
  {
    transactionId: { type: String, required: true, unique: true },
    type: { type: String, enum: ['income', 'expense'], required: true },
    category: { type: String, enum: CATEGORIES, required: true },

    // For income tied to a specific member (chada, personal donation)
    member: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

    amount: { type: Number, required: [true, 'পরিমাণ আবশ্যক'], min: [1, 'পরিমাণ শূন্যের বেশি হতে হবে'] },

    // Only relevant for category = monthly_chada, format 'YYYY-MM'
    month: { type: String, default: null, match: /^\d{4}-(0[1-9]|1[0-2])$/ },

    donationType: { type: String, default: '' }, // e.g. Zakat, Sadaqah, General
    purpose: { type: String, default: '' }, // for expense: what it was spent on
    description: { type: String, default: '' },

    paymentMethod: { type: String, enum: PAYMENT_METHODS, default: 'cash' },
    date: { type: Date, default: Date.now },

    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    isVoided: { type: Boolean, default: false },
    voidedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    voidedAt: { type: Date, default: null },
    voidReason: { type: String, default: '' },
  },
  { timestamps: true }
);

TransactionSchema.index({ transactionId: 1 });
TransactionSchema.index({ member: 1, category: 1, month: 1 });
TransactionSchema.index({ type: 1, category: 1, date: -1 });

TransactionSchema.statics.CATEGORIES = CATEGORIES;
TransactionSchema.statics.PAYMENT_METHODS = PAYMENT_METHODS;

module.exports = mongoose.model('Transaction', TransactionSchema);
