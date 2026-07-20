const Blog = require('../models/Blog');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const { getPagination, buildPaginationMeta } = require('../utils/pagination');
const { generateUniqueSlug } = require('../utils/slugify');
const { uploadBufferToCloudinary, deleteFromCloudinary } = require('../utils/cloudinaryUpload');

const STAFF_ROLES = ['owner', 'super_admin', 'admin', 'committee_member'];

/**
 * @route POST /api/v1/blogs
 * @access owner, super_admin, admin, committee_member
 */
const createBlog = asyncHandler(async (req, res) => {
  const { title, excerpt, content, category, tags, status, metaTitle, metaDescription } = req.body;

  const slug = await generateUniqueSlug(title);

  let coverImage = { url: '', publicId: '' };
  if (req.file) {
    const result = await uploadBufferToCloudinary(req.file.buffer, 'ishas/blogs');
    coverImage = { url: result.secure_url, publicId: result.public_id };
  }

  const blog = await Blog.create({
    title,
    slug,
    excerpt,
    content,
    category,
    tags: Array.isArray(tags) ? tags : (tags || '').split(',').map((t) => t.trim()).filter(Boolean),
    coverImage,
    author: req.user._id,
    status: status === 'published' ? 'published' : 'draft',
    publishedAt: status === 'published' ? new Date() : null,
    metaTitle,
    metaDescription,
  });

  return res.status(201).json(new ApiResponse(201, blog, 'ব্লগ তৈরি করা হয়েছে'));
});

/**
 * @route GET /api/v1/blogs
 * Public: only published posts. Staff: can see drafts via ?status=draft
 */
const getAllBlogs = asyncHandler(async (req, res) => {
  const { category, tag, search, status } = req.query;
  const { page, limit, skip } = getPagination(req.query, 12);

  const filter = { isActive: true };

  if (STAFF_ROLES.includes(req.user?.role) && status) {
    filter.status = status;
  } else {
    filter.status = 'published';
  }

  if (category) filter.category = category;
  if (tag) filter.tags = tag;
  if (search) filter.$text = { $search: search };

  const [blogs, total] = await Promise.all([
    Blog.find(filter)
      .populate('author', 'fullName profilePicture')
      .select('-content -comments')
      .sort(search ? { score: { $meta: 'textScore' } } : { publishedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Blog.countDocuments(filter),
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, { blogs, pagination: buildPaginationMeta(total, page, limit) }, 'ব্লগের তালিকা'));
});

/**
 * @route GET /api/v1/blogs/:slug
 */
const getBlogBySlug = asyncHandler(async (req, res) => {
  const blog = await Blog.findOne({ slug: req.params.slug, isActive: true })
    .populate('author', 'fullName profilePicture')
    .populate('comments.user', 'fullName profilePicture');

  if (!blog) throw ApiError.notFound('ব্লগ পাওয়া যায়নি');

  if (blog.status === 'draft' && !STAFF_ROLES.includes(req.user?.role)) {
    throw ApiError.notFound('ব্লগ পাওয়া যায়নি');
  }

  blog.views += 1;
  await blog.save({ validateBeforeSave: false });

  return res.status(200).json(new ApiResponse(200, blog, 'ব্লগের বিস্তারিত'));
});

/**
 * @route PATCH /api/v1/blogs/:id
 * @access owner, super_admin, admin, or the original author
 */
const updateBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) throw ApiError.notFound('ব্লগ পাওয়া যায়নি');

  const canEdit =
    ['owner', 'super_admin', 'admin'].includes(req.user.role) || blog.author.toString() === req.user._id.toString();
  if (!canEdit) throw ApiError.forbidden('এই ব্লগ সম্পাদনা করার অনুমতি আপনার নেই');

  const { title, excerpt, content, category, tags, status, metaTitle, metaDescription } = req.body;

  if (title !== undefined && title !== blog.title) {
    blog.title = title;
    blog.slug = await generateUniqueSlug(title);
  }
  if (excerpt !== undefined) blog.excerpt = excerpt;
  if (content !== undefined) blog.content = content;
  if (category !== undefined) blog.category = category;
  if (tags !== undefined) {
    blog.tags = Array.isArray(tags) ? tags : tags.split(',').map((t) => t.trim()).filter(Boolean);
  }
  if (metaTitle !== undefined) blog.metaTitle = metaTitle;
  if (metaDescription !== undefined) blog.metaDescription = metaDescription;

  if (status && status !== blog.status) {
    blog.status = status;
    if (status === 'published' && !blog.publishedAt) blog.publishedAt = new Date();
  }

  if (req.file) {
    if (blog.coverImage?.publicId) await deleteFromCloudinary(blog.coverImage.publicId);
    const result = await uploadBufferToCloudinary(req.file.buffer, 'ishas/blogs');
    blog.coverImage = { url: result.secure_url, publicId: result.public_id };
  }

  await blog.save();

  return res.status(200).json(new ApiResponse(200, blog, 'ব্লগ আপডেট হয়েছে'));
});

/**
 * @route DELETE /api/v1/blogs/:id
 */
const deleteBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) throw ApiError.notFound('ব্লগ পাওয়া যায়নি');

  const canDelete =
    ['owner', 'super_admin', 'admin'].includes(req.user.role) || blog.author.toString() === req.user._id.toString();
  if (!canDelete) throw ApiError.forbidden('এই ব্লগ মুছে ফেলার অনুমতি আপনার নেই');

  if (blog.coverImage?.publicId) await deleteFromCloudinary(blog.coverImage.publicId);
  blog.isActive = false;
  await blog.save({ validateBeforeSave: false });

  return res.status(200).json(new ApiResponse(200, null, 'ব্লগ মুছে ফেলা হয়েছে'));
});

/**
 * @route POST /api/v1/blogs/:id/like
 * @access self (toggles like/unlike)
 */
const toggleLike = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) throw ApiError.notFound('ব্লগ পাওয়া যায়নি');

  const alreadyLiked = blog.likes.some((id) => id.toString() === req.user._id.toString());

  if (alreadyLiked) {
    blog.likes = blog.likes.filter((id) => id.toString() !== req.user._id.toString());
  } else {
    blog.likes.push(req.user._id);
  }

  await blog.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, { liked: !alreadyLiked, likeCount: blog.likes.length }, alreadyLiked ? 'লাইক সরানো হয়েছে' : 'লাইক করা হয়েছে'));
});

/**
 * @route POST /api/v1/blogs/:id/comments
 */
const addComment = asyncHandler(async (req, res) => {
  const { text } = req.body;
  const blog = await Blog.findById(req.params.id);
  if (!blog) throw ApiError.notFound('ব্লগ পাওয়া যায়নি');

  blog.comments.push({ user: req.user._id, text });
  await blog.save({ validateBeforeSave: false });

  const populated = await blog.populate('comments.user', 'fullName profilePicture');
  const newComment = populated.comments[populated.comments.length - 1];

  return res.status(201).json(new ApiResponse(201, newComment, 'মন্তব্য যুক্ত করা হয়েছে'));
});

/**
 * @route DELETE /api/v1/blogs/:id/comments/:commentId
 */
const deleteComment = asyncHandler(async (req, res) => {
  const { id, commentId } = req.params;
  const blog = await Blog.findById(id);
  if (!blog) throw ApiError.notFound('ব্লগ পাওয়া যায়নি');

  const comment = blog.comments.id(commentId);
  if (!comment) throw ApiError.notFound('মন্তব্য পাওয়া যায়নি');

  const canDelete =
    ['owner', 'super_admin', 'admin'].includes(req.user.role) || comment.user.toString() === req.user._id.toString();
  if (!canDelete) throw ApiError.forbidden('এই মন্তব্য মুছে ফেলার অনুমতি আপনার নেই');

  comment.deleteOne();
  await blog.save({ validateBeforeSave: false });

  return res.status(200).json(new ApiResponse(200, null, 'মন্তব্য মুছে ফেলা হয়েছে'));
});

module.exports = {
  createBlog,
  getAllBlogs,
  getBlogBySlug,
  updateBlog,
  deleteBlog,
  toggleLike,
  addComment,
  deleteComment,
};
