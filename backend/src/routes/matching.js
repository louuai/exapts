import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import { refreshUserIntelligence } from '../lib/matching.js';

const router = Router();

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    let recommendations = await prisma.matchRecommendation.findMany({
      where: { userId: req.user.sub, status: 'active' },
      orderBy: { score: 'desc' },
      take: 40,
      include: {
        property: true,
        service: { include: { partner: { select: { id: true, companyName: true, name: true, avatar: true, status: true } } } },
      },
    });
    if (!recommendations.length) {
      await refreshUserIntelligence(req.user.sub);
      recommendations = await prisma.matchRecommendation.findMany({
        where: { userId: req.user.sub, status: 'active' },
        orderBy: { score: 'desc' },
        take: 40,
        include: {
          property: true,
          service: { include: { partner: { select: { id: true, companyName: true, name: true, avatar: true, status: true } } } },
        },
      });
    }
    const score = await prisma.leadScore.findUnique({ where: { userId: req.user.sub } });
    res.json({
      score,
      recommendations,
      properties: recommendations.filter((r) => r.type === 'property' && r.property).map((r) => ({ ...r.property, matchScore: r.score, matchReason: r.reason })),
      services: recommendations.filter((r) => r.type === 'service' && r.service).map((r) => ({ ...r.service, matchScore: r.score, matchReason: r.reason })),
      guides: recommendations.filter((r) => r.type === 'guide'),
    });
  } catch (e) { next(e); }
});

router.post('/events/property-view', requireAuth, async (req, res, next) => {
  try {
    const propertyId = req.body?.propertyId;
    if (!propertyId) return res.status(400).json({ error: 'propertyId required' });
    await prisma.viewedProperty.create({ data: { userId: req.user.sub, propertyId } });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

router.post('/events/service-click', requireAuth, async (req, res, next) => {
  try {
    const serviceId = req.body?.serviceId;
    if (!serviceId) return res.status(400).json({ error: 'serviceId required' });
    await prisma.clickedService.create({ data: { userId: req.user.sub, serviceId, source: req.body?.source || null } });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

router.get('/personalized-feed', optionalAuth, async (req, res, next) => {
  try {
    if (!req.user?.sub) return res.json({ properties: [], services: [], guides: [] });
    const recs = await prisma.matchRecommendation.findMany({
      where: { userId: req.user.sub, status: 'active' },
      orderBy: { score: 'desc' },
      take: 18,
      include: { property: true, service: true },
    });
    res.json({
      properties: recs.filter((r) => r.type === 'property' && r.property).map((r) => r.property),
      services: recs.filter((r) => r.type === 'service' && r.service).map((r) => r.service),
      guides: recs.filter((r) => r.type === 'guide').map((r) => ({ id: r.guideId, matchScore: r.score, reason: r.reason })),
    });
  } catch (e) { next(e); }
});

export default router;
