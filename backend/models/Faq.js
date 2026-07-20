const mongoose = require('mongoose');

const FaqSchema = new mongoose.Schema(
  {
    question: { type: String, required: [true, 'প্রশ্ন আবশ্যক'], trim: true, maxlength: 300 },
    answer: { type: String, required: [true, 'উত্তর আবশ্যক'], trim: true, maxlength: 2000 },
    category: { type: String, default: 'general', trim: true },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

FaqSchema.index({ category: 1, order: 1 });

module.exports = mongoose.model('Faq', FaqSchema);
