import { redis } from './redis.js';

/**
 * Thin cache helper. Use for read-heavy endpoints like /properties list,
 * /services list, public profiles, etc.
 *
 *   const data = await cache('properties:featured', 60, () => prisma.property.findMany({...}));
 */
export async function cache(key, ttlSeconds, producer) {
  try {
    const hit = await redis.get(key);
    if (hit) return JSON.parse(hit);
  } catch { /* redis down — fall through */ }

  const fresh = await producer();
  try {
    await redis.set(key, JSON.stringify(fresh), 'EX', ttlSeconds);
  } catch { /* ignore */ }
  return fresh;
}

export async function invalidate(pattern) {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length) await redis.del(...keys);
  } catch { /* ignore */ }
}
