import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { cache, invalidate } from '../lib/cache.js';
import { requireAuth, requireAdmin, optionalAuth } from '../middleware/auth.js';
import { serializeService } from '../lib/serializers.js';

const router = Router();

/* GET /api/services */
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const isAdmin = req.user?.role === 'admin';
    const { category, q, subscription } = req.query;
    const where = {};
    if (category)     where.category = category;
    if (subscription) where.subscription = subscription;
    if (q) {
      where.OR = [
        { name:        { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { location:    { contains: q, mode: 'insensitive' } },
      ];
    }

    const services = await prisma.service.findMany({
      where,
      orderBy: [{ subscription: 'asc' /* premium < standard alphabetically; reverse below */ }, { rating: 'desc' }],
    });
    services.sort((a, b) => {
      if (a.subscription === b.subscription) return (b.rating || 0) - (a.rating || 0);
      return a.subscription === 'premium' ? -1 : 1;
    });

    const categories = await cache('services:categories', 300, async () => {
      const all = await prisma.service.findMany({ select: { category: true } });
      return [...new Set(all.map((s) => s.category))];
    });

    res.json({
      services: services.map((s) => serializeService(s, { isAdmin })),
      total: services.length,
      categories,
    });
  } catch (e) { next(e); }
});

router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const isAdmin = req.user?.role === 'admin';
    const s = await prisma.service.findUnique({ where: { id: req.params.id } });
    if (!s) return res.status(404).json({ error: 'Service not found' });
    res.json({ service: serializeService(s, { isAdmin }) });
  } catch (e) { next(e); }
});

router.post('/', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const b = req.body || {};
    if (!b.name || !b.category) return res.status(400).json({ error: 'name and category required' });
    const s = await prisma.service.create({
      data: {
        name: b.name, category: b.category, description: b.description || '',
        contact: b.contact || {}, location: b.location || '',
        rating: Number(b.rating || 0), reviews: Number(b.reviews || 0),
        subscription: b.subscription || 'standard',
        image: b.image || null,
        sourceUrl: b.sourceUrl || null,
        internalNotes: b.internalNotes || null,
      },
    });
    await invalidate('services:*');
    res.status(201).json({ service: serializeService(s, { isAdmin: true }) });
  } catch (e) { next(e); }
});

router.put('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const editable = ['name','category','description','contact','location','image','subscription','rating','reviews','sourceUrl','internalNotes'];
    const data = {};
    for (const k of editable) if (k in (req.body || {})) data[k] = req.body[k];
    const s = await prisma.service.update({ where: { id: req.params.id }, data });
    await invalidate('services:*');
    res.json({ service: serializeService(s, { isAdmin: true }) });
  } catch (e) {
    if (e.code === 'P2025') return res.status(404).json({ error: 'Service not found' });
    next(e);
  }
});

router.delete('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    await prisma.service.delete({ where: { id: req.params.id } });
    await invalidate('services:*');
    res.json({ ok: true });
  } catch (e) {
    if (e.code === 'P2025') return res.status(404).json({ error: 'Service not found' });
    next(e);
  }
});

export default router;
