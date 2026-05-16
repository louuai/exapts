import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { findUserByEmail, createUser, publicUser, users } from '../data/store.js';
import { signToken, requireAuth } from '../middleware/auth.js';

const router = Router();

function makeToken(user) {
  return signToken({ sub: user.id, email: user.email, role: user.role || 'user' });
}

/* POST /api/auth/signup */
router.post('/signup', (req, res) => {
  const { email, password, name } = req.body || {};
  if (!email || !password)
    return res.status(400).json({ error: 'Email and password required' });
  if (password.length < 6)
    return res
      .status(400)
      .json({ error: 'Password must be at least 6 characters' });
  if (findUserByEmail(email))
    return res.status(409).json({ error: 'Email already registered' });

  const user = createUser({ email, password, name });
  res.status(201).json({ token: makeToken(user), user: publicUser(user) });
});

/* POST /api/auth/login */
router.post('/login', (req, res) => {
  const { email, password } = req.body || {};
  const user = findUserByEmail(email || '');
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  if (!bcrypt.compareSync(password || '', user.passwordHash))
    return res.status(401).json({ error: 'Invalid credentials' });

  res.json({ token: makeToken(user), user: publicUser(user) });
});

/* GET /api/auth/me */
router.get('/me', requireAuth, (req, res) => {
  const user = users.find((u) => u.id === req.user.sub);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user: publicUser(user) });
});

/* PATCH /api/auth/me — update profile fields (name, phone, bio, location, avatar, notificationPrefs) */
router.patch('/me', requireAuth, (req, res) => {
  const user = users.find((u) => u.id === req.user.sub);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const allowed = ['name', 'phone', 'bio', 'location', 'avatar', 'notificationPrefs'];
  for (const k of allowed) {
    if (k in (req.body || {})) user[k] = req.body[k];
  }
  res.json({ user: publicUser(user) });
});

/* POST /api/auth/change-password */
router.post('/change-password', requireAuth, (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  const user = users.find((u) => u.id === req.user.sub);
  if (!user) return res.status(404).json({ error: 'User not found' });
  if (!currentPassword || !newPassword)
    return res.status(400).json({ error: 'Current and new password required' });
  if (newPassword.length < 6)
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  if (!bcrypt.compareSync(currentPassword, user.passwordHash))
    return res.status(401).json({ error: 'Current password is incorrect' });

  user.passwordHash = bcrypt.hashSync(newPassword, 8);
  res.json({ ok: true });
});

export default router;
