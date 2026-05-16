import { Router } from 'express';
import {
  visitRequests, properties, users, generateId, nowIso,
} from '../data/store.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

/* POST /api/visits — authenticated user requests a visit */
router.post('/', requireAuth, (req, res) => {
  const { propertyId, preferredDate, message, phone } = req.body || {};
  if (!propertyId) return res.status(400).json({ error: 'propertyId required' });
  if (!properties.find((p) => p.id === propertyId))
    return res.status(404).json({ error: 'Property not found' });

  const user = users.find((u) => u.id === req.user.sub);
  const vr = {
    id: generateId('vr'),
    propertyId,
    userId: user.id,
    userName: user.name,
    userEmail: user.email,
    userPhone: phone || user.phone || '',
    preferredDate: preferredDate || '',
    message: message || '',
    status: 'pending',
    createdAt: nowIso(),
  };
  visitRequests.unshift(vr);
  res.status(201).json({ visitRequest: vr });
});

/* GET /api/visits — admin sees all, user sees own */
router.get('/', requireAuth, (req, res) => {
  const isAdmin = req.user.role === 'admin';
  const result = isAdmin
    ? visitRequests.slice()
    : visitRequests.filter((v) => v.userId === req.user.sub);
  res.json({ visitRequests: result, total: result.length });
});

/* PATCH /api/visits/:id — admin updates status (pending/confirmed/done/cancelled) */
router.patch('/:id', requireAuth, requireAdmin, (req, res) => {
  const v = visitRequests.find((x) => x.id === req.params.id);
  if (!v) return res.status(404).json({ error: 'Visit request not found' });
  const { status, notes } = req.body || {};
  if (status) v.status = status;
  if (notes !== undefined) v.notes = notes;
  res.json({ visitRequest: v });
});

export default router;
