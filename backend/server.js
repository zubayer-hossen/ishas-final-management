const http = require('http');
const { Server } = require('socket.io');

const env = require('./config/env');
const app = require('./app');
const connectDB = require('./config/db');
const logger = require('./utils/logger');
const initMeetingSocket = require('./sockets/meetingSocket');
const socketAuthMiddleware = require('./middleware/socketAuth');

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: env.clientUrl, credentials: true },
});

// Default namespace — used for real-time in-app notifications.
// Each authenticated socket joins a private room `user:<id>` so the
// notify.js helper can push events straight to that user.
io.use(socketAuthMiddleware);

io.on('connection', (socket) => {
  logger.debug(`Socket connected: ${socket.id} (${socket.user.fullName})`);
  socket.join(`user:${socket.user.id}`);

  socket.on('disconnect', () => {
    logger.debug(`Socket disconnected: ${socket.id}`);
  });
});

// `/meeting` namespace — full real-time audio/video conferencing engine
initMeetingSocket(io);

app.set('io', io);

const startServer = async () => {
  await connectDB();

  server.listen(env.port, () => {
    logger.info(`🚀 ISHAS API server running in ${env.nodeEnv} mode on port ${env.port}`);
  });
};

process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception: ${err.message}`);
  process.exit(1);
});

startServer();
