const mongoose = require('mongoose');

const BLOG_CATEGORIES = ['news', 'announcement', 'story', 'opinion', 'guide', 'other'];

const CommentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true, trim: true, maxlength: 1000 },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const BlogSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'শিরোনাম আবশ্যক'], trim: true, maxlength: 200 },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    excerpt: { type: String, trim: true, maxlength: 300, default: '' },
    content: { type: String, required: [true, 'কন্টেন্ট আবশ্যক'] }, // rich HTML content
    coverImage: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    category: { type: String, enum: BLOG_CATEGORIES, default: 'other' },
    tags: { type: [String], default: [] },

    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    publishedAt: { type: Date, default: null },

    views: { type: Number, default: 0 },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: { type: [CommentSchema], default: [] },

    // SEO
    metaTitle: { type: String, default: '' },
    metaDescription: { type: String, default: '' },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

BlogSchema.index({ status: 1, publishedAt: -1 });
BlogSchema.index({ tags: 1 });
BlogSchema.index({ title: 'text', content: 'text', tags: 'text' });

BlogSchema.virtual('likeCount').get(function () {
  return this.likes?.length || 0;
});
BlogSchema.virtual('commentCount').get(function () {
  return this.comments?.length || 0;
});
BlogSchema.set('toJSON', { virtuals: true });
BlogSchema.set('toObject', { virtuals: true });

BlogSchema.statics.CATEGORIES = BLOG_CATEGORIES;

module.exports = mongoose.model('Blog', BlogSchema);
