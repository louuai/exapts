import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import { prisma } from '../lib/prisma.js';

const REDIS_URL = process.env.REDIS_URL || 'redis://redis:6379';
const connection = new IORedis(REDIS_URL, { maxRetriesPerRequest: null });

/**
 * Notification fan-out worker. Used for heavy broadcasts
 * (e.g. "new property" → notify all opted-in users).
 *
 * Jobs:
 *   - "fanout-property": notify users with notificationPrefs.newProperties = true
 */
export function createNotificationWorker() {
  return new Worker('notifications', async (job) => {
    if (job.name === 'fanout-property') {
      const { propertyId } = job.data;
      const users = await prisma.user.findMany({
        where: { role: 'user' },
        select: { id: true, notificationPrefs: true },
      });
      const targets = users.filter((u) => {
        const prefs = u.notificationPrefs || {};
        return prefs.newProperties !== false;
      });
      if (!targets.length) return { notified: 0 };

      await prisma.notification.createMany({
        data: targets.map((u) => ({
          userId: u.id,
          type: 'NEW_PROPERTY',
          payload: { propertyId },
        })),
      });
      return { notified: targets.length };
    }
  }, { connection, concurrency: 2 });
}
