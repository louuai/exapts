import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { serializeUser } from '../lib/serializers.js';
import { validate, schemas } from '../lib/validators.js';
import { logAdminAction } from '../middleware/adminLog.js';
import { storeImage } from '../lib/storage.js';

const router = Router();
const BCRYPT_ROUNDS = 10;

function startOfDay(d) {
  const out = new Date(d);
  out.setHours(0, 0, 0, 0);
  return out;
}

function buildDailySeries(items, key, days = 30) {
  const today = startOfDay(new Date());
  const buckets = Array.from({ length: days }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (days - 1 - i));
    return {
      key: date.toISOString().slice(0, 10),
      label: date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
      value: 0,
    };
  });
  const index = new Map(buckets.map((b, i) => [b.key, i]));
  for (const item of items) {
    const value = item?.[key];
    if (!value) continue;
    const bucketKey = new Date(value).toISOString().slice(0, 10);
    const bucketIndex = index.get(bucketKey);
    if (bucketIndex !== undefined) buckets[bucketIndex].value += 1;
  }
  return buckets;
}

/* GET /api/admin/stats — includes leads breakdown by type for the dashboard */
router.get('/stats', requireAuth, requireAdmin, async (_req, res, next) => {
  try {
    const dayAgo  = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const weekAgo = new Date(Date.now() -  7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [
      users, properties, propertiesSale, propertiesRent,
      services, leads, newLeads,
      leadsProperty, leadsService, leadsGeneral,
      leads24h, leads7d, convertedLeads,
      visits, pendingVisits, inquiries, openInquiries,
      posts, comments, likes, reposts, conversations, chatMessages, notifications,
      recentLeads, recentVisits, recentInquiries,
      userRoles, leadStatuses, visitStatuses, messageStatuses,
      propertyRegions, serviceCategories, leadSources,
      recentUsers, recentPosts, recentAdminLogs,
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
      prisma.comment.count(),
      prisma.like.count(),
      prisma.repost.count(),
      prisma.conversation.count(),
      prisma.chatMessage.count(),
      prisma.notification.count(),
      prisma.lead.findMany({
        orderBy: { createdAt: 'desc' }, take: 8,
        include: {
          property: { select: { id: true, title: true, reference: true } },
          service:  { select: { id: true, name: true, category: true } },
        },
      }),
      prisma.visitRequest.findMany({ orderBy: { createdAt: 'desc' }, take: 5 }),
      prisma.inquiry.findMany({ orderBy: { createdAt: 'desc' }, take: 5 }),
      prisma.user.groupBy({ by: ['role'], _count: { _all: true } }),
      prisma.lead.groupBy({ by: ['status'], _count: { _all: true } }),
      prisma.visitRequest.groupBy({ by: ['status'], _count: { _all: true } }),
      prisma.inquiry.groupBy({ by: ['status'], _count: { _all: true } }),
      prisma.property.groupBy({ by: ['region'], _count: { _all: true } }),
      prisma.service.groupBy({ by: ['category'], _count: { _all: true } }),
      prisma.lead.groupBy({ by: ['source'], _count: { _all: true } }),
      prisma.user.findMany({ where: { createdAt: { gte: monthAgo } }, select: { createdAt: true } }),
      prisma.post.findMany({ where: { createdAt: { gte: monthAgo } }, select: { createdAt: true } }),
      prisma.adminLog.findMany({ orderBy: { createdAt: 'desc' }, take: 8 }),
    ]);

    const recentLeadsSeries = await prisma.lead.findMany({
      where: { createdAt: { gte: monthAgo } },
      select: { createdAt: true },
    });

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
      analytics: {
        content: {
          posts,
          comments,
          likes,
          reposts,
          conversations,
          chatMessages,
          notifications,
        },
        users: {
          total: users,
          roles: userRoles.map((row) => ({ role: row.role, count: row._count._all })),
          growth30d: buildDailySeries(recentUsers, 'createdAt', 30),
        },
        leads: {
          total: leads,
          statuses: leadStatuses.map((row) => ({ status: row.status, count: row._count._all })),
          sources: leadSources
            .map((row) => ({ source: row.source || 'unknown', count: row._count._all }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 8),
          growth30d: buildDailySeries(recentLeadsSeries, 'createdAt', 30),
        },
        visits: visitStatuses.map((row) => ({ status: row.status, count: row._count._all })),
        messages: messageStatuses.map((row) => ({ status: row.status, count: row._count._all })),
        inventory: {
          propertiesByRegion: propertyRegions
            .map((row) => ({ region: row.region || 'Non définie', count: row._count._all }))
            .sort((a, b) => b.count - a.count),
          servicesByCategory: serviceCategories
            .map((row) => ({ category: row.category || 'Autre', count: row._count._all }))
            .sort((a, b) => b.count - a.count),
        },
        publishing: {
          growth30d: buildDailySeries(recentPosts, 'createdAt', 30),
          engagementRate: posts ? Number((((comments + likes + reposts) / posts)).toFixed(2)) : 0,
        },
        business: {
          conversionRate: leads ? Number(((convertedLeads / leads) * 100).toFixed(1)) : 0,
          responseLoad: pendingVisits + openInquiries + newLeads,
        },
        adminLogs: recentAdminLogs,
      },
      recentLeads,
      recentActivity,
    });
  } catch (e) { next(e); }
});

/* GET /api/admin/users */
router.get('/users', requireAuth, requireAdmin, async (_req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            posts: true,
            followers: true,
            following: true,
            notifications: true,
            conversationsA: true,
            conversationsB: true,
          },
        },
      },
    });
    res.json({
      users: users.map((u) => ({
        ...serializeUser(u, { includePrivate: true }),
        conversationsCount: (u._count?.conversationsA || 0) + (u._count?.conversationsB || 0),
      })),
    });
  } catch (e) { next(e); }
});

router.post(
  '/users',
  requireAuth,
  requireAdmin,
  validate(schemas.adminCreateUser),
  logAdminAction('user.create', (_req, res) => ({ targetType: 'user', targetId: res.locals.createdId })),
  async (req, res, next) => {
    try {
      const email = String(req.body.email || '').trim().toLowerCase();
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) return res.status(409).json({ error: 'Email already registered' });

      let avatar = req.body.avatar || null;
      if (avatar) avatar = await storeImage(avatar);

      const created = await prisma.user.create({
        data: {
          email,
          name: req.body.name.trim(),
          passwordHash: bcrypt.hashSync(req.body.password, BCRYPT_ROUNDS),
          phone: req.body.phone || null,
          bio: req.body.bio || null,
          location: req.body.location || null,
          role: req.body.role,
          avatar: avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(req.body.name)}`,
          notificationPrefs: req.body.notificationPrefs || undefined,
        },
        include: {
          _count: {
            select: {
              posts: true,
              followers: true,
              following: true,
              notifications: true,
              conversationsA: true,
              conversationsB: true,
            },
          },
        },
      });
      res.locals.createdId = created.id;
      res.status(201).json({
        user: {
          ...serializeUser(created, { includePrivate: true }),
          conversationsCount: (created._count?.conversationsA || 0) + (created._count?.conversationsB || 0),
        },
      });
    } catch (e) { next(e); }
  }
);

router.patch(
  '/users/:id',
  requireAuth,
  requireAdmin,
  validate(schemas.adminUpdateUser),
  logAdminAction('user.update', (req) => ({ targetType: 'user', targetId: req.params.id })),
  async (req, res, next) => {
    try {
      const existing = await prisma.user.findUnique({ where: { id: req.params.id } });
      if (!existing) return res.status(404).json({ error: 'User not found' });

      const data = {};
      if (req.body.email !== undefined) {
        const email = String(req.body.email || '').trim().toLowerCase();
        if (email !== existing.email) {
          const duplicate = await prisma.user.findUnique({ where: { email } });
          if (duplicate) return res.status(409).json({ error: 'Email already registered' });
          data.email = email;
        }
      }
      if (req.body.name !== undefined) data.name = req.body.name.trim();
      if (req.body.phone !== undefined) data.phone = req.body.phone || null;
      if (req.body.bio !== undefined) data.bio = req.body.bio || null;
      if (req.body.location !== undefined) data.location = req.body.location || null;
      if (req.body.notificationPrefs !== undefined) data.notificationPrefs = req.body.notificationPrefs;
      if (req.body.role !== undefined) {
        if (existing.id === req.user.sub && req.body.role !== 'admin') {
          return res.status(400).json({ error: 'You cannot remove your own admin access' });
        }
        if (existing.role === 'admin' && req.body.role !== 'admin') {
          const admins = await prisma.user.count({ where: { role: 'admin' } });
          if (admins <= 1) return res.status(400).json({ error: 'At least one admin must remain' });
        }
        data.role = req.body.role;
      }
      if (req.body.password) data.passwordHash = bcrypt.hashSync(req.body.password, BCRYPT_ROUNDS);
      if (req.body.avatar !== undefined) {
        data.avatar = req.body.avatar ? await storeImage(req.body.avatar) : null;
      }

      const updated = await prisma.user.update({
        where: { id: existing.id },
        data,
        include: {
          _count: {
            select: {
              posts: true,
              followers: true,
              following: true,
              notifications: true,
              conversationsA: true,
              conversationsB: true,
            },
          },
        },
      });

      res.json({
        user: {
          ...serializeUser(updated, { includePrivate: true }),
          conversationsCount: (updated._count?.conversationsA || 0) + (updated._count?.conversationsB || 0),
        },
      });
    } catch (e) { next(e); }
  }
);

router.delete(
  '/users/:id',
  requireAuth,
  requireAdmin,
  logAdminAction('user.delete', (req) => ({ targetType: 'user', targetId: req.params.id })),
  async (req, res, next) => {
    try {
      const existing = await prisma.user.findUnique({ where: { id: req.params.id } });
      if (!existing) return res.status(404).json({ error: 'User not found' });
      if (existing.id === req.user.sub) return res.status(400).json({ error: 'You cannot delete your own account here' });
      if (existing.role === 'admin') {
        const admins = await prisma.user.count({ where: { role: 'admin' } });
        if (admins <= 1) return res.status(400).json({ error: 'At least one admin must remain' });
      }
      await prisma.user.delete({ where: { id: existing.id } });
      res.json({ ok: true });
    } catch (e) { next(e); }
  }
);

export default router;
