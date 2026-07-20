const { verifyAccessToken } = require('../utils/token');
const User = require('../models/User');

/**
 * Authenticates an incoming Socket.IO connection using the same JWT
 * access token used for REST requests. Expects the token at
 * `socket.handshake.auth.token` (client sends it when calling io(...)).
 */
const socketAuthMiddleware = async (socket, next) => {
  try {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.split(' ')[1];

    if (!token) {
      return next(new Error('AUTH_REQUIRED'));
    }

    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.id).select('fullName role profilePicture memberId isActive');

    if (!user || !user.isActive) {
      return next(new Error('AUTH_INVALID'));
    }

    socket.user = {
      id: user._id.toString(),
      fullName: user.fullName,
      role: user.role,
      profilePicture: user.profilePicture?.url || '',
      memberId: user.memberId,
    };

    return next();
  } catch (error) {
    return next(new Error('AUTH_INVALID'));
  }
};

module.exports = socketAuthMiddleware;
