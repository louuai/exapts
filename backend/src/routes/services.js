import { Router } from 'express';
import { services, generateId, nowIso } from '../data/store.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

/* GET /api/services — public list with filters */
router.get('/', (req, res) => {
  const { category, q, subscription } = req.query;
  let result = services.slice();
  if (category) result = result.filter((s) => s.category === category);
  if (subscription) result = result.filter((s) => s.subscription === subscription);
  if (q) {
    const term = String(q).toLowerCase();
    result = result.filter(
      (s) =>
        s.name.toLowerCase().includes(term) ||
        (s.description || '').toLowerCase().includes(term) ||
        (s.location || '').toLowerCase().includes(term)
    );
  }
  // Premium first, then by rating desc
  result.sort((a, b) => {
    if (a.subscription === b.subscription) return (b.rating || 0) - (a.rating || 0);
    return a.subscription === 'premium' ? -1 : 1;
  });
  res.json({
    services: result,
    total: result.length,
    categories: [...new Set(services.map((s) => s.category))],
  });
});

/* GET /api/services/:id */
router.get('/:id', (req, res) => {
  const s = services.find((x) => x.id === req.params.id);
  if (!s) return res.status(404).json({ error: 'Service not found' });
  res.json({ service: s });
});

/* POST /api/services — admin only */
router.post('/', requireAuth, requireAdmin, (req, res) => {
  const { name, category, description, contact, location, image, subscription } = req.body || {};
  if (!name || !category) return res.status(400).json({ error: 'name and category required' });

  const s = {
    id: generateId('s'),
    name: String(name).trim(),
    category: String(category).trim(),
    description: description || '',
    contact: contact || {},
    location: location || '',
    rating: 0,
    reviews: 0,
    subscription: subscription || 'standard',
    image: image || null,
    createdAt: nowIso(),
  };
  services.unshift(s);
  res.status(201).json({ service: s });
});

/* PUT /api/services/:id — admin only */
router.put('/:id', requireAuth, requireAdmin, (req, res) => {
  const s = services.find((x) => x.id === req.params.id);
  if (!s) return res.status(404).json({ error: 'Service not found' });
  const editable = ['name', 'category', 'description', 'contact', 'location', 'image', 'subscription', 'rating', 'reviews'];
  for (const k of editable) {
    if (k in (req.body || {})) s[k] = req.body[k];
  }
  res.json({ service: s });
});

/* DELETE /api/services/:id — admin only */
router.delete('/:id', requireAuth, requireAdmin, (req, res) => {
  const idx = services.findIndex((x) => x.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Service not found' });
  services.splice(idx, 1);
  res.json({ ok: true });
});

export default router;
