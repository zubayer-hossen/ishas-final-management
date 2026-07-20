const Notification = require('../models/Notification');
const logger = require('./logger');

/**
 * Creates a notification for a single user, persists it, and pushes it
 * in real time over the default Socket.IO namespace (to the user's
 * private room `user:<id>`, joined in server.js on socket connection).
 *
 * @param {import('socket.io').Server} io - the Socket.IO server instance (app.get('io'))
 * @param {string} userId
 * @param {Object} payload
 * @param {string} payload.title
 * @param {string} payload.message
 * @param {'info'|'success'|'warning'|'alert'} [payload.type]
 * @param {string} [payload.link]
 * @param {string} [payload.relatedType]
 * @param {string} [payload.relatedId]
 */
const notifyUser = async (io, userId, payload) => {
  try {
    const notification = await Notification.create({
      user: userId,
      title: payload.title,
      message: payload.message,
      type: payload.type || 'info',
      link: payload.link || '',
      relatedType: payload.relatedType || '',
      relatedId: payload.relatedId || null,
    });

    io?.to(`user:${userId}`).emit('notification', notification);

    return notification;
  } catch (error) {
    logger.error(`Failed to create notification for user ${userId}: ${error.message}`);
    return null;
  }
};

/**
 * Sends the same notification to many users at once (e.g. all active members).
 * @param {string[]} userIds
 */
const notifyManyUsers = async (io, userIds, payload) => {
  return Promise.allSettled(userIds.map((id) => notifyUser(io, id, payload)));
};

module.exports = { notifyUser, notifyManyUsers };
