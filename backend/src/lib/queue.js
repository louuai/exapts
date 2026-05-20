import { Queue, QueueEvents } from 'bullmq';
import IORedis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://redis:6379';
const connection = new IORedis(REDIS_URL, { maxRetriesPerRequest: null });

/**
 * BullMQ Queues — sit on Redis. Producers enqueue here, workers (src/worker.js)
 * consume. We use one queue per workload class.
 */
export const queues = {
  notifications: new Queue('notifications', { connection }),
  email:         new Queue('email',         { connection }),
};

export const queueEvents = {
  notifications: new QueueEvents('notifications', { connection }),
  email:         new QueueEvents('email',         { connection }),
};

/** Generic enqueue helper. Adds sane defaults. */
export async function enqueue(queueName, jobName, data, opts = {}) {
  const q = queues[queueName];
  if (!q) throw new Error(`Unknown queue: ${queueName}`);
  return q.add(jobName, data, {
    removeOnComplete: { count: 1000 },
    removeOnFail:     { count: 1000 },
    attempts:         3,
    backoff:          { type: 'exponential', delay: 1000 },
    ...opts,
  });
}
