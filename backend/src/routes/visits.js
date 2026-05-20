import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { notify } from '../lib/notifications.js';

const router = Router();

/* POST /api/visits — authenticated request. Also auto-creates a Lead so it
   surfaces in the unified admin Leads dashboard. */
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { propertyId, preferredDate, message, phone } = req.body || {};
    if (!propertyId) return res.status(400).json({ error: 'propertyId required' });
    const property = await prisma.property.findUnique({ where: { id: propertyId } });
    if (!property) return res.status(404).json({ error: 'Property not found' });
    const user = await prisma.user.findUnique({ where: { id: req.user.sub } });

    const vr = await prisma.visitRequest.create({
      data: {
        propertyId, userId: user.id,
        userName: user.name, userEmail: user.email, userPhone: phone || user.phone || '',
        preferredDate: preferredDate || null,
        message: message || null,
      },
    });

    // Mirror as a unified Lead so the admin sees every interest in one place
    const leadMessage = `[Demande de visite${preferredDate ? ` — ${preferredDate}` : ''}] ${message || ''}`.trim();
    const lead = await prisma.lead.create({
      data: {
        type: 'property', propertyId,
        name: user.name, email: user.email, phone: phone || user.phone || null,
        message: leadMessage || null,
        source: 'visit-request', interest: 'real-estate', status: 'new',
      },
    });

    const admins = await prisma.user.findMany({ where: { role: 'admin' }, select: { id: true } });
    for (const a of admins) {
      notify({ userId: a.id, type: 'NEW_VISIT_REQUEST',
        payload: { visitId: vr.id, leadId: lead.id, propertyId, actorId: user.id, label: 'Demande de visite' } }).catch(() => {});
    }
    res.status(201).json({ visitRequest: vr, lead });
  } catch (e) { next(e); }
});

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const where = isAdmin ? {} : { userId: req.user.sub };
    const visitRequests = await prisma.visitRequest.findMany({ where, orderBy: { createdAt: 'desc' } });
    res.json({ visitRequests, total: visitRequests.length });
  } catch (e) { next(e); }
});

router.patch('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const data = {};
    if (req.body?.status !== undefined) data.status = req.body.status;
    if (req.body?.notes  !== undefined) data.notes  = req.body.notes;
    const vr = await prisma.visitRequest.update({ where: { id: req.params.id }, data });
    res.json({ visitRequest: vr });
  } catch (e) {
    if (e.code === 'P2025') return res.status(404).json({ error: 'Visit request not found' });
    next(e);
  }
});

export default router;
