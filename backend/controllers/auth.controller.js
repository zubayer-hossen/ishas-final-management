const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  generateOTP,
  hashToken,
  generateSecureToken,
} = require('../utils/token');
const sendEmail = require('../utils/sendEmail');
const otpEmail = require('../templates/emails/otpEmail');
const resetPasswordEmail = require('../templates/emails/resetPasswordEmail');
const env = require('../config/env');

const REFRESH_COOKIE_NAME = 'refreshToken';
const ACCESS_COOKIE_NAME = 'accessToken';

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_TIME_MS = 15 * 60 * 1000; // 15 minutes

const cookieOptions = (maxAgeMs) => ({
  httpOnly: true,
  secure: env.nodeEnv === 'production',
  sameSite: 'strict',
  maxAge: maxAgeMs,
});

const parseExpiryToMs = (expiryStr, fallbackMs) => {
  const match = /^(\d+)([smhd])$/.exec(expiryStr || '');
  if (!match) return fallbackMs;
  const value = Number(match[1]);
  const unit = match[2];
  const multipliers = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  return value * multipliers[unit];
};

const issueTokensAndSetCookies = async (res, user, req) => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  const refreshExpiresMs = parseExpiryToMs(env.jwt.refreshExpires, 30 * 86400000);

  user.sessions.push({
    refreshTokenHash: hashToken(refreshToken),
    userAgent: req.headers['user-agent'] || '',
    ip: req.ip,
    expiresAt: new Date(Date.now() + refreshExpiresMs),
  });

  // Keep only the most recent 10 sessions per user
  if (user.sessions.length > 10) {
    user.sessions = user.sessions.slice(-10);
  }

  await user.save({ validateBeforeSave: false });

  res.cookie(ACCESS_COOKIE_NAME, accessToken, cookieOptions(parseExpiryToMs(env.jwt.accessExpires, 900000)));
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, cookieOptions(refreshExpiresMs));

  return { accessToken, refreshToken };
};

/**
 * @route POST /api/v1/auth/register
 */
const register = asyncHandler(async (req, res) => {
  const { fullName, email, phone, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw ApiError.conflict('এই ইমেইল দিয়ে ইতিমধ্যে একটি একাউন্ট আছে');
  }

  const { otp, hashedOtp } = generateOTP();

  const user = await User.create({
    fullName,
    email,
    phone,
    password,
    emailOtpHash: hashedOtp,
    emailOtpExpires: new Date(Date.now() + env.otpExpiresMinutes * 60 * 1000),
  });

  await sendEmail({
    to: user.email,
    subject: 'আপনার ইমেইল ভেরিফাই করুন — ISHAS Organization',
    html: otpEmail({ name: user.fullName, otp, minutes: env.otpExpiresMinutes }),
  });

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { email: user.email },
        'রেজিস্ট্রেশন সফল হয়েছে। আপনার ইমেইলে পাঠানো OTP দিয়ে ভেরিফাই করুন।'
      )
    );
});

/**
 * @route POST /api/v1/auth/verify-otp
 */
const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email }).select('+emailOtpHash +emailOtpExpires');
  if (!user) throw ApiError.notFound('ব্যবহারকারী পাওয়া যায়নি');

  if (user.isEmailVerified) {
    throw ApiError.badRequest('ইমেইল ইতিমধ্যে ভেরিফাই করা হয়েছে');
  }

  if (!user.emailOtpHash || !user.emailOtpExpires || user.emailOtpExpires < new Date()) {
    throw ApiError.badRequest('OTP এর মেয়াদ শেষ হয়ে গেছে, নতুন OTP নিন');
  }

  const hashedInputOtp = hashToken(otp);
  if (hashedInputOtp !== user.emailOtpHash) {
    throw ApiError.badRequest('ভুল OTP দেওয়া হয়েছে');
  }

  user.isEmailVerified = true;
  user.emailOtpHash = undefined;
  user.emailOtpExpires = undefined;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, null, 'ইমেইল সফলভাবে ভেরিফাই হয়েছে। এখন আপনি লগইন করতে পারবেন।'));
});

/**
 * @route POST /api/v1/auth/resend-otp
 */
const resendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) throw ApiError.notFound('ব্যবহারকারী পাওয়া যায়নি');
  if (user.isEmailVerified) throw ApiError.badRequest('ইমেইল ইতিমধ্যে ভেরিফাই করা হয়েছে');

  const { otp, hashedOtp } = generateOTP();
  user.emailOtpHash = hashedOtp;
  user.emailOtpExpires = new Date(Date.now() + env.otpExpiresMinutes * 60 * 1000);
  await user.save({ validateBeforeSave: false });

  await sendEmail({
    to: user.email,
    subject: 'নতুন OTP কোড — ISHAS Organization',
    html: otpEmail({ name: user.fullName, otp, minutes: env.otpExpiresMinutes }),
  });

  return res.status(200).json(new ApiResponse(200, null, 'নতুন OTP পাঠানো হয়েছে'));
});

/**
 * @route POST /api/v1/auth/login
 */
const login = asyncHandler(async (req, res) => {
  const { email, password, rememberMe } = req.body;

  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    throw ApiError.unauthorized('ভুল ইমেইল অথবা পাসওয়ার্ড');
  }

  if (user.isLocked) {
    const minutesLeft = Math.ceil((user.lockUntil - Date.now()) / 60000);
    throw ApiError.tooMany(`অনেকবার ভুল চেষ্টার কারণে একাউন্ট লক করা হয়েছে। ${minutesLeft} মিনিট পর চেষ্টা করুন।`);
  }

  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    user.failedLoginAttempts += 1;
    if (user.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
      user.lockUntil = new Date(Date.now() + LOCK_TIME_MS);
    }
    user.loginHistory.push({
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      success: false,
    });
    await user.save({ validateBeforeSave: false });
    throw ApiError.unauthorized('ভুল ইমেইল অথবা পাসওয়ার্ড');
  }

  if (!user.isEmailVerified) {
    throw ApiError.forbidden('অনুগ্রহ করে প্রথমে আপনার ইমেইল ভেরিফাই করুন');
  }

  if (!user.isActive) {
    throw ApiError.forbidden('আপনার একাউন্ট নিষ্ক্রিয় করা হয়েছে। এডমিনের সাথে যোগাযোগ করুন।');
  }

  user.failedLoginAttempts = 0;
  user.lockUntil = null;
  user.lastLoginAt = new Date();
  user.loginHistory.push({ ip: req.ip, userAgent: req.headers['user-agent'], success: true });
  if (user.loginHistory.length > 20) user.loginHistory = user.loginHistory.slice(-20);

  const { accessToken, refreshToken } = await issueTokensAndSetCookies(res, user, req);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user: user.toSafeObject(),
        accessToken,
        ...(rememberMe ? { refreshToken } : {}),
      },
      'লগইন সফল হয়েছে'
    )
  );
});

/**
 * @route POST /api/v1/auth/refresh-token
 */
const refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE_NAME] || req.body.refreshToken;
  if (!token) throw ApiError.unauthorized('রিফ্রেশ টোকেন পাওয়া যায়নি');

  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch (err) {
    throw ApiError.unauthorized('রিফ্রেশ টোকেন অবৈধ অথবা মেয়াদোত্তীর্ণ');
  }

  const user = await User.findById(decoded.id);
  if (!user) throw ApiError.unauthorized('ব্যবহারকারী পাওয়া যায়নি');

  if (decoded.tokenVersion !== user.tokenVersion) {
    throw ApiError.unauthorized('সেশনের মেয়াদ শেষ হয়ে গেছে, আবার লগইন করুন');
  }

  const tokenHash = hashToken(token);
  const sessionExists = user.sessions.some((s) => s.refreshTokenHash === tokenHash);
  if (!sessionExists) {
    throw ApiError.unauthorized('অবৈধ সেশন, আবার লগইন করুন');
  }

  // Rotate: remove old session, issue new tokens
  user.sessions = user.sessions.filter((s) => s.refreshTokenHash !== tokenHash);
  const { accessToken, refreshToken: newRefreshToken } = await issueTokensAndSetCookies(res, user, req);

  return res
    .status(200)
    .json(new ApiResponse(200, { accessToken, refreshToken: newRefreshToken }, 'টোকেন রিফ্রেশ হয়েছে'));
});

/**
 * @route POST /api/v1/auth/logout
 */
const logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE_NAME];

  if (token && req.user) {
    const tokenHash = hashToken(token);
    req.user.sessions = req.user.sessions.filter((s) => s.refreshTokenHash !== tokenHash);
    await req.user.save({ validateBeforeSave: false });
  }

  res.clearCookie(ACCESS_COOKIE_NAME);
  res.clearCookie(REFRESH_COOKIE_NAME);

  return res.status(200).json(new ApiResponse(200, null, 'লগআউট সফল হয়েছে'));
});

/**
 * @route POST /api/v1/auth/logout-all-devices
 */
const logoutAllDevices = asyncHandler(async (req, res) => {
  req.user.sessions = [];
  req.user.tokenVersion += 1;
  await req.user.save({ validateBeforeSave: false });

  res.clearCookie(ACCESS_COOKIE_NAME);
  res.clearCookie(REFRESH_COOKIE_NAME);

  return res.status(200).json(new ApiResponse(200, null, 'সব ডিভাইস থেকে লগআউট করা হয়েছে'));
});

/**
 * @route POST /api/v1/auth/forgot-password
 */
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  // Respond identically whether or not the user exists to avoid email enumeration
  const genericResponse = new ApiResponse(
    200,
    null,
    'যদি এই ইমেইলটি নিবন্ধিত থাকে, তাহলে একটি পাসওয়ার্ড রিসেট লিংক পাঠানো হয়েছে।'
  );

  if (!user) {
    return res.status(200).json(genericResponse);
  }

  const { rawToken, hashedToken } = generateSecureToken();
  user.passwordResetTokenHash = hashedToken;
  user.passwordResetExpires = new Date(Date.now() + env.otpExpiresMinutes * 60 * 1000);
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${env.clientUrl}/reset-password?token=${rawToken}&email=${encodeURIComponent(email)}`;

  await sendEmail({
    to: user.email,
    subject: 'পাসওয়ার্ড রিসেট অনুরোধ — ISHAS Organization',
    html: resetPasswordEmail({ name: user.fullName, resetUrl, minutes: env.otpExpiresMinutes }),
  });

  return res.status(200).json(genericResponse);
});

/**
 * @route POST /api/v1/auth/reset-password
 */
const resetPassword = asyncHandler(async (req, res) => {
  const { email, token, password } = req.body;

  const user = await User.findOne({ email }).select('+passwordResetTokenHash +passwordResetExpires');
  if (!user || !user.passwordResetTokenHash || !user.passwordResetExpires) {
    throw ApiError.badRequest('রিসেট লিংকটি অবৈধ অথবা মেয়াদোত্তীর্ণ');
  }

  if (user.passwordResetExpires < new Date()) {
    throw ApiError.badRequest('রিসেট লিংকের মেয়াদ শেষ হয়ে গেছে');
  }

  const hashedInputToken = hashToken(token);
  if (hashedInputToken !== user.passwordResetTokenHash) {
    throw ApiError.badRequest('রিসেট লিংকটি অবৈধ');
  }

  user.password = password;
  user.passwordResetTokenHash = undefined;
  user.passwordResetExpires = undefined;
  user.tokenVersion += 1; // invalidate all existing sessions
  user.sessions = [];
  await user.save();

  return res.status(200).json(new ApiResponse(200, null, 'পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে। আবার লগইন করুন।'));
});

/**
 * @route POST /api/v1/auth/change-password
 */
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) throw ApiError.unauthorized('বর্তমান পাসওয়ার্ড সঠিক নয়');

  user.password = newPassword;
  await user.save();

  return res.status(200).json(new ApiResponse(200, null, 'পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে'));
});

/**
 * @route GET /api/v1/auth/me
 */
const getMe = asyncHandler(async (req, res) => {
  return res.status(200).json(new ApiResponse(200, req.user.toSafeObject(), 'প্রোফাইল তথ্য'));
});

module.exports = {
  register,
  verifyOtp,
  resendOtp,
  login,
  refreshToken,
  logout,
  logoutAllDevices,
  forgotPassword,
  resetPassword,
  changePassword,
  getMe,
};
