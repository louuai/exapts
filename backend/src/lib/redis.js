import IORedis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL;

if (!REDIS_URL) {
  throw new Error("REDIS_URL is not defined");
}

export const redis = new IORedis(REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: true,
  tls: {} // important pour Upstash
});

redis.on('error', (err) => console.error('[redis]', err.message));