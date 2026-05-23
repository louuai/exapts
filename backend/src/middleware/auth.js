import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';
import { env } from '../lib/env.js';

const JWT_SECRET = env.JWT_SECRET;
const ADMIN_SESSION_SECRET = env.ADMIN_SESSION_SECRET || `${JWT_SECRET}:admin-session`;
const ADMIN_SESSION_EXPIRES_IN = env.ADMIN_SESSION_EXPIRES_IN || '30m';

export function signToken(payload, options = {}) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN || '7d',
    ...options,
  });
}

export function signAdminSession(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
      purpose: 'admin-session',
    },
    ADMIN_SESSION_SECRET,
    { expiresIn: ADMIN_SESSION_EXPIRES_IN }
  );
}

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing token' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function optionalAuth(req, _res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (token) {
    try {
      req.user = jwt.verify(token, JWT_SECRET);
    } catch {
      /* ignore */
    }
  }
  next();
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const adminSession = req.headers['x-admin-session'];
  if (!adminSession) {
    return res.status(401).json({ error: 'Admin session required', code: 'ADMIN_SESSION_REQUIRED' });
  }

  try {
    const payload = jwt.verify(adminSession, ADMIN_SESSION_SECRET);
    if (
      payload?.purpose !== 'admin-session' ||
      payload?.sub !== req.user.sub ||
      payload?.role !== 'admin'
    ) {
      return res.status(401).json({ error: 'Invalid admin session', code: 'ADMIN_SESSION_INVALID' });
    }
    req.adminSession = payload;
  } catch {
    return res.status(401).json({ error: 'Admin session expired', code: 'ADMIN_SESSION_EXPIRED' });
  }

  prisma.user.findUnique({
    where: { id: req.user.sub },
    select: { id: true, email: true, role: true, lockedUntil: true },
  })
    .then((user) => {
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }
      if (user.lockedUntil && user.lockedUntil > new Date()) {
        return res.status(423).json({ error: 'Account is temporarily locked' });
      }
      req.adminUser = user;
      next();
    })
    .catch(next);
}
