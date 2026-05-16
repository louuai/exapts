import { Router } from 'express';
import { leads, generateId, nowIso } from '../data/store.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

/* POST /api/leads — public lead capture (landing page form) */
router.post('/', (req, res) => {
  const { name, email, phone, message, source, interest } = req.body || {};
  if (!name || !email) return res.status(400).json({ error: 'Name and email required' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return res.status(400).json({ error: 'Invalid email' });

  const lead = {
    id: generateId('l'),
    name: String(name).trim(),
    email: String(email).trim().toLowerCase(),
    phone: phone ? String(phone).trim() : '',
    message: message ? String(message).trim() : '',
    source: source || 'landing',
    interest: interest || 'real-estate',
    status: 'new',
    createdAt: nowIso(),
  };
  leads.unshift(lead);
  res.status(201).json({ lead });
});

/* GET /api/leads — admin only, with optional filters */
router.get('/', requireAuth, requireAdmin, (req, res) => {
  const { status, q } = req.query;
  let result = leads.slice();
  if (status) result = result.filter((l) => l.status === status);
  if (q) {
    const term = String(q).toLowerCase();
    result = result.filter(
      (l) =>
        l.name.toLowerCase().includes(term) ||
        l.email.toLowerCase().includes(term) ||
        (l.message || '').toLowerCase().includes(term)
    );
  }
  res.json({ leads: result, total: result.length });
});

/* PATCH /api/leads/:id — admin updates status */
router.patch('/:id', requireAuth, requireAdmin, (req, res) => {
  const lead = leads.find((l) => l.id === req.params.id);
  if (!lead) return res.status(404).json({ error: 'Lead not found' });
  const { status, notes } = req.body || {};
  if (status) lead.status = status;
  if (notes !== undefined) lead.notes = notes;
  res.json({ lead });
});

/* DELETE /api/leads/:id */
router.delete('/:id', requireAuth, requireAdmin, (req, res) => {
  const idx = leads.findIndex((l) => l.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Lead not found' });
  leads.splice(idx, 1);
  res.json({ ok: true });
});

export default router;
