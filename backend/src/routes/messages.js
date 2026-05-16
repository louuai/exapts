import { Router } from 'express';
import { messages, properties, users, generateId, nowIso } from '../data/store.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

/* POST /api/messages — authenticated user sends inquiry on a property */
router.post('/', requireAuth, (req, res) => {
  const { propertyId, body } = req.body || {};
  if (!propertyId || !body) return res.status(400).json({ error: 'propertyId and body required' });
  if (!properties.find((p) => p.id === propertyId))
    return res.status(404).json({ error: 'Property not found' });

  const user = users.find((u) => u.id === req.user.sub);
  const m = {
    id: generateId('m'),
    propertyId,
    userId: user.id,
    userName: user.name,
    userEmail: user.email,
    body: String(body).trim(),
    status: 'open',
    createdAt: nowIso(),
  };
  messages.unshift(m);
  res.status(201).json({ message: m });
});

/* GET /api/messages — admin sees all, user sees own */
router.get('/', requireAuth, (req, res) => {
  const result = req.user.role === 'admin'
    ? messages.slice()
    : messages.filter((m) => m.userId === req.user.sub);
  res.json({ messages: result, total: result.length });
});

/* PATCH /api/messages/:id — admin marks as answered */
router.patch('/:id', requireAuth, requireAdmin, (req, res) => {
  const m = messages.find((x) => x.id === req.params.id);
  if (!m) return res.status(404).json({ error: 'Message not found' });
  if (req.body?.status) m.status = req.body.status;
  res.json({ message: m });
});

export default router;
