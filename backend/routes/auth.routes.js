const express = require('express');
const authController = require('../controllers/auth.controller');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth.middleware');
const { authLimiter } = require('../middleware/security');
const {
  registerValidator,
  loginValidator,
  verifyOtpValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  changePasswordValidator,
} = require('../validators/auth.validator');

const router = express.Router();

// -------- Public Routes --------
router.post('/register', authLimiter, registerValidator, validate, authController.register);
router.post('/verify-otp', authLimiter, verifyOtpValidator, validate, authController.verifyOtp);
router.post('/resend-otp', authLimiter, authController.resendOtp);
router.post('/login', authLimiter, loginValidator, validate, authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/forgot-password', authLimiter, forgotPasswordValidator, validate, authController.forgotPassword);
router.post('/reset-password', authLimiter, resetPasswordValidator, validate, authController.resetPassword);

// -------- Protected Routes --------
router.post('/logout', protect, authController.logout);
router.post('/logout-all', protect, authController.logoutAllDevices);
router.post('/change-password', protect, changePasswordValidator, validate, authController.changePassword);
router.get('/me', protect, authController.getMe);

module.exports = router;
