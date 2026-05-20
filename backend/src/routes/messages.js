/* Property inquiries — preserved legacy "messages" endpoint.
   For DM chat see /api/conversations.                                  */
import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { notify } from '../lib/notifications.js';

const router = Router();

router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { propertyId, body } = req.body || {};
    if (!propertyId || !body) return res.status(400).json({ error: 'propertyId and body required' });
    const property = await prisma.property.findUnique({ where: { id: propertyId } });
    if (!property) return res.status(404).json({ error: 'Property not found' });
    const user = await prisma.user.findUnique({ where: { id: req.user.sub } });

    const inquiry = await prisma.inquiry.create({
      data: {
        propertyId, userId: user.id,
        userName: user.name, userEmail: user.email, body: String(body).trim(),
      },
    });

    // Mirror as a unified Lead
    const lead = await prisma.lead.create({
      data: {
        type: 'property', propertyId,
        name: user.name, email: user.email, phone: user.phone || null,
        message: `[Demande de contact] ${String(body).trim()}`,
        source: 'property-contact', interest: 'real-estate', status: 'new',
      },
    });

    const admins = await prisma.user.findMany({ where: { role: 'admin' }, select: { id: true } });
    for (const a of admins) {
      notify({ userId: a.id, type: 'NEW_LEAD',
        payload: { inquiryId: inquiry.id, leadId: lead.id, propertyId, leadType: 'property', label: 'Demande de contact' } }).catch(() => {});
    }
    res.status(201).json({ message: inquiry, lead });
  } catch (e) { next(e); }
});

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const where = isAdmin ? {} : { userId: req.user.sub };
    const messages = await prisma.inquiry.findMany({ where, orderBy: { createdAt: 'desc' } });
    res.json({ messages, total: messages.length });
  } catch (e) { next(e); }
});

router.patch('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const data = {};
    if (req.body?.status !== undefined) data.status = req.body.status;
    const message = await prisma.inquiry.update({ where: { id: req.params.id }, data });
    res.json({ message });
  } catch (e) {
    if (e.code === 'P2025') return res.status(404).json({ error: 'Message not found' });
    next(e);
  }
});

export default router;
