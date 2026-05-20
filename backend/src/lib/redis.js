import IORedis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://redis:6379';

// One shared connection for app-level usage. BullMQ creates its own.
export const redis = new IORedis(REDIS_URL, {
  maxRetriesPerRequest: null, // required by BullMQ for blocking workers
  enableReadyCheck: true,
});

redis.on('error', (err) => console.error('[redis]', err.message));
