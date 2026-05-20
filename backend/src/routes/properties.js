import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { cache, invalidate } from '../lib/cache.js';
import { requireAuth, requireAdmin, optionalAuth } from '../middleware/auth.js';
import { serializeProperty } from '../lib/serializers.js';
import { enqueue } from '../lib/queue.js';
import { logAdminAction } from '../middleware/adminLog.js';
import { storeImages, storeImage } from '../lib/storage.js';

const router = Router();

/* GET /api/properties */
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const isAdmin = req.user?.role === 'admin';
    const { q, region, location, type, transaction, minPrice, maxPrice, minRooms, minSurface, featured, tag, sort } = req.query;

    const where = {};
    if (region)      where.region = region;
    if (location)    where.location = location;
    if (type)        where.type = type;
    if (transaction) where.transaction = transaction;
    if (minPrice)    where.price   = { ...(where.price   || {}), gte: Number(minPrice) };
    if (maxPrice)    where.price   = { ...(where.price   || {}), lte: Number(maxPrice) };
    if (minRooms)    where.rooms   = { gte: Number(minRooms) };
    if (minSurface)  where.surface = { gte: Number(minSurface) };
    if (featured === 'true') where.featured = true;
    if (q) {
      where.OR = [
        { title:       { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { location:    { contains: q, mode: 'insensitive' } },
        { type:        { contains: q, mode: 'insensitive' } },
      ];
    }

    const orderBy =
      sort === 'price-asc'     ? { price:   'asc'  } :
      sort === 'price-desc'    ? { price:   'desc' } :
      sort === 'surface-desc'  ? { surface: 'desc' } :
                                  { listedAt:'desc' };

    let rows = await prisma.property.findMany({ where, orderBy });
    // Tag filter (since tags is stored as Json[]) — done in-memory
    if (tag) rows = rows.filter((p) => Array.isArray(p.tags) && p.tags.includes(tag));

    // Facets are cached (5 min) because they're computed across the whole table
    const facets = await cache('properties:facets', 300, async () => {
      const all = await prisma.property.findMany({ select: { region: true, location: true, type: true } });
      return {
        regions:   [...new Set(all.map((p) => p.region).filter(Boolean))],
        locations: [...new Set(all.map((p) => p.location))],
        types:     [...new Set(all.map((p) => p.type))],
      };
    });

    res.json({
      properties: rows.map((p) => serializeProperty(p, { isAdmin })),
      total: rows.length,
      facets,
    });
  } catch (e) { next(e); }
});

/* GET /api/properties/:id */
router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const isAdmin = req.user?.role === 'admin';
    const p = await prisma.property.findUnique({ where: { id: req.params.id } });
    if (!p) return res.status(404).json({ error: 'Property not found' });

    const similar = await prisma.property.findMany({
      where: { id: { not: p.id }, region: p.region },
      take: 3,
      orderBy: { listedAt: 'desc' },
    });

    res.json({
      property: serializeProperty(p, { isAdmin }),
      similar:  similar.map((x) => serializeProperty(x, { isAdmin })),
    });
  } catch (e) { next(e); }
});

/* POST /api/properties — admin */
router.post('/', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const b = req.body || {};
    if (!b.title || !b.price || !b.location || !b.type)
      return res.status(400).json({ error: 'title, price, location, type required' });

    const p = await prisma.property.create({
      data: {
        reference: b.reference || null,
        title: b.title, titleEn: b.titleEn || b.title,
        type: b.type, transaction: b.transaction || 'sale',
        price: Number(b.price), currency: b.currency || 'EUR',
        location: b.location, region: b.region || null,
        coordinates: b.coordinates || null,
        surface: Number(b.surface || 0),
        landSurface: b.landSurface ? Number(b.landSurface) : null,
        rooms: Number(b.rooms || 0), bedrooms: Number(b.bedrooms || 0),
        bathrooms: Number(b.bathrooms || 0), parking: Number(b.parking || 0),
        yearBuilt: b.yearBuilt ? Number(b.yearBuilt) : null,
        eligibility: b.eligibility || '', eligibilityEn: b.eligibilityEn || b.eligibility || '',
        images: Array.isArray(b.images) && b.images.length ? b.images : ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1600&q=80'],
        description: b.description || '', descriptionEn: b.descriptionEn || b.description || '',
        features: Array.isArray(b.features) ? b.features : [],
        tags: Array.isArray(b.tags) ? b.tags : [],
        agent: b.agent || null,
        featured: !!b.featured, new: true,
        sourceUrl: b.sourceUrl || null,
        internalNotes: b.internalNotes || null,
      },
    });

    await invalidate('properties:*');
    enqueue('notifications', 'fanout-property', { propertyId: p.id }).catch(() => {});
    res.status(201).json({ property: serializeProperty(p, { isAdmin: true }) });
  } catch (e) { next(e); }
});

/* PUT /api/properties/:id — admin */
router.put('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const editable = ['reference','title','titleEn','type','transaction','price','currency','location','region','coordinates','surface','landSurface','rooms','bedrooms','bathrooms','parking','yearBuilt','eligibility','eligibilityEn','images','description','descriptionEn','features','tags','agent','featured','new','sourceUrl','internalNotes'];
    const data = {};
    for (const k of editable) if (k in (req.body || {})) data[k] = req.body[k];
    const p = await prisma.property.update({ where: { id: req.params.id }, data });
    await invalidate('properties:*');
    res.json({ property: serializeProperty(p, { isAdmin: true }) });
  } catch (e) {
    if (e.code === 'P2025') return res.status(404).json({ error: 'Property not found' });
    next(e);
  }
});

/* DELETE /api/properties/:id — admin */
router.delete('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    await prisma.property.delete({ where: { id: req.params.id } });
    await invalidate('properties:*');
    res.json({ ok: true });
  } catch (e) {
    if (e.code === 'P2025') return res.status(404).json({ error: 'Property not found' });
    next(e);
  }
});

export default router;
