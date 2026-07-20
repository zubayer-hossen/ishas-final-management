const cloudinary = require('../config/cloudinary');
const ApiError = require('./ApiError');

/**
 * Uploads a file buffer (from multer memory storage) to Cloudinary
 * using an upload stream, so nothing touches disk.
 * @param {Buffer} buffer
 * @param {string} folder - Cloudinary folder, e.g. 'ishas/profile-pictures'
 */
const uploadBufferToCloudinary = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        transformation: [{ width: 800, height: 800, crop: 'limit', quality: 'auto' }],
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(buffer);
  });
};

const deleteFromCloudinary = async (publicId) => {
  if (!publicId) return null;
  try {
    return await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    throw ApiError.internal(`ছবি ডিলিট করতে সমস্যা হয়েছে: ${error.message}`);
  }
};

module.exports = { uploadBufferToCloudinary, deleteFromCloudinary };
