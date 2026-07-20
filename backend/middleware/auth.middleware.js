const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { verifyAccessToken } = require('../utils/token');
const User = require('../models/User');

/**
 * Verifies the access token (from Authorization header or cookie)
 * and attaches the authenticated user to req.user.
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    throw ApiError.unauthorized('অনুগ্রহ করে লগইন করুন');
  }

  const decoded = verifyAccessToken(token);

  const user = await User.findById(decoded.id);
  if (!user || !user.isActive) {
    throw ApiError.unauthorized('ব্যবহারকারী পাওয়া যায়নি অথবা একাউন্ট নিষ্ক্রিয়');
  }

  req.user = user;
  next();
});

/**
 * Restricts access to specific roles.
 * Usage: authorize('owner', 'super_admin')
 */
const authorize = (...allowedRoles) => (req, res, next) => {
  if (!req.user || !allowedRoles.includes(req.user.role)) {
    return next(ApiError.forbidden('এই কাজটি করার অনুমতি আপনার নেই'));
  }
  next();
};

/**
 * Allows access only if the user's membership is active.
 * Useful for gating dashboard features from pending/rejected members.
 */
const requireActiveMembership = (req, res, next) => {
  if (req.user.membershipStatus !== 'active') {
    return next(ApiError.forbidden('আপনার সদস্যপদ এখনো সক্রিয় করা হয়নি'));
  }
  next();
};

module.exports = { protect, authorize, requireActiveMembership };
