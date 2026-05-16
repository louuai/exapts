import { Router } from 'express';
import { favorites, properties } from '../data/store.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, (req, res) => {
  const set = favorites.get(req.user.sub) || new Set();
  const items = properties.filter((p) => set.has(p.id));
  res.json({ favorites: items, ids: [...set] });
});

router.post('/:propertyId', requireAuth, (req, res) => {
  const { propertyId } = req.params;
  if (!properties.find((p) => p.id === propertyId))
    return res.status(404).json({ error: 'Property not found' });
  const set = favorites.get(req.user.sub) || new Set();
  if (set.has(propertyId)) set.delete(propertyId);
  else set.add(propertyId);
  favorites.set(req.user.sub, set);
  res.json({ ids: [...set] });
});

export default router;
