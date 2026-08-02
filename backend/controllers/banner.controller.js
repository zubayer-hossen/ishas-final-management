const Banner = require('../models/Banner');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const { uploadBufferToCloudinary, deleteFromCloudinary } = require('../utils/cloudinaryUpload');

/**
 * @route GET /api/v1/banners
 * @access public — only active banners, for the homepage slider
 */
const getPublicBanners = asyncHandler(async (req, res) => {
  const banners = await Banner.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
  return res.status(200).json(new ApiResponse(200, banners, 'ব্যানার তালিকা'));
});

/**
 * @route GET /api/v1/banners/admin
 * @access owner — every banner, active or not, for the management panel
 */
const getAllBannersAdmin = asyncHandler(async (req, res) => {
  const banners = await Banner.find().sort({ order: 1, createdAt: -1 });
  return res.status(200).json(new ApiResponse(200, banners, 'সব ব্যানার'));
});

/**
 * @route POST /api/v1/banners
 * @access owner
 */
const createBanner = asyncHandler(async (req, res) => {
  const { title, subtitle, buttonText, linkUrl, order, isActive } = req.body;

  if (!req.file) throw ApiError.badRequest('ব্যানারের ছবি আবশ্যক');

  const result = await uploadBufferToCloudinary(req.file.buffer, 'ishas/banners');

  const banner = await Banner.create({
    title,
    subtitle,
    buttonText,
    linkUrl,
    order: order || 0,
    isActive: isActive ?? true,
    image: { url: result.secure_url, publicId: result.public_id },
    createdBy: req.user._id,
  });

  return res.status(201).json(new ApiResponse(201, banner, 'ব্যানার তৈরি করা হয়েছে'));
});

/**
 * @route PATCH /api/v1/banners/:id
 * @access owner
 */
const updateBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.findById(req.params.id);
  if (!banner) throw ApiError.notFound('ব্যানার পাওয়া যায়নি');

  const fields = ['title', 'subtitle', 'buttonText', 'linkUrl', 'order', 'isActive'];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) banner[f] = req.body[f];
  });

  if (req.file) {
    const oldPublicId = banner.image?.publicId;
    const result = await uploadBufferToCloudinary(req.file.buffer, 'ishas/banners');
    banner.image = { url: result.secure_url, publicId: result.public_id };
    if (oldPublicId) await deleteFromCloudinary(oldPublicId);
  }

  await banner.save();

  return res.status(200).json(new ApiResponse(200, banner, 'ব্যানার আপডেট হয়েছে'));
});

/**
 * @route DELETE /api/v1/banners/:id
 * @access owner
 */
const deleteBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.findById(req.params.id);
  if (!banner) throw ApiError.notFound('ব্যানার পাওয়া যায়নি');

  if (banner.image?.publicId) await deleteFromCloudinary(banner.image.publicId);
  await banner.deleteOne();

  return res.status(200).json(new ApiResponse(200, null, 'ব্যানার মুছে ফেলা হয়েছে'));
});

module.exports = { getPublicBanners, getAllBannersAdmin, createBanner, updateBanner, deleteBanner };
