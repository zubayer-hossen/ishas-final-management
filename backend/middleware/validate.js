const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

/**
 * Runs after express-validator rules; throws a formatted ApiError
 * if any validation rule failed.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formatted = errors.array().map((e) => e.msg);
    throw ApiError.badRequest('ভ্যালিডেশন ব্যর্থ হয়েছে', formatted);
  }
  next();
};

module.exports = validate;
