import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma.js';
import { signToken, requireAuth } from '../middleware/auth.js';
import { serializeUser } from '../lib/serializers.js';
import { storeImage } from '../lib/storage.js';
import { authLimiter } from '../middleware/rateLimit.js';
import { validate, schemas } from '../lib/validators.js';
import { logger } from '../lib/logger.js';

const router = Router();

const BCRYPT_ROUNDS = 10;                       // ≥ 10 as required
const MAX_FAILED_ATTEMPTS = 5;                  // lock after 5 consecutive failures
const LOCKOUT_MINUTES = 15;                     // lock duration

const makeToken = (u) => signToken({ sub: u.id, email: u.email, role: u.role || 'user' });

/* POST /api/auth/signup */
router.post('/signup', authLimiter, validate(schemas.signup), async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    const exists = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (exists) return res.status(409).json({ error: 'Email already registered' });

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        name: name || email.split('@')[0],
        passwordHash: bcrypt.hashSync(password, BCRYPT_ROUNDS),
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || email)}`,
        lastLoginAt: new Date(),
      },
    });

    logger.info({ userId: user.id, email: user.email }, 'user signed up');
    res.status(201).json({ token: makeToken(user), user: serializeUser(user, { includePrivate: true }) });
  } catch (e) { next(e); }
});

/* POST /api/auth/login — with account lockout */
router.post('/login', authLimiter, validate(schemas.login), async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

    // Constant-ish response time path for missing users (avoid user enumeration)
    if (!user) {
      bcrypt.compareSync(password, '$2a$10$invalidsaltinvalidsaltinvalidsaltinvalidsaltinvalidsa');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Account locked?
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const minutes = Math.ceil((user.lockedUntil - new Date()) / 60000);
      return res.status(429).json({ error: `Trop d'échecs. Compte verrouillé pour ~${minutes} min.` });
    }

    const ok = bcrypt.compareSync(password, user.passwordHash);
    if (!ok) {
      const attempts = (user.failedLoginAttempts || 0) + 1;
      const shouldLock = attempts >= MAX_FAILED_ATTEMPTS;
      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: shouldLock ? 0 : attempts,
          lockedUntil: shouldLock ? new Date(Date.now() + LOCKOUT_MINUTES * 60_000) : user.lockedUntil,
        },
      });
      if (shouldLock) {
        logger.warn({ userId: user.id, email: user.email }, 'account locked after failed attempts');
        return res.status(429).json({ error: `Trop d'échecs. Compte verrouillé pour ${LOCKOUT_MINUTES} min.` });
      }
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Successful login — reset counters
    await prisma.user.update({
      where: { id: user.id },
      data:  { failedLoginAttempts: 0, lockedUntil: null, lastLoginAt: new Date() },
    });

    logger.info({ userId: user.id, email: user.email }, 'user logged in');
    res.json({ token: makeToken(user), user: serializeUser(user, { includePrivate: true }) });
  } catch (e) { next(e); }
});

/* GET /api/auth/me */
router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.sub } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user: serializeUser(user, { includePrivate: true }) });
  } catch (e) { next(e); }
});

/* PATCH /api/auth/me */
router.patch('/me', requireAuth, validate(schemas.updateProfile), async (req, res, next) => {
  try {
    const data = { ...req.body };
    if (data.avatar) {
      try { data.avatar = await storeImage(data.avatar); }
      catch (e) { return res.status(400).json({ error: e.message }); }
    }
    const user = await prisma.user.update({ where: { id: req.user.sub }, data });
    res.json({ user: serializeUser(user, { includePrivate: true }) });
  } catch (e) { next(e); }
});

/* POST /api/auth/change-password */
router.post('/change-password', requireAuth, validate(schemas.changePassword), async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user.sub } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (!bcrypt.compareSync(currentPassword, user.passwordHash))
      return res.status(401).json({ error: 'Current password is incorrect' });

    await prisma.user.update({
      where: { id: user.id },
      data:  { passwordHash: bcrypt.hashSync(newPassword, BCRYPT_ROUNDS) },
    });
    logger.info({ userId: user.id }, 'password changed');
    res.json({ ok: true });
  } catch (e) { next(e); }
});

export default router;
