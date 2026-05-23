import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma.js';
import { validate, schemas } from '../lib/validators.js';
import { serializePartner, serializeService } from '../lib/serializers.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { requirePartner, signPartnerToken } from '../middleware/partnerAuth.js';
import { authLimiter } from '../middleware/rateLimit.js';
import { logAdminAction } from '../middleware/adminLog.js';
import { storeImage } from '../lib/storage.js';
import { invalidate } from '../lib/cache.js';

const router = Router();
const BCRYPT_ROUNDS = 10;
const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

function partnerSelect() {
  return {
    include: {
      services: {
        orderBy: { updatedAt: 'desc' },
        include: { _count: { select: { leads: true } } },
      },
    },
  };
}

function withLeadCount(service) {
  if (!service) return service;
  const { _count, ...rest } = service;
  return { ...rest, leadsCount: _count?.leads || 0 };
}

function formatPartner(partner) {
  return {
    ...serializePartner(partner, { includePrivate: true }),
    services: (partner.services || []).map((s) => serializeService(withLeadCount(s), { isAdmin: true })),
  };
}

/* Partner auth */
router.post('/login', authLimiter, validate(schemas.partnerLogin), async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);
    const partner = await prisma.partner.findUnique({ where: { email } });
    if (!partner || partner.status !== 'active') return res.status(401).json({ error: 'Invalid credentials' });
    if (!bcrypt.compareSync(req.body.password, partner.passwordHash)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    await prisma.partner.update({ where: { id: partner.id }, data: { lastLoginAt: new Date() } });
    res.json({
      token: signPartnerToken(partner),
      partner: serializePartner({ ...partner, lastLoginAt: new Date() }, { includePrivate: true }),
    });
  } catch (e) { next(e); }
});

router.get('/me', requirePartner, async (req, res, next) => {
  try {
    const partner = await prisma.partner.findUnique({ where: { id: req.partner.id }, ...partnerSelect() });
    const { services, ...profile } = partner;
    res.json({
      partner: serializePartner(profile, { includePrivate: true }),
      services: services.map((s) => serializeService(withLeadCount(s), { isAdmin: true })),
    });
  } catch (e) { next(e); }
});

router.patch('/me', requirePartner, validate(schemas.partnerUpdateProfile), async (req, res, next) => {
  try {
    const data = { ...req.body };
    if (data.avatar) data.avatar = await storeImage(data.avatar);
    const partner = await prisma.partner.update({ where: { id: req.partner.id }, data });
    res.json({ partner: serializePartner(partner, { includePrivate: true }) });
  } catch (e) { next(e); }
});

router.get('/leads', requirePartner, async (req, res, next) => {
  try {
    const serviceIds = (await prisma.service.findMany({
      where: { partnerId: req.partner.id },
      select: { id: true },
    })).map((s) => s.id);
    const leads = await prisma.lead.findMany({
      where: { serviceId: { in: serviceIds } },
      orderBy: { createdAt: 'desc' },
      include: { service: { select: { id: true, name: true, category: true } } },
    });
    res.json({ leads, total: leads.length });
  } catch (e) { next(e); }
});

router.patch('/leads/:id', requirePartner, async (req, res, next) => {
  try {
    const lead = await prisma.lead.findFirst({
      where: { id: req.params.id, service: { partnerId: req.partner.id } },
    });
    if (!lead) return res.status(404).json({ error: 'Lead not found' });
    const data = {};
    if (req.body?.status !== undefined) {
      if (!['new', 'contacted', 'converted', 'closed'].includes(req.body.status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }
      data.status = req.body.status;
    }
    if (req.body?.notes !== undefined) data.notes = req.body.notes;
    const updated = await prisma.lead.update({
      where: { id: lead.id },
      data,
      include: { service: { select: { id: true, name: true, category: true } } },
    });
    res.json({ lead: updated });
  } catch (e) { next(e); }
});

/* Admin partner management */
router.get('/admin', requireAuth, requireAdmin, async (_req, res, next) => {
  try {
    const partners = await prisma.partner.findMany({
      orderBy: { createdAt: 'desc' },
      ...partnerSelect(),
    });
    res.json({
      partners: partners.map(formatPartner),
    });
  } catch (e) { next(e); }
});

router.post(
  '/admin',
  requireAuth,
  requireAdmin,
  validate(schemas.adminCreatePartner),
  logAdminAction('partner.create', (_req, res) => ({ targetType: 'partner', targetId: res.locals.createdId })),
  async (req, res, next) => {
    try {
      const email = normalizeEmail(req.body.email);
      const exists = await prisma.partner.findUnique({ where: { email } });
      if (exists) return res.status(409).json({ error: 'Partner email already exists' });
      let avatar = req.body.avatar || null;
      if (avatar) avatar = await storeImage(avatar);
      const partner = await prisma.partner.create({
        data: {
          email,
          passwordHash: bcrypt.hashSync(req.body.password, BCRYPT_ROUNDS),
          name: req.body.name,
          companyName: req.body.companyName,
          phone: req.body.phone || null,
          avatar,
          bio: req.body.bio || null,
          location: req.body.location || null,
          website: req.body.website || null,
          status: req.body.status || 'active',
        },
        ...partnerSelect(),
      });
      res.locals.createdId = partner.id;
      res.status(201).json({ partner: formatPartner(partner) });
    } catch (e) { next(e); }
  }
);

router.patch(
  '/admin/:id',
  requireAuth,
  requireAdmin,
  validate(schemas.adminUpdatePartner),
  logAdminAction('partner.update', (req) => ({ targetType: 'partner', targetId: req.params.id })),
  async (req, res, next) => {
    try {
      const existing = await prisma.partner.findUnique({ where: { id: req.params.id } });
      if (!existing) return res.status(404).json({ error: 'Partner not found' });
      const data = {};
      if (req.body.email !== undefined) {
        const email = normalizeEmail(req.body.email);
        if (email !== existing.email) {
          const duplicate = await prisma.partner.findUnique({ where: { email } });
          if (duplicate) return res.status(409).json({ error: 'Partner email already exists' });
          data.email = email;
        }
      }
      for (const k of ['name', 'companyName', 'phone', 'bio', 'location', 'website', 'status']) {
        if (req.body[k] !== undefined) data[k] = req.body[k] || null;
      }
      if (req.body.password) data.passwordHash = bcrypt.hashSync(req.body.password, BCRYPT_ROUNDS);
      if (req.body.avatar !== undefined) data.avatar = req.body.avatar ? await storeImage(req.body.avatar) : null;
      const partner = await prisma.partner.update({ where: { id: existing.id }, data, ...partnerSelect() });
      res.json({ partner: formatPartner(partner) });
    } catch (e) { next(e); }
  }
);

router.delete(
  '/admin/:id',
  requireAuth,
  requireAdmin,
  logAdminAction('partner.delete', (req) => ({ targetType: 'partner', targetId: req.params.id })),
  async (req, res, next) => {
    try {
      await prisma.partner.delete({ where: { id: req.params.id } });
      await invalidate('services:*');
      res.json({ ok: true });
    } catch (e) {
      if (e.code === 'P2025') return res.status(404).json({ error: 'Partner not found' });
      next(e);
    }
  }
);

export default router;
