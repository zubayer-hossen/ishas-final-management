/**
 * Wraps async route handlers/controllers so thrown errors
 * are automatically forwarded to Express's error middleware.
 */
const asyncHandler = (requestHandler) => (req, res, next) => {
  Promise.resolve(requestHandler(req, res, next)).catch(next);
};

module.exports = asyncHandler;
