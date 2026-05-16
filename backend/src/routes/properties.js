import { Router } from 'express';
import { properties, generateId, nowIso } from '../data/store.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

/* GET /api/properties */
router.get('/', (req, res) => {
  const {
    q,
    region,
    location,
    type,
    transaction,
    minPrice,
    maxPrice,
    minRooms,
    minSurface,
    featured,
    tag,
    sort,
  } = req.query;

  let result = properties.slice();
  if (region) result = result.filter((p) => p.region === region);
  if (location) result = result.filter((p) => p.location === location);
  if (type) result = result.filter((p) => p.type === type);
  if (transaction) result = result.filter((p) => p.transaction === transaction);
  if (minPrice) result = result.filter((p) => p.price >= Number(minPrice));
  if (maxPrice) result = result.filter((p) => p.price <= Number(maxPrice));
  if (minRooms) result = result.filter((p) => p.rooms >= Number(minRooms));
  if (minSurface)
    result = result.filter((p) => p.surface >= Number(minSurface));
  if (featured === 'true') result = result.filter((p) => p.featured);
  if (tag) result = result.filter((p) => Array.isArray(p.tags) && p.tags.includes(tag));
  if (q) {
    const term = String(q).toLowerCase();
    result = result.filter(
      (p) =>
        p.title.toLowerCase().includes(term) ||
        (p.description || '').toLowerCase().includes(term) ||
        p.location.toLowerCase().includes(term) ||
        p.type.toLowerCase().includes(term)
    );
  }

  if (sort === 'price-asc') result.sort((a, b) => a.price - b.price);
  else if (sort === 'price-desc') result.sort((a, b) => b.price - a.price);
  else if (sort === 'surface-desc') result.sort((a, b) => b.surface - a.surface);
  else result.sort((a, b) => new Date(b.listedAt) - new Date(a.listedAt));

  res.json({
    properties: result,
    total: result.length,
    facets: {
      regions: unique(properties.map((p) => p.region)),
      locations: unique(properties.map((p) => p.location)),
      types: unique(properties.map((p) => p.type)),
    },
  });
});

router.get('/:id', (req, res) => {
  const p = properties.find((x) => x.id === req.params.id);
  if (!p) return res.status(404).json({ error: 'Property not found' });
  const similar = properties
    .filter((x) => x.id !== p.id && x.region === p.region)
    .slice(0, 3);
  res.json({ property: p, similar });
});

/* ---------- Admin CRUD ---------- */

/* POST /api/properties — admin only */
router.post('/', requireAuth, requireAdmin, (req, res) => {
  const b = req.body || {};
  if (!b.title || !b.price || !b.location || !b.type)
    return res.status(400).json({ error: 'title, price, location and type are required' });

  const p = {
    id: b.id || generateId('p'),
    reference: b.reference || '',
    title: b.title,
    titleEn: b.titleEn || b.title,
    type: b.type,
    transaction: b.transaction || 'sale',
    price: Number(b.price),
    currency: b.currency || 'EUR',
    location: b.location,
    region: b.region || '',
    coordinates: b.coordinates || null,
    surface: Number(b.surface || 0),
    landSurface: b.landSurface ? Number(b.landSurface) : undefined,
    rooms: Number(b.rooms || 0),
    bedrooms: Number(b.bedrooms || 0),
    bathrooms: Number(b.bathrooms || 0),
    parking: Number(b.parking || 0),
    yearBuilt: b.yearBuilt ? Number(b.yearBuilt) : undefined,
    eligibility: b.eligibility || '',
    eligibilityEn: b.eligibilityEn || b.eligibility || '',
    images: Array.isArray(b.images) && b.images.length
      ? b.images
      : ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1600&q=80'],
    description: b.description || '',
    descriptionEn: b.descriptionEn || b.description || '',
    features: Array.isArray(b.features) ? b.features : [],
    tags: Array.isArray(b.tags) ? b.tags : [],
    agent: b.agent || null,
    listedAt: nowIso().slice(0, 10),
    featured: !!b.featured,
    new: true,
  };
  properties.unshift(p);
  res.status(201).json({ property: p });
});

/* PUT /api/properties/:id — admin only */
router.put('/:id', requireAuth, requireAdmin, (req, res) => {
  const p = properties.find((x) => x.id === req.params.id);
  if (!p) return res.status(404).json({ error: 'Property not found' });

  const editable = [
    'reference', 'title', 'titleEn', 'type', 'transaction', 'price', 'currency',
    'location', 'region', 'coordinates', 'surface', 'landSurface', 'rooms',
    'bedrooms', 'bathrooms', 'parking', 'yearBuilt', 'eligibility', 'eligibilityEn',
    'images', 'description', 'descriptionEn', 'features', 'tags', 'agent',
    'featured', 'new',
  ];
  for (const k of editable) {
    if (k in (req.body || {})) p[k] = req.body[k];
  }
  res.json({ property: p });
});

/* DELETE /api/properties/:id — admin only */
router.delete('/:id', requireAuth, requireAdmin, (req, res) => {
  const idx = properties.findIndex((x) => x.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Property not found' });
  properties.splice(idx, 1);
  res.json({ ok: true });
});

function unique(arr) {
  return [...new Set(arr)];
}

export default router;
