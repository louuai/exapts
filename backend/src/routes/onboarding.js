import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { refreshUserIntelligence } from '../lib/matching.js';
import { logAdminAction } from '../middleware/adminLog.js';

const router = Router();

const INTENTS = ['live', 'invest', 'retirement', 'vacation', 'business'];
const BUDGETS = ['lt_2000', '2000_5000', '5000_20000', 'gt_20000'];
const HOUSEHOLDS = ['alone', 'couple', 'family'];
const DURATIONS = ['short_term', 'long_term', 'permanent'];
const SERVICES = ['real_estate', 'tax_optimization', 'banking', 'visa_assistance', 'relocation', 'schooling', 'healthcare', 'concierge', 'car_rental', 'investment_advisory'];
const CONTACTS = ['whatsapp', 'email', 'phone', 'concierge_callback'];

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function cleanProfilePayload(body = {}, partial = false) {
  const data = {};
  if (body.currentStep !== undefined) data.currentStep = Math.max(1, Math.min(6, Number(body.currentStep) || 1));
  if (body.intent !== undefined) {
    if (!INTENTS.includes(body.intent)) throw new Error('Invalid intent');
    data.intent = body.intent;
  }
  if (body.budgetRange !== undefined) {
    if (!BUDGETS.includes(body.budgetRange)) throw new Error('Invalid budget range');
    data.budgetRange = body.budgetRange;
  }
  if (body.household !== undefined) {
    if (!HOUSEHOLDS.includes(body.household)) throw new Error('Invalid household');
    data.household = body.household;
  }
  if (body.hasKids !== undefined) data.hasKids = Boolean(body.hasKids);
  if (body.luxuryPreference !== undefined) data.luxuryPreference = Boolean(body.luxuryPreference);
  if (body.lifestyleAreas !== undefined) data.lifestyleAreas = asArray(body.lifestyleAreas).slice(0, 8);
  if (body.servicesNeeded !== undefined) {
    const selected = asArray(body.servicesNeeded);
    if (selected.some((item) => !SERVICES.includes(item))) throw new Error('Invalid service selection');
    data.servicesNeeded = selected;
  }
  if (body.arrivalDate !== undefined) data.arrivalDate = body.arrivalDate ? new Date(body.arrivalDate) : null;
  if (body.duration !== undefined) {
    if (!DURATIONS.includes(body.duration)) throw new Error('Invalid duration');
    data.duration = body.duration;
  }
  if (body.contactPreferences !== undefined) {
    const selected = asArray(body.contactPreferences);
    if (selected.some((item) => !CONTACTS.includes(item))) throw new Error('Invalid contact preference');
    data.contactPreferences = selected;
  }
  if (body.answers !== undefined) data.answers = body.answers && typeof body.answers === 'object' ? body.answers : {};
  if (body.completed !== undefined) {
    data.completed = Boolean(body.completed);
    data.completedAt = data.completed ? new Date() : null;
  }
  if (!partial && !data.intent) throw new Error('Intent required');
  return data;
}

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const [profile, preferences, score, segment, recommendations] = await Promise.all([
      prisma.userOnboardingProfile.findUnique({ where: { userId: req.user.sub } }),
      prisma.userPreferences.findUnique({ where: { userId: req.user.sub } }),
      prisma.leadScore.findUnique({ where: { userId: req.user.sub } }),
      prisma.userSegment.findUnique({ where: { userId: req.user.sub } }),
      prisma.matchRecommendation.findMany({
        where: { userId: req.user.sub, status: 'active' },
        orderBy: { score: 'desc' },
        take: 12,
      }),
    ]);
    res.json({
      profile,
      preferences,
      score,
      segment,
      recommendations,
      incomplete: !profile?.completed,
    });
  } catch (e) { next(e); }
});

router.patch('/me', requireAuth, async (req, res, next) => {
  try {
    const data = cleanProfilePayload(req.body, true);
    const profile = await prisma.userOnboardingProfile.upsert({
      where: { userId: req.user.sub },
      create: { userId: req.user.sub, ...data },
      update: data,
    });
    const intelligence = profile.completed ? await refreshUserIntelligence(req.user.sub) : null;
    res.json({ profile, intelligence });
  } catch (e) {
    if (e.message?.startsWith('Invalid')) return res.status(400).json({ error: e.message });
    next(e);
  }
});

router.post('/complete', requireAuth, async (req, res, next) => {
  try {
    const data = cleanProfilePayload({ ...req.body, completed: true, currentStep: 6 }, true);
    const profile = await prisma.userOnboardingProfile.upsert({
      where: { userId: req.user.sub },
      create: { userId: req.user.sub, ...data },
      update: data,
    });
    const intelligence = await refreshUserIntelligence(req.user.sub);
    await prisma.conversionEvent.create({
      data: { userId: req.user.sub, type: 'onboarding_completed', metadata: { segment: intelligence?.score?.segment } },
    });
    res.json({ profile, intelligence });
  } catch (e) {
    if (e.message?.startsWith('Invalid')) return res.status(400).json({ error: e.message });
    next(e);
  }
});

router.get('/admin/intelligence', requireAuth, requireAdmin, async (_req, res, next) => {
  try {
    const [segments, highValueUsers, recentProfiles, leadScores] = await Promise.all([
      prisma.userSegment.groupBy({ by: ['level'], _count: { level: true } }),
      prisma.user.findMany({
        where: { segment: { level: { in: ['HIGH_VALUE', 'VIP'] } } },
        take: 25,
        orderBy: { createdAt: 'desc' },
        include: { segment: true, leadScore: true, onboardingProfile: true },
      }),
      prisma.userOnboardingProfile.findMany({ take: 25, orderBy: { updatedAt: 'desc' }, include: { user: { select: { id: true, name: true, email: true } } } }),
      prisma.leadScore.findMany({ take: 25, orderBy: { totalScore: 'desc' }, include: { user: { select: { id: true, name: true, email: true } }, lead: true } }),
    ]);
    res.json({ segments, highValueUsers, recentProfiles, leadScores });
  } catch (e) { next(e); }
});

router.patch(
  '/admin/users/:id/score',
  requireAuth,
  requireAdmin,
  logAdminAction('intelligence.score_override', (req) => ({ targetType: 'user', targetId: req.params.id })),
  async (req, res, next) => {
    try {
      const overrideScore = Number(req.body?.score);
      if (!Number.isFinite(overrideScore) || overrideScore < 0 || overrideScore > 150) {
        return res.status(400).json({ error: 'Invalid score' });
      }
      const level = overrideScore >= 95 ? 'VIP' : overrideScore >= 65 ? 'HIGH_VALUE' : overrideScore >= 35 ? 'MEDIUM_VALUE' : 'LOW_VALUE';
      const leadScore = await prisma.leadScore.upsert({
        where: { userId: req.params.id },
        create: {
          userId: req.params.id,
          totalScore: overrideScore,
          overrideScore,
          overrideReason: req.body?.reason || null,
          segment: level,
          qualification: level,
          priority: level === 'VIP' ? 5 : level === 'HIGH_VALUE' ? 4 : level === 'MEDIUM_VALUE' ? 2 : 1,
          conversionProbability: Math.min(0.95, overrideScore / 120),
        },
        update: {
          totalScore: overrideScore,
          overrideScore,
          overrideReason: req.body?.reason || null,
          segment: level,
          qualification: level,
        },
      });
      await prisma.userSegment.upsert({
        where: { userId: req.params.id },
        create: { userId: req.params.id, level, reason: [{ key: 'admin_override', score: overrideScore }], monetizationPriority: leadScore.priority },
        update: { level, reason: [{ key: 'admin_override', score: overrideScore }], monetizationPriority: leadScore.priority },
      });
      res.json({ leadScore });
    } catch (e) { next(e); }
  }
);

export default router;
