const Album = require('../models/Album');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const { getPagination, buildPaginationMeta } = require('../utils/pagination');
const { uploadBufferToCloudinary, deleteFromCloudinary } = require('../utils/cloudinaryUpload');

const STAFF_ROLES = ['owner', 'super_admin', 'admin', 'committee_member'];

/**
 * @route POST /api/v1/gallery/albums
 * @access owner, super_admin, admin, committee_member
 */
const createAlbum = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  let coverImage = { url: '', publicId: '' };
  let images = [];

  if (req.files?.length) {
    const uploaded = await Promise.all(
      req.files.map((file) => uploadBufferToCloudinary(file.buffer, 'ishas/gallery'))
    );
    images = uploaded.map((result) => ({ url: result.secure_url, publicId: result.public_id }));
    coverImage = { url: images[0].url, publicId: images[0].publicId };
  }

  const album = await Album.create({
    title,
    description,
    coverImage,
    images,
    createdBy: req.user._id,
  });

  return res.status(201).json(new ApiResponse(201, album, 'অ্যালবাম তৈরি করা হয়েছে'));
});

/**
 * @route GET /api/v1/gallery/albums
 */
const getAllAlbums = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query, 12);

  const filter = { isActive: true };

  const [albums, total] = await Promise.all([
    Album.find(filter)
      .select('-images -videos')
      .populate('createdBy', 'fullName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Album.countDocuments(filter),
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, { albums, pagination: buildPaginationMeta(total, page, limit) }, 'অ্যালবামের তালিকা'));
});

/**
 * @route GET /api/v1/gallery/albums/:id
 */
const getAlbumById = asyncHandler(async (req, res) => {
  const album = await Album.findById(req.params.id).populate('createdBy', 'fullName');
  if (!album || !album.isActive) throw ApiError.notFound('অ্যালবাম পাওয়া যায়নি');
  return res.status(200).json(new ApiResponse(200, album, 'অ্যালবামের বিস্তারিত'));
});

/**
 * @route PATCH /api/v1/gallery/albums/:id
 */
const updateAlbum = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  const album = await Album.findById(req.params.id);
  if (!album) throw ApiError.notFound('অ্যালবাম পাওয়া যায়নি');

  if (title !== undefined) album.title = title;
  if (description !== undefined) album.description = description;
  await album.save();

  return res.status(200).json(new ApiResponse(200, album, 'অ্যালবাম আপডেট হয়েছে'));
});

/**
 * @route POST /api/v1/gallery/albums/:id/images
 * @access owner, super_admin, admin, committee_member
 */
const addImagesToAlbum = asyncHandler(async (req, res) => {
  const album = await Album.findById(req.params.id);
  if (!album) throw ApiError.notFound('অ্যালবাম পাওয়া যায়নি');

  if (!req.files?.length) throw ApiError.badRequest('কোনো ছবি পাওয়া যায়নি');

  const uploaded = await Promise.all(
    req.files.map((file) => uploadBufferToCloudinary(file.buffer, 'ishas/gallery'))
  );

  const newImages = uploaded.map((result) => ({ url: result.secure_url, publicId: result.public_id }));
  album.images.push(...newImages);

  if (!album.coverImage?.url) {
    album.coverImage = { url: newImages[0].url, publicId: newImages[0].publicId };
  }

  await album.save();

  return res.status(200).json(new ApiResponse(200, album, 'ছবি যুক্ত করা হয়েছে'));
});

/**
 * @route DELETE /api/v1/gallery/albums/:id/images/:imageId
 */
const deleteImage = asyncHandler(async (req, res) => {
  const { id, imageId } = req.params;
  const album = await Album.findById(id);
  if (!album) throw ApiError.notFound('অ্যালবাম পাওয়া যায়নি');

  const image = album.images.id(imageId);
  if (!image) throw ApiError.notFound('ছবি পাওয়া যায়নি');

  await deleteFromCloudinary(image.publicId);
  image.deleteOne();
  await album.save();

  return res.status(200).json(new ApiResponse(200, album, 'ছবি মুছে ফেলা হয়েছে'));
});

/**
 * @route POST /api/v1/gallery/albums/:id/videos
 * body: { url, title, thumbnailUrl }
 */
const addVideo = asyncHandler(async (req, res) => {
  const { url, title, thumbnailUrl } = req.body;
  const album = await Album.findById(req.params.id);
  if (!album) throw ApiError.notFound('অ্যালবাম পাওয়া যায়নি');

  album.videos.push({ url, title, thumbnailUrl });
  await album.save();

  return res.status(200).json(new ApiResponse(200, album, 'ভিডিও যুক্ত করা হয়েছে'));
});

/**
 * @route DELETE /api/v1/gallery/albums/:id/videos/:videoId
 */
const deleteVideo = asyncHandler(async (req, res) => {
  const { id, videoId } = req.params;
  const album = await Album.findById(id);
  if (!album) throw ApiError.notFound('অ্যালবাম পাওয়া যায়নি');

  const video = album.videos.id(videoId);
  if (!video) throw ApiError.notFound('ভিডিও পাওয়া যায়নি');

  video.deleteOne();
  await album.save();

  return res.status(200).json(new ApiResponse(200, album, 'ভিডিও মুছে ফেলা হয়েছে'));
});

/**
 * @route DELETE /api/v1/gallery/albums/:id
 */
const deleteAlbum = asyncHandler(async (req, res) => {
  const album = await Album.findById(req.params.id);
  if (!album) throw ApiError.notFound('অ্যালবাম পাওয়া যায়নি');

  await Promise.all(album.images.map((img) => deleteFromCloudinary(img.publicId)));

  album.isActive = false;
  await album.save({ validateBeforeSave: false });

  return res.status(200).json(new ApiResponse(200, null, 'অ্যালবাম মুছে ফেলা হয়েছে'));
});

module.exports = {
  createAlbum,
  getAllAlbums,
  getAlbumById,
  updateAlbum,
  addImagesToAlbum,
  deleteImage,
  addVideo,
  deleteVideo,
  deleteAlbum,
};
