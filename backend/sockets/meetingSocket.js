const Meeting = require('../models/Meeting');
const socketAuthMiddleware = require('../middleware/socketAuth');
const logger = require('../utils/logger');

/**
 * In-memory state for active meeting rooms. This does NOT need to be
 * persisted — it only tracks who is *currently* connected. Durable data
 * (attendance log, meeting status) is written to MongoDB as it happens.
 */
const rooms = new Map();
const socketMeta = new Map(); // socketId -> { roomId, meetingId, userId, joinedAt }

const getOrCreateRoom = (roomId, meetingId, hostUserId) => {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, {
      meetingId,
      hostUserId,
      waitingRoom: new Map(),
      participants: new Map(),
    });
  }
  return rooms.get(roomId);
};

const isHostSocket = (room, socketId) => {
  const p = room.participants.get(socketId);
  return !!p?.isHost;
};

const broadcastToHosts = (nsp, roomId, room, event, payload) => {
  room.participants.forEach((p, sid) => {
    if (p.isHost) nsp.to(sid).emit(event, payload);
  });
};

const serializeParticipants = (room) =>
  Array.from(room.participants.entries()).map(([socketId, p]) => ({ socketId, ...p }));

const recordDeparture = async (meetingId, userId, joinedAt) => {
  try {
    const meeting = await Meeting.findById(meetingId);
    if (!meeting) return;

    const entry = [...meeting.attendance].reverse().find((a) => a.user.toString() === userId && !a.leftAt);

    if (entry) {
      entry.leftAt = new Date();
      entry.durationSeconds = Math.round((entry.leftAt - new Date(joinedAt)) / 1000);
      await meeting.save({ validateBeforeSave: false });
    }
  } catch (error) {
    logger.error(`Failed to record meeting departure: ${error.message}`);
  }
};

/**
 * Initializes the `/meeting` Socket.IO namespace with all real-time
 * conferencing event handlers: waiting room, WebRTC signaling relay,
 * host controls, and in-meeting chat.
 */
const initMeetingSocket = (io) => {
  const nsp = io.of('/meeting');
  nsp.use(socketAuthMiddleware);

  nsp.on('connection', (socket) => {
    logger.debug(`Meeting socket connected: ${socket.id} (${socket.user.fullName})`);

    function handleLeave(sock, roomId) {
      const room = rooms.get(roomId);
      const meta = socketMeta.get(sock.id);

      if (room) {
        room.waitingRoom.delete(sock.id);
        room.participants.delete(sock.id);
        sock.to(roomId).emit('participant-left', { socketId: sock.id });

        if (room.participants.size === 0 && room.waitingRoom.size === 0) {
          rooms.delete(roomId);
        }
      }

      if (meta) {
        recordDeparture(meta.meetingId, meta.userId, meta.joinedAt);
        socketMeta.delete(sock.id);
      }

      sock.leave(roomId);
    }

    /**
     * join-room: { meetingId, roomId }
     * Puts the user in the waiting room (if enabled) or directly into
     * the meeting, and syncs state accordingly.
     */
    socket.on('join-room', async ({ meetingId, roomId }) => {
      try {
        const meeting = await Meeting.findById(meetingId);
        if (!meeting || meeting.roomId !== roomId) {
          return socket.emit('join-error', { message: 'মিটিং পাওয়া যায়নি' });
        }
        if (meeting.status === 'ended' || meeting.status === 'cancelled') {
          return socket.emit('join-error', { message: 'এই মিটিং আর সক্রিয় নেই' });
        }

        const hostUserId = meeting.host.toString();
        const isHost =
          socket.user.id === hostUserId || meeting.coHosts.some((c) => c.toString() === socket.user.id);

        const room = getOrCreateRoom(roomId, meetingId, hostUserId);
        socket.join(roomId);
        socketMeta.set(socket.id, { roomId, meetingId, userId: socket.user.id, joinedAt: new Date() });

        const needsWaitingRoom = meeting.settings.waitingRoomEnabled && !isHost;

        if (needsWaitingRoom) {
          room.waitingRoom.set(socket.id, {
            userId: socket.user.id,
            fullName: socket.user.fullName,
            profilePicture: socket.user.profilePicture,
          });
          socket.emit('waiting-for-approval');
          broadcastToHosts(nsp, roomId, room, 'waiting-room-update', {
            waitingUsers: Array.from(room.waitingRoom.entries()).map(([sid, u]) => ({ socketId: sid, ...u })),
          });
          return;
        }

        room.participants.set(socket.id, {
          userId: socket.user.id,
          fullName: socket.user.fullName,
          profilePicture: socket.user.profilePicture,
          role: socket.user.role,
          isHost,
          micOn: !meeting.settings.muteOnEntry,
          cameraOn: true,
          handRaised: false,
          screenSharing: false,
        });

        if (meeting.status === 'scheduled') {
          meeting.status = 'live';
          meeting.actualStart = meeting.actualStart || new Date();
        }
        meeting.attendance.push({ user: socket.user.id, joinedAt: new Date() });
        await meeting.save({ validateBeforeSave: false });

        socket.emit('join-approved', {
          isHost,
          settings: meeting.settings,
          existingParticipants: serializeParticipants(room).filter((p) => p.socketId !== socket.id),
        });

        socket.to(roomId).emit('participant-joined', {
          socketId: socket.id,
          userId: socket.user.id,
          fullName: socket.user.fullName,
          profilePicture: socket.user.profilePicture,
          isHost,
        });
      } catch (error) {
        logger.error(`join-room error: ${error.message}`);
        socket.emit('join-error', { message: 'মিটিংয়ে যোগ দিতে সমস্যা হয়েছে' });
      }
    });

    socket.on('admit-participant', ({ roomId, socketId }) => {
      const room = rooms.get(roomId);
      if (!room || !isHostSocket(room, socket.id)) return;

      const waitingUser = room.waitingRoom.get(socketId);
      if (!waitingUser) return;

      room.waitingRoom.delete(socketId);
      room.participants.set(socketId, {
        ...waitingUser,
        role: 'general_member',
        isHost: false,
        micOn: false,
        cameraOn: true,
        handRaised: false,
        screenSharing: false,
      });

      nsp.to(socketId).emit('join-approved-from-waiting', {
        existingParticipants: serializeParticipants(room).filter((p) => p.socketId !== socketId),
      });
      socket.to(roomId).emit('participant-joined', { socketId, ...waitingUser, isHost: false });

      broadcastToHosts(nsp, roomId, room, 'waiting-room-update', {
        waitingUsers: Array.from(room.waitingRoom.entries()).map(([sid, u]) => ({ socketId: sid, ...u })),
      });
    });

    socket.on('reject-participant', ({ roomId, socketId }) => {
      const room = rooms.get(roomId);
      if (!room || !isHostSocket(room, socket.id)) return;

      room.waitingRoom.delete(socketId);
      nsp.to(socketId).emit('join-rejected');

      broadcastToHosts(nsp, roomId, room, 'waiting-room-update', {
        waitingUsers: Array.from(room.waitingRoom.entries()).map(([sid, u]) => ({ socketId: sid, ...u })),
      });
    });

    socket.on('signal', ({ roomId, to, data }) => {
      const room = rooms.get(roomId);
      if (!room || !room.participants.has(socket.id)) return;
      nsp.to(to).emit('signal', { from: socket.id, data });
    });

    const updateParticipantState = (field) => (payload) => {
      const room = rooms.get(payload.roomId);
      const p = room?.participants.get(socket.id);
      if (!p) return;
      p[field] = payload.value;
      nsp.to(payload.roomId).emit('participant-updated', { socketId: socket.id, [field]: payload.value });
    };

    socket.on('toggle-mic', updateParticipantState('micOn'));
    socket.on('toggle-camera', updateParticipantState('cameraOn'));
    socket.on('raise-hand', updateParticipantState('handRaised'));
    socket.on('screen-share', updateParticipantState('screenSharing'));

    socket.on('chat-message', ({ roomId, text }) => {
      const room = rooms.get(roomId);
      const p = room?.participants.get(socket.id);
      if (!p || !text?.trim()) return;

      nsp.to(roomId).emit('chat-message', {
        socketId: socket.id,
        fullName: p.fullName,
        text: text.trim().slice(0, 1000),
        sentAt: new Date().toISOString(),
      });
    });

    socket.on('mute-participant', ({ roomId, targetSocketId }) => {
      const room = rooms.get(roomId);
      if (!room || !isHostSocket(room, socket.id)) return;

      const target = room.participants.get(targetSocketId);
      if (!target) return;
      target.micOn = false;

      nsp.to(targetSocketId).emit('force-muted');
      nsp.to(roomId).emit('participant-updated', { socketId: targetSocketId, micOn: false });
    });

    socket.on('remove-participant', async ({ roomId, targetSocketId }) => {
      const room = rooms.get(roomId);
      if (!room || !isHostSocket(room, socket.id)) return;

      room.participants.delete(targetSocketId);
      nsp.to(targetSocketId).emit('removed-from-meeting');

      const targetSocket = (await nsp.in(targetSocketId).fetchSockets())[0];
      targetSocket?.leave(roomId);

      nsp.to(roomId).emit('participant-left', { socketId: targetSocketId });

      const meta = socketMeta.get(targetSocketId);
      if (meta) recordDeparture(meta.meetingId, meta.userId, meta.joinedAt);
      socketMeta.delete(targetSocketId);
    });

    socket.on('end-meeting', async ({ roomId }) => {
      const room = rooms.get(roomId);
      if (!room || !isHostSocket(room, socket.id)) return;

      try {
        const meeting = await Meeting.findById(room.meetingId);
        if (meeting) {
          meeting.status = 'ended';
          meeting.actualEnd = new Date();
          await meeting.save({ validateBeforeSave: false });
        }
      } catch (error) {
        logger.error(`end-meeting error: ${error.message}`);
      }

      nsp.to(roomId).emit('meeting-ended');

      const socketsInRoom = await nsp.in(roomId).fetchSockets();
      socketsInRoom.forEach((s) => {
        s.leave(roomId);
        socketMeta.delete(s.id);
      });
      rooms.delete(roomId);
    });

    socket.on('leave-room', ({ roomId }) => handleLeave(socket, roomId));

    socket.on('disconnect', () => {
      const meta = socketMeta.get(socket.id);
      if (meta) handleLeave(socket, meta.roomId);
    });
  });

  return nsp;
};

module.exports = initMeetingSocket;
