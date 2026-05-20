import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { cache } from '../lib/cache.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const { q, category } = req.query;
    const cacheKey = `guides:list:${q || ''}:${category || ''}`;
    const result = await cache(cacheKey, 60, async () => {
      const where = {};
      if (category) where.category = category;
      if (q) {
        where.OR = [
          { title:       { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
        ];
      }
      const guides = await prisma.guide.findMany({ where, orderBy: { updatedAt: 'desc' } });
      return guides.map(({ steps, tips, ...rest }) => ({
        ...rest,
        stepCount: Array.isArray(steps) ? steps.length : 0,
        tipCount:  Array.isArray(tips)  ? tips.length  : 0,
      }));
    });
    res.json({ guides: result });
  } catch (e) { next(e); }
});

router.get('/:slug', async (req, res, next) => {
  try {
    const guide = await prisma.guide.findUnique({ where: { slug: req.params.slug } });
    if (!guide) return res.status(404).json({ error: 'Guide not found' });
    res.json({ guide });
  } catch (e) { next(e); }
});

export default router;
