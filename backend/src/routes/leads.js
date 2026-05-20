import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { enqueue } from '../lib/queue.js';
import { notify } from '../lib/notifications.js';
import { leadLimiter } from '../middleware/rateLimit.js';
import { validate, schemas } from '../lib/validators.js';

const router = Router();

/* Coerce arbitrary input into the new unified shape and validate FK targets. */
async function buildLeadData(body) {
  const { name, email, phone, message, source, interest } = body || {};
  if (!name || !email) return { error: 'Name and email required' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'Invalid email' };
  if (String(name).trim().length < 2) return { error: 'Name too short' };
  if (String(message || '').length > 2000) return { error: 'Message too long' };

  // Type resolution — accept either explicit `type` or legacy `interest`
  let type = body?.type;
  let propertyId = body?.propertyId || null;
  let serviceId  = body?.serviceId  || null;

  if (!type) {
    if (propertyId) type = 'property';
    else if (serviceId) type = 'service';
    else if (typeof interest === 'string' && interest.startsWith('service:')) {
      type = 'service';
      serviceId = interest.slice('service:'.length);
    } else type = 'general';
  }

  // Validate FKs (mismatches would be silent NULLs otherwise)
  if (propertyId) {
    const exists = await prisma.property.findUnique({ where: { id: propertyId }, select: { id: true } });
    if (!exists) return { error: 'Linked property not found' };
  }
  if (serviceId) {
    const exists = await prisma.service.findUnique({ where: { id: serviceId }, select: { id: true } });
    if (!exists) return { error: 'Linked service not found' };
  }

  return {
    data: {
      type,
      propertyId: type === 'property' ? propertyId : null,
      serviceId:  type === 'service'  ? serviceId  : null,
      name:    String(name).trim(),
      email:   String(email).trim().toLowerCase(),
      phone:   phone ? String(phone).trim() : null,
      message: message ? String(message).trim() : null,
      source:  source || 'landing',
      interest: interest || (type === 'service' && serviceId ? `service:${serviceId}` : 'real-estate'),
    },
  };
}

/* ---------- POST /api/leads (public capture) ---------- */
router.post('/', leadLimiter, validate(schemas.createLead), async (req, res, next) => {
  try {
    const { data, error } = await buildLeadData(req.body);
    if (error) return res.status(400).json({ error });

    const lead = await prisma.lead.create({
      data,
      include: {
        property: { select: { id: true, title: true, reference: true } },
        service:  { select: { id: true, name: true, category: true } },
      },
    });

    // Async email follow-up (non-blocking)
    enqueue('email', 'lead-followup', { leadId: lead.id }).catch(() => {});

    // Notify every admin (in-app + DB)
    const admins = await prisma.user.findMany({ where: { role: 'admin' }, select: { id: true } });
    const label = lead.type === 'property' ? 'Lead immobilier' : lead.type === 'service' ? 'Lead service' : 'Lead';
    for (const a of admins) {
      notify({
        userId: a.id, type: 'NEW_LEAD',
        payload: {
          leadId: lead.id, name: lead.name, leadType: lead.type,
          propertyId: lead.propertyId, serviceId: lead.serviceId, label,
        },
      }).catch(() => {});
    }

    res.status(201).json({ lead });
  } catch (e) { next(e); }
});

/* ---------- GET (admin) — list with filters + relations ---------- */
async function listHandler(req, res, next) {
  try {
    const { type, status, q, from, to } = req.query;
    const where = {};
    if (type   && ['property', 'service', 'general'].includes(type)) where.type = type;
    if (status && ['new', 'contacted', 'converted', 'closed'].includes(status)) where.status = status;
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to)   where.createdAt.lte = new Date(to);
    }
    if (q) {
      where.OR = [
        { name:    { contains: q, mode: 'insensitive' } },
        { email:   { contains: q, mode: 'insensitive' } },
        { message: { contains: q, mode: 'insensitive' } },
      ];
    }
    const leads = await prisma.lead.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        property: { select: { id: true, title: true, reference: true, location: true } },
        service:  { select: { id: true, name: true, category: true } },
      },
    });
    res.json({ leads, total: leads.length });
  } catch (e) { next(e); }
}

router.get('/', requireAuth, requireAdmin, listHandler);

/* ---------- PATCH (admin) ---------- */
async function patchHandler(req, res, next) {
  try {
    const data = {};
    if (req.body?.status !== undefined) {
      if (!['new','contacted','converted','closed'].includes(req.body.status))
        return res.status(400).json({ error: 'Invalid status' });
      data.status = req.body.status;
    }
    if (req.body?.notes !== undefined) data.notes = req.body.notes;
    const lead = await prisma.lead.update({
      where: { id: req.params.id },
      data,
      include: {
        property: { select: { id: true, title: true, reference: true } },
        service:  { select: { id: true, name: true, category: true } },
      },
    });
    res.json({ lead });
  } catch (e) {
    if (e.code === 'P2025') return res.status(404).json({ error: 'Lead not found' });
    next(e);
  }
}
router.patch('/:id', requireAuth, requireAdmin, patchHandler);

/* ---------- DELETE (admin) ---------- */
async function deleteHandler(req, res, next) {
  try {
    await prisma.lead.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (e) {
    if (e.code === 'P2025') return res.status(404).json({ error: 'Lead not found' });
    next(e);
  }
}
router.delete('/:id', requireAuth, requireAdmin, deleteHandler);

export default router;
