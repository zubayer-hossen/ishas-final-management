const helmet = require('helmet');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const env = require('../config/env');

const corsOptions = {
  origin: env.clientUrl,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
};

const globalLimiter = rateLimit({
  windowMs: env.rateLimit.windowMinutes * 60 * 1000,
  max: env.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'অনেক বেশি রিকোয়েস্ট পাঠানো হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।',
  },
});

// Stricter limiter specifically for auth endpoints (brute-force protection)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'অনেকবার চেষ্টা করা হয়েছে। ১৫ মিনিট পর আবার চেষ্টা করুন।',
  },
});

/**
 * Applies all security-related middleware to the Express app in the correct order.
 */
const applySecurityMiddleware = (app) => {
  app.use(helmet());
  app.use(cors(corsOptions));
  app.use(compression());
  app.use(mongoSanitize());
  app.use(xss());
  app.use(hpp());
  app.use(globalLimiter);
};

module.exports = { applySecurityMiddleware, authLimiter };
