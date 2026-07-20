const multer = require('multer');
const ApiError = require('../utils/ApiError');

const storage = multer.memoryStorage();

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

const imageFileFilter = (req, file, cb) => {
  if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    return cb(ApiError.badRequest('শুধুমাত্র JPG, PNG অথবা WEBP ছবি আপলোড করা যাবে'), false);
  }
  cb(null, true);
};

const uploadImage = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

const ALLOWED_DOC_TYPES = ['application/pdf', ...ALLOWED_IMAGE_TYPES];

const documentFileFilter = (req, file, cb) => {
  if (!ALLOWED_DOC_TYPES.includes(file.mimetype)) {
    return cb(ApiError.badRequest('শুধুমাত্র PDF অথবা ছবি ফরম্যাট আপলোড করা যাবে'), false);
  }
  cb(null, true);
};

const uploadDocument = multer({
  storage,
  fileFilter: documentFileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

module.exports = { uploadImage, uploadDocument };
