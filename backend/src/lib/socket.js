import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'omega-dev-secret-change-me';

let _io = null;

/** Boot Socket.io on the same HTTP server Express runs on. */
export function initSocket(httpServer) {
  const io = new Server(httpServer, {
    path: '/socket.io',
    cors: {
      origin: process.env.CORS_ORIGIN?.split(',') || '*',
      credentials: true,
    },
  });

  // Authenticate every connecting client via JWT (sent as auth.token).
  io.use((socket, next) => {
    const token = socket.handshake?.auth?.token;
    if (!token) return next(new Error('Missing auth token'));
    try {
      const payload = jwt.verify(token, JWT_SECRET);
      socket.userId = payload.sub;
      socket.role   = payload.role || 'user';
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    // Personal room — receive notifications, message events
    socket.join(`user:${socket.userId}`);

    socket.on('conversation:join', (conversationId) => {
      if (!conversationId) return;
      socket.join(`conversation:${conversationId}`);
    });
    socket.on('conversation:leave', (conversationId) => {
      socket.leave(`conversation:${conversationId}`);
    });
  });

  _io = io;
  return io;
}

export function getIo() {
  return _io;
}

/** Emit to a user's personal room (any device they're connected with). */
export function emitToUser(userId, event, payload) {
  if (!_io) return;
  _io.to(`user:${userId}`).emit(event, payload);
}

/** Emit to all participants in a conversation. */
export function emitToConversation(conversationId, event, payload) {
  if (!_io) return;
  _io.to(`conversation:${conversationId}`).emit(event, payload);
}
