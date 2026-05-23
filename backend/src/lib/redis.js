import IORedis from 'ioredis';
import { env } from './env.js';

const REDIS_URL = env.REDIS_URL;
const isTlsRedis = REDIS_URL.startsWith('rediss://') || /upstash/i.test(REDIS_URL);

export const redis = new IORedis(REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: true,
  ...(isTlsRedis ? { tls: {} } : {}),
});

redis.on('error', (err) => console.error('[redis]', err.message));
