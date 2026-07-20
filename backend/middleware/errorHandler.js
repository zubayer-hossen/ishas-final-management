const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

/**
 * Converts known error types (Mongoose, JWT, etc.) into ApiError instances
 * so the response shape is always consistent.
 */
const normalizeError = (err) => {
  if (err instanceof ApiError) return err;

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    return ApiError.badRequest(`অবৈধ ${err.path}: ${err.value}`);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return ApiError.conflict(`এই ${field} ইতিমধ্যে ব্যবহৃত হয়েছে`);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => e.message);
    return ApiError.badRequest('ভ্যালিডেশন ব্যর্থ হয়েছে', errors);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return ApiError.unauthorized('অবৈধ টোকেন');
  }
  if (err.name === 'TokenExpiredError') {
    return ApiError.unauthorized('টোকেনের মেয়াদ শেষ হয়ে গেছে');
  }

  return ApiError.internal(err.message || 'সার্ভারে একটি সমস্যা হয়েছে');
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const apiError = normalizeError(err);

  if (!apiError.isOperational) {
    logger.error(`${req.method} ${req.originalUrl} -> ${err.stack || err.message}`);
  } else {
    logger.warn(`${req.method} ${req.originalUrl} -> ${apiError.message}`);
  }

  res.status(apiError.statusCode).json({
    success: false,
    message: apiError.message,
    errors: apiError.errors || [],
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

const notFound = (req, res, next) => {
  next(ApiError.notFound(`রুট পাওয়া যায়নি: ${req.originalUrl}`));
};

module.exports = { errorHandler, notFound };
