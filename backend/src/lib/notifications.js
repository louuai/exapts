import { prisma } from './prisma.js';
import { enqueue } from './queue.js';
import { emitToUser } from './socket.js';

/**
 * Create a notification row + push it via Socket.io + queue a transactional
 * email if appropriate. Returns the created notification.
 *
 *   notify({ userId, type: 'NEW_FOLLOWER', payload: { actorId } })
 */
export async function notify({ userId, type, payload = {}, email = false }) {
  if (!userId) return null;

  const n = await prisma.notification.create({
    data: { userId, type, payload },
  });

  // Real-time push to the recipient's connected sockets
  emitToUser(userId, 'notification:new', n);

  // Optional async email
  if (email) {
    enqueue('email', 'notification', { notificationId: n.id, type, userId, payload }).catch(() => {});
  }

  return n;
}
