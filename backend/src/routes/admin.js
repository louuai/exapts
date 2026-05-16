import { Router } from 'express';
import {
  users, properties, leads, visitRequests, messages, services, publicUser,
} from '../data/store.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

/* GET /api/admin/stats — overview KPIs + recent activity */
router.get('/stats', requireAuth, requireAdmin, (_req, res) => {
  const newLeads = leads.filter((l) => l.status === 'new').length;
  const pendingVisits = visitRequests.filter((v) => v.status === 'pending').length;
  const openMessages = messages.filter((m) => m.status === 'open').length;

  const recentActivity = [
    ...leads.slice(0, 5).map((l) => ({
      type: 'lead', id: l.id, label: l.name, sub: l.email, at: l.createdAt, status: l.status,
    })),
    ...visitRequests.slice(0, 5).map((v) => ({
      type: 'visit', id: v.id, label: v.userName, sub: `Visite — ${v.propertyId}`, at: v.createdAt, status: v.status,
    })),
    ...messages.slice(0, 5).map((m) => ({
      type: 'message', id: m.id, label: m.userName, sub: `Message — ${m.propertyId}`, at: m.createdAt, status: m.status,
    })),
  ]
    .sort((a, b) => new Date(b.at) - new Date(a.at))
    .slice(0, 10);

  res.json({
    stats: {
      users: users.length,
      properties: properties.length,
      propertiesSale: properties.filter((p) => p.transaction === 'sale').length,
      propertiesRent: properties.filter((p) => p.transaction === 'rent').length,
      services: services.length,
      leads: leads.length,
      newLeads,
      visits: visitRequests.length,
      pendingVisits,
      messages: messages.length,
      openMessages,
    },
    recentActivity,
  });
});

/* GET /api/admin/users — list (read-only here, full CRUD can come in V2) */
router.get('/users', requireAuth, requireAdmin, (_req, res) => {
  res.json({ users: users.map(publicUser) });
});

export default router;
