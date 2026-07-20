const mongoose = require('mongoose');

const ImageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    caption: { type: String, default: '' },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const VideoSchema = new mongoose.Schema(
  {
    url: { type: String, required: true }, // e.g. YouTube/Vimeo embed URL
    title: { type: String, default: '' },
    thumbnailUrl: { type: String, default: '' },
    addedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const AlbumSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'অ্যালবামের শিরোনাম আবশ্যক'], trim: true, maxlength: 150 },
    description: { type: String, default: '' },
    coverImage: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    images: { type: [ImageSchema], default: [] },
    videos: { type: [VideoSchema], default: [] },

    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

AlbumSchema.index({ createdAt: -1 });

AlbumSchema.virtual('imageCount').get(function () {
  return this.images.length;
});
AlbumSchema.set('toJSON', { virtuals: true });
AlbumSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Album', AlbumSchema);
