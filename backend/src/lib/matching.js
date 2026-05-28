import { prisma } from './prisma.js';
import { notify } from './notifications.js';
import { enqueue } from './queue.js';

const BUDGET_SCORES = {
  lt_2000: 5,
  '2000_5000': 15,
  '5000_20000': 30,
  gt_20000: 45,
};

const BUDGET_MONTHLY = {
  lt_2000: [0, 2000],
  '2000_5000': [2000, 5000],
  '5000_20000': [5000, 20000],
  gt_20000: [20000, null],
};

const SERVICE_KEYWORDS = {
  real_estate: ['immobilier', 'real estate', 'property', 'location', 'villa', 'maison'],
  tax_optimization: ['tax', 'fiscal', 'fiscalite', 'comptable'],
  banking: ['bank', 'banque', 'mcb', 'sbm'],
  visa_assistance: ['visa', 'permit', 'occupation'],
  relocation: ['relocation', 'installation', 'moving'],
  schooling: ['school', 'ecole', 'education'],
  healthcare: ['health', 'sante', 'insurance'],
  concierge: ['concierge', 'premium', 'private'],
  car_rental: ['car', 'voiture', 'rental'],
  investment_advisory: ['investment', 'invest', 'advisor', 'investissement'],
};

function asArray(value) {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  return [value];
}

function scoreToSegment(score) {
  if (score >= 95) return 'VIP';
  if (score >= 65) return 'HIGH_VALUE';
  if (score >= 35) return 'MEDIUM_VALUE';
  return 'LOW_VALUE';
}

function priorityForSegment(segment) {
  return { LOW_VALUE: 1, MEDIUM_VALUE: 2, HIGH_VALUE: 4, VIP: 5 }[segment] || 1;
}

export function calculateLeadScore(profile = {}) {
  const factors = [];
  let total = 0;
  const intent = profile.intent;
  const budgetRange = profile.budgetRange;
  const servicesNeeded = asArray(profile.servicesNeeded);

  const budgetScore = BUDGET_SCORES[budgetRange] || 0;
  if (budgetScore) {
    total += budgetScore;
    factors.push({ key: 'budget', label: `Budget ${budgetRange}`, score: budgetScore });
  }

  if (intent === 'invest') {
    total += 25;
    factors.push({ key: 'intent', label: 'Investment intent', score: 25 });
  }
  if (intent === 'business') {
    total += 20;
    factors.push({ key: 'intent', label: 'Business intent', score: 20 });
  }
  if (['long_term', 'permanent'].includes(profile.duration)) {
    total += 20;
    factors.push({ key: 'duration', label: 'Long-term relocation', score: 20 });
  }
  if (servicesNeeded.includes('concierge') || asArray(profile.contactPreferences).includes('concierge_callback')) {
    total += 20;
    factors.push({ key: 'concierge', label: 'Concierge requested', score: 20 });
  }
  if (profile.household === 'family' || profile.hasKids) {
    total += 10;
    factors.push({ key: 'family', label: 'Family profile', score: 10 });
  }
  if (profile.luxuryPreference) {
    total += 15;
    factors.push({ key: 'luxury', label: 'Luxury preference', score: 15 });
  }

  const segment = scoreToSegment(total);
  return {
    totalScore: total,
    segment,
    qualification: segment,
    priority: priorityForSegment(segment),
    conversionProbability: Math.min(0.95, Math.round((0.12 + total / 130) * 100) / 100),
    factors,
  };
}

export function buildPreferencesFromProfile(profile) {
  const [monthlyBudgetMin, monthlyBudgetMax] = BUDGET_MONTHLY[profile.budgetRange] || [null, null];
  const servicesNeeded = asArray(profile.servicesNeeded);
  const intent = profile.intent;
  return {
    monthlyBudgetMin,
    monthlyBudgetMax,
    propertyBudgetMin: profile.budgetRange === 'gt_20000' ? 900000 : null,
    propertyBudgetMax: profile.budgetRange === 'lt_2000' ? 350000 : null,
    preferredRegions: asArray(profile.lifestyleAreas),
    preferredServices: servicesNeeded,
    preferredContent: [
      intent === 'invest' ? 'investment' : null,
      profile.hasKids ? 'family' : null,
      servicesNeeded.includes('tax_optimization') ? 'tax' : null,
      servicesNeeded.includes('visa_assistance') ? 'visa' : null,
    ].filter(Boolean),
    familyProfile: profile.household === 'family' || Boolean(profile.hasKids),
    investorProfile: intent === 'invest',
    luxuryProfile: Boolean(profile.luxuryPreference) || profile.budgetRange === 'gt_20000',
    relocationStage: profile.duration || null,
  };
}

function serviceMatchesNeed(service, needs) {
  const text = `${service.name} ${service.category} ${service.description || ''}`.toLowerCase();
  return needs.some((need) => (SERVICE_KEYWORDS[need] || [need]).some((word) => text.includes(word)));
}

function propertyScore(property, profile, score) {
  let total = 10;
  const reasons = [];
  const price = Number(property.price || 0);
  if (score.segment === 'VIP' || profile.luxuryPreference) {
    if (price >= 900000 || /villa|penthouse|luxe|premium/i.test(`${property.title} ${property.description || ''}`)) {
      total += 35; reasons.push('Luxury fit');
    }
  }
  if (profile.intent === 'invest' && property.transaction === 'sale') {
    total += 25; reasons.push('Investment property');
  }
  if (profile.household === 'family' || profile.hasKids) {
    if ((property.bedrooms || 0) >= 3 || (property.rooms || 0) >= 4) {
      total += 20; reasons.push('Family-sized');
    }
  }
  for (const area of asArray(profile.lifestyleAreas)) {
    if (`${property.location} ${property.region || ''}`.toLowerCase().includes(String(area).toLowerCase())) {
      total += 10; reasons.push(`Area match: ${area}`);
    }
  }
  return { total, reasons };
}

function serviceScore(service, profile, score) {
  let total = service.subscription === 'premium' ? 18 : 10;
  const reasons = [];
  const needs = asArray(profile.servicesNeeded);
  if (serviceMatchesNeed(service, needs)) {
    total += 35;
    reasons.push('Needed service');
  }
  if (['HIGH_VALUE', 'VIP'].includes(score.segment) && service.subscription === 'premium') {
    total += 25;
    reasons.push('Premium partner fit');
  }
  if (profile.intent === 'invest' && serviceMatchesNeed(service, ['investment_advisory', 'tax_optimization'])) {
    total += 20;
    reasons.push('Investor support');
  }
  if ((profile.household === 'family' || profile.hasKids) && serviceMatchesNeed(service, ['schooling', 'healthcare'])) {
    total += 20;
    reasons.push('Family support');
  }
  return { total, reasons };
}

export async function refreshUserIntelligence(userId) {
  const profile = await prisma.userOnboardingProfile.findUnique({ where: { userId } });
  if (!profile) return null;

  const profileShape = {
    ...profile,
    servicesNeeded: asArray(profile.servicesNeeded),
    lifestyleAreas: asArray(profile.lifestyleAreas),
    contactPreferences: asArray(profile.contactPreferences),
  };
  const score = calculateLeadScore(profileShape);
  const preferences = buildPreferencesFromProfile(profileShape);

  await prisma.userPreferences.upsert({
    where: { userId },
    create: { userId, ...preferences },
    update: preferences,
  });
  await prisma.userSegment.upsert({
    where: { userId },
    create: { userId, level: score.segment, reason: score.factors, monetizationPriority: score.priority },
    update: { level: score.segment, reason: score.factors, monetizationPriority: score.priority },
  });
  await prisma.leadScore.upsert({
    where: { userId },
    create: { userId, ...score },
    update: score,
  });

  await generateRecommendations(userId, profileShape, score);
  if (['HIGH_VALUE', 'VIP'].includes(score.segment)) {
    const admins = await prisma.user.findMany({ where: { role: 'admin' }, select: { id: true } });
    await Promise.all(admins.map((admin) => notify({
      userId: admin.id,
      type: 'SYSTEM',
      payload: { label: 'High-value user detected', userId, segment: score.segment, score: score.totalScore },
    }).catch(() => {})));
  }
  await enqueue('notifications', 'onboarding-completed', { userId, segment: score.segment }).catch(() => {});
  return { profile, score };
}

export async function generateRecommendations(userId, profile, score) {
  const [properties, services, guides] = await Promise.all([
    prisma.property.findMany({ take: 80, orderBy: [{ featured: 'desc' }, { listedAt: 'desc' }] }),
    prisma.service.findMany({ take: 80, include: { partner: { select: { id: true, companyName: true, status: true } } } }),
    prisma.guide.findMany({ take: 50, orderBy: { updatedAt: 'desc' } }),
  ]);

  const propertyRecs = properties.map((property) => {
    const s = propertyScore(property, profile, score);
    return { type: 'property', propertyId: property.id, score: s.total, reason: s.reasons };
  });
  const serviceRecs = services
    .filter((service) => service.partner?.status !== 'suspended')
    .map((service) => {
      const s = serviceScore(service, profile, score);
      return { type: 'service', serviceId: service.id, partnerId: service.partnerId, score: s.total, reason: s.reasons };
    });
  const guideRecs = guides.map((guide) => {
    const text = `${guide.title} ${guide.category || ''} ${guide.description || ''}`.toLowerCase();
    let s = 10;
    const reason = [];
    if (profile.intent === 'invest' && /invest|fiscal|tax|immobilier/.test(text)) { s += 25; reason.push('Investor content'); }
    if (profile.hasKids && /ecole|school|sante|health/.test(text)) { s += 20; reason.push('Family content'); }
    if (asArray(profile.servicesNeeded).includes('visa_assistance') && /visa|permit/.test(text)) { s += 20; reason.push('Visa stage'); }
    return { type: 'guide', guideId: guide.id, score: s, reason };
  });

  const rows = [...propertyRecs, ...serviceRecs, ...guideRecs]
    .filter((row) => row.score >= 25)
    .sort((a, b) => b.score - a.score)
    .slice(0, 36)
    .map((row) => ({ userId, source: 'rules-v1', status: 'active', ...row }));

  await prisma.matchRecommendation.deleteMany({ where: { userId, source: 'rules-v1' } });
  if (rows.length) await prisma.matchRecommendation.createMany({ data: rows });
  return rows;
}

export async function scoreAndRouteLead(leadId) {
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    include: { service: { include: { partner: { include: { subscriptionTier: true } } } } },
  });
  if (!lead) return null;

  const inferredProfile = {
    intent: /invest|achat|roi|pds/i.test(`${lead.message} ${lead.interest}`) ? 'invest' : 'live',
    budgetRange: /20k|vip|luxe|villa|premium/i.test(`${lead.message}`) ? 'gt_20000' : '2000_5000',
    servicesNeeded: lead.type === 'service' ? ['relocation'] : ['real_estate'],
    contactPreferences: [],
    duration: /permanent|long/i.test(`${lead.message}`) ? 'permanent' : null,
    household: /family|famille|kids|enfant/i.test(`${lead.message}`) ? 'family' : null,
    hasKids: /kids|enfant|ecole|school/i.test(`${lead.message}`),
    luxuryPreference: /vip|luxe|premium|villa/i.test(`${lead.message}`),
  };
  const score = calculateLeadScore(inferredProfile);
  await prisma.leadScore.upsert({
    where: { leadId },
    create: { leadId, ...score },
    update: score,
  });

  const matchedPartner = await choosePartnerForLead(lead, score.segment);
  if (matchedPartner) {
    await prisma.conversionEvent.create({
      data: {
        leadId,
        partnerId: matchedPartner.id,
        type: 'partner_matched',
        metadata: { segment: score.segment, score: score.totalScore },
      },
    });
  }
  return { score, matchedPartner };
}

async function choosePartnerForLead(lead, segment) {
  if (lead.service?.partner) {
    const tier = lead.service.partner.subscriptionTier?.tier || 'standard';
    if (segment === 'VIP' && tier !== 'premium' && tier !== 'vip') return null;
    return lead.service.partner;
  }
  return null;
}
