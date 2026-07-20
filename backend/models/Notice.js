const mongoose = require('mongoose');

const NOTICE_CATEGORIES = ['general', 'meeting', 'financial', 'event', 'urgent', 'academic'];

const NoticeSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'শিরোনাম আবশ্যক'], trim: true, maxlength: 200 },
    content: { type: String, required: [true, 'বিস্তারিত আবশ্যক'] },
    category: { type: String, enum: NOTICE_CATEGORIES, default: 'general' },
    isPinned: { type: Boolean, default: false },

    attachments: [
      {
        url: String,
        publicId: String,
        fileType: { type: String, enum: ['image', 'pdf'] },
        originalName: String,
      },
    ],

    targetRoles: {
      type: [String],
      enum: ['owner', 'super_admin', 'admin', 'treasurer', 'committee_member', 'general_member', 'guest'],
      default: [], // empty = visible to everyone
    },

    emailNotificationSent: { type: Boolean, default: false },
    publishedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

NoticeSchema.index({ isPinned: -1, createdAt: -1 });
NoticeSchema.index({ category: 1 });

NoticeSchema.statics.CATEGORIES = NOTICE_CATEGORIES;

module.exports = mongoose.model('Notice', NoticeSchema);
