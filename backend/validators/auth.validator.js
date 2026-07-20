const { body } = require('express-validator');

const registerValidator = [
  body('fullName').trim().notEmpty().withMessage('নাম আবশ্যক').isLength({ max: 100 }),
  body('email').trim().isEmail().withMessage('সঠিক ইমেইল দিন').normalizeEmail(),
  body('phone').optional().trim().isMobilePhone('any').withMessage('সঠিক ফোন নম্বর দিন'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('পাসওয়ার্ড কমপক্ষে ৮ ক্যারেক্টার হতে হবে')
    .matches(/\d/)
    .withMessage('পাসওয়ার্ডে অন্তত একটি সংখ্যা থাকতে হবে'),
];

const loginValidator = [
  body('email').trim().isEmail().withMessage('সঠিক ইমেইল দিন').normalizeEmail(),
  body('password').notEmpty().withMessage('পাসওয়ার্ড আবশ্যক'),
];

const verifyOtpValidator = [
  body('email').trim().isEmail().normalizeEmail(),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP অবশ্যই ৬ সংখ্যার হতে হবে'),
];

const forgotPasswordValidator = [
  body('email').trim().isEmail().withMessage('সঠিক ইমেইল দিন').normalizeEmail(),
];

const resetPasswordValidator = [
  body('token').notEmpty().withMessage('টোকেন আবশ্যক'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('পাসওয়ার্ড কমপক্ষে ৮ ক্যারেক্টার হতে হবে')
    .matches(/\d/)
    .withMessage('পাসওয়ার্ডে অন্তত একটি সংখ্যা থাকতে হবে'),
];

const changePasswordValidator = [
  body('currentPassword').notEmpty().withMessage('বর্তমান পাসওয়ার্ড আবশ্যক'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('নতুন পাসওয়ার্ড কমপক্ষে ৮ ক্যারেক্টার হতে হবে')
    .matches(/\d/)
    .withMessage('পাসওয়ার্ডে অন্তত একটি সংখ্যা থাকতে হবে'),
];

module.exports = {
  registerValidator,
  loginValidator,
  verifyOtpValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  changePasswordValidator,
};
