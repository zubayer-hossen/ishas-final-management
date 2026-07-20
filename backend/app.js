const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

require('./config/env'); // validates env vars on boot
const { applySecurityMiddleware } = require('./middleware/security');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const logger = require('./utils/logger');

const authRoutes = require('./routes/auth.routes');
const memberRoutes = require('./routes/member.routes');
const committeeRoutes = require('./routes/committee.routes');
const transactionRoutes = require('./routes/transaction.routes');
const settingsRoutes = require('./routes/settings.routes');
const noticeRoutes = require('./routes/notice.routes');
const eventRoutes = require('./routes/event.routes');
const blogRoutes = require('./routes/blog.routes');
const galleryRoutes = require('./routes/gallery.routes');
const meetingRoutes = require('./routes/meeting.routes');
const notificationRoutes = require('./routes/notification.routes');
const supportRoutes = require('./routes/support.routes');
const reportRoutes = require('./routes/report.routes');

const app = express();

// -------- Core Middleware --------
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev', { stream: { write: (msg) => logger.debug(msg.trim()) } }));
}

// -------- Security --------
applySecurityMiddleware(app);

// -------- Health Check --------
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ success: true, message: 'ISHAS API চলছে', timestamp: new Date().toISOString() });
});

// -------- API Documentation --------
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'ISHAS API Documentation',
}));

// -------- API Routes --------
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/members', memberRoutes);
app.use('/api/v1/committees', committeeRoutes);
app.use('/api/v1/transactions', transactionRoutes);
app.use('/api/v1/settings', settingsRoutes);
app.use('/api/v1/notices', noticeRoutes);
app.use('/api/v1/events', eventRoutes);
app.use('/api/v1/blogs', blogRoutes);
app.use('/api/v1/gallery', galleryRoutes);
app.use('/api/v1/meetings', meetingRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/support', supportRoutes);
app.use('/api/v1/reports', reportRoutes);

// -------- 404 + Error Handler (must be last) --------
app.use(notFound);
app.use(errorHandler);

module.exports = app;
