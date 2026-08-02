const mongoose = require('mongoose');

const BannerSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'শিরোনাম আবশ্যক'], trim: true, maxlength: 150 },
    subtitle: { type: String, trim: true, maxlength: 300, default: '' },

    image: {
      url: { type: String, required: true },
      publicId: { type: String, required: true },
    },

    buttonText: { type: String, trim: true, maxlength: 40, default: '' },
    linkUrl: { type: String, trim: true, default: '' }, // e.g. /register, /blog, or an external URL

    order: { type: Number, default: 0 }, // lower shows first
    isActive: { type: Boolean, default: true },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

BannerSchema.index({ isActive: 1, order: 1 });

module.exports = mongoose.model('Banner', BannerSchema);
