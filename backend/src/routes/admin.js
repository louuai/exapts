import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { serializeUser } from '../lib/serializers.js';

const router = Router();

/* GET /api/admin/stats — includes leads breakdown by type for the dashboard */
router.get('/stats', requireAuth, requireAdmin, async (_req, res, next) => {
  try {
    const dayAgo  = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const weekAgo = new Date(Date.now() -  7 * 24 * 60 * 60 * 1000);

    const [
      users, properties, propertiesSale, propertiesRent,
      services, leads, newLeads,
      leadsProperty, leadsService, leadsGeneral,
      leads24h, leads7d, convertedLeads,
      visits, pendingVisits, inquiries, openInquiries,
      posts,
      recentLeads, recentVisits, recentInquiries,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.property.count(),
      prisma.property.count({ where: { transaction: 'sale' } }),
      prisma.property.count({ where: { transaction: 'rent' } }),
      prisma.service.count(),
      prisma.lead.count(),
      prisma.lead.count({ where: { status: 'new' } }),
      prisma.lead.count({ where: { type: 'property' } }),
      prisma.lead.count({ where: { type: 'service' } }),
      prisma.lead.count({ where: { type: 'general' } }),
      prisma.lead.count({ where: { createdAt: { gte: dayAgo } } }),
      prisma.lead.count({ where: { createdAt: { gte: weekAgo } } }),
      prisma.lead.count({ where: { status: 'converted' } }),
      prisma.visitRequest.count(),
      prisma.visitRequest.count({ where: { status: 'pending' } }),
      prisma.inquiry.count(),
      prisma.inquiry.count({ where: { status: 'open' } }),
      prisma.post.count(),
      prisma.lead.findMany({
        orderBy: { createdAt: 'desc' }, take: 8,
        include: {
          property: { select: { id: true, title: true, reference: true } },
          service:  { select: { id: true, name: true, category: true } },
        },
      }),
      prisma.visitRequest.findMany({ orderBy: { createdAt: 'desc' }, take: 5 }),
      prisma.inquiry.findMany({ orderBy: { createdAt: 'desc' }, take: 5 }),
    ]);

    const recentActivity = [
      ...recentLeads.map((l) => ({
        type: 'lead', id: l.id, label: l.name, sub: l.email,
        at: l.createdAt, status: l.status, leadType: l.type,
      })),
      ...recentVisits.map((v) => ({
        type: 'visit', id: v.id, label: v.userName,
        sub: `Visite — ${v.propertyId}`, at: v.createdAt, status: v.status,
      })),
      ...recentInquiries.map((m) => ({
        type: 'message', id: m.id, label: m.userName,
        sub: `Message — ${m.propertyId}`, at: m.createdAt, status: m.status,
      })),
    ].sort((a, b) => new Date(b.at) - new Date(a.at)).slice(0, 10);

    res.json({
      stats: {
        users,
        properties, propertiesSale, propertiesRent,
        services,
        leads, newLeads, convertedLeads,
        leadsProperty, leadsService, leadsGeneral,
        leads24h, leads7d,
        visits, pendingVisits,
        messages: inquiries, openMessages: openInquiries,
        posts,
      },
      recentLeads,     // exposed separately for the dashboard "Recent leads" widget
      recentActivity,  // mixed feed (kept for back-compat)
    });
  } catch (e) { next(e); }
});

/* GET /api/admin/users */
router.get('/users', requireAuth, requireAdmin, async (_req, res, next) => {
  try {
    const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
    res.json({ users: users.map((u) => serializeUser(u, { includePrivate: true })) });
  } catch (e) { next(e); }
});

export default router;
