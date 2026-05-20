import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { serializeProperty } from '../lib/serializers.js';

const router = Router();

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const rows = await prisma.favorite.findMany({
      where: { userId: req.user.sub },
      include: { property: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json({
      favorites: rows.map((r) => serializeProperty(r.property)),
      ids: rows.map((r) => r.propertyId),
    });
  } catch (e) { next(e); }
});

router.post('/:propertyId', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user.sub;
    const propertyId = req.params.propertyId;
    const property = await prisma.property.findUnique({ where: { id: propertyId } });
    if (!property) return res.status(404).json({ error: 'Property not found' });

    const existing = await prisma.favorite.findUnique({ where: { userId_propertyId: { userId, propertyId } } });
    if (existing) {
      await prisma.favorite.delete({ where: { id: existing.id } });
    } else {
      await prisma.favorite.create({ data: { userId, propertyId } });
    }

    const ids = (await prisma.favorite.findMany({ where: { userId }, select: { propertyId: true } }))
      .map((f) => f.propertyId);
    res.json({ ids });
  } catch (e) { next(e); }
});

export default router;
