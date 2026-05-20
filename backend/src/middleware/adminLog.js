/**
 * `logAdminAction(action, getTarget?)` returns Express middleware that runs
 * AFTER the response is sent and writes an AdminLog row. Mounted on each
 * admin mutation endpoint (POST/PUT/PATCH/DELETE).
 *
 * Usage:
 *   router.post('/', requireAuth, requireAdmin, validate(schema),
 *     logAdminAction('property.create', (req, res) => ({ targetType: 'property', targetId: res.locals.createdId })),
 *     handler);
 */
import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';

export function logAdminAction(action, getTarget) {
  return async (req, res, next) => {
    res.on('finish', async () => {
      if (res.statusCode >= 400) return;
      try {
        const t = (typeof getTarget === 'function' ? getTarget(req, res) : getTarget) || {};
        await prisma.adminLog.create({
          data: {
            actorId:    req.user.sub,
            actorEmail: req.user.email || '',
            action,
            targetType: t.targetType || null,
            targetId:   t.targetId   || null,
            ip:         req.ip || req.headers['x-forwarded-for']?.split(',')[0]?.trim() || null,
            userAgent:  String(req.headers['user-agent'] || '').slice(0, 500),
            payload:    t.payload || sanitisePayload(req.body),
          },
        });
      } catch (err) {
        logger.warn({ err: err.message, action }, 'admin log write failed');
      }
    });
    next();
  };
}

/* Strip image/data URL bodies and obvious huge fields before persisting */
function sanitisePayload(body) {
  if (!body || typeof body !== 'object') return null;
  const out = {};
  for (const [k, v] of Object.entries(body)) {
    if (typeof v === 'string' && v.length > 200) out[k] = `[truncated:${v.length} chars]`;
    else if (Array.isArray(v) && v.some((x) => typeof x === 'string' && x.length > 200))
      out[k] = `[array:${v.length} items]`;
    else out[k] = v;
  }
  return out;
}
