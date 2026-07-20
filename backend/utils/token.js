const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const env = require('../config/env');

/**
 * Generates a short-lived JWT access token carrying user id and role.
 */
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    env.jwt.accessSecret,
    { expiresIn: env.jwt.accessExpires }
  );
};

/**
 * Generates a long-lived JWT refresh token carrying only the user id.
 */
const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id, tokenVersion: user.tokenVersion || 0 },
    env.jwt.refreshSecret,
    { expiresIn: env.jwt.refreshExpires }
  );
};

const verifyAccessToken = (token) => jwt.verify(token, env.jwt.accessSecret);

const verifyRefreshToken = (token) => jwt.verify(token, env.jwt.refreshSecret);

/**
 * Generates a 6-digit numeric OTP plus its SHA-256 hash for safe DB storage,
 * and the plain OTP to be emailed to the user.
 */
const generateOTP = () => {
  const otp = crypto.randomInt(100000, 999999).toString();
  const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');
  return { otp, hashedOtp };
};

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

/**
 * Generates a secure random token for password reset / email verification links.
 */
const generateSecureToken = () => {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = hashToken(rawToken);
  return { rawToken, hashedToken };
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  generateOTP,
  hashToken,
  generateSecureToken,
};
