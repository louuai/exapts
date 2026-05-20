import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user.sub;
    const items = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    const unread = items.filter((n) => !n.read).length;

    const actorIds = [...new Set(items.map((n) => n.payload?.actorId).filter(Boolean))];
    const actors = actorIds.length
      ? await prisma.user.findMany({
          where: { id: { in: actorIds } },
          select: { id: true, name: true, avatar: true },
        })
      : [];
    const actorMap = Object.fromEntries(actors.map((a) => [a.id, a]));

    res.json({
      notifications: items.map((n) => ({
        ...n,
        actor: n.payload?.actorId ? actorMap[n.payload.actorId] || null : null,
        // Legacy compat fields
        title: legacyTitle(n),
        body:  legacyBody(n, actorMap),
      })),
      unread,
    });
  } catch (e) { next(e); }
});

router.post('/:id/read', requireAuth, async (req, res, next) => {
  try {
    const n = await prisma.notification.findUnique({ where: { id: req.params.id } });
    if (!n) return res.status(404).json({ error: 'Notification not found' });
    if (n.userId !== req.user.sub) return res.status(403).json({ error: 'Not yours' });
    const updated = await prisma.notification.update({
      where: { id: n.id }, data: { read: true, readAt: new Date() },
    });
    res.json({ notification: updated });
  } catch (e) { next(e); }
});

router.post('/read-all', requireAuth, async (req, res, next) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.sub, read: false },
      data:  { read: true, readAt: new Date() },
    });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

function legacyTitle(n) {
  switch (n.type) {
    case 'NEW_FOLLOWER':      return 'Nouveau follower';
    case 'NEW_COMMENT':       return 'Nouveau commentaire';
    case 'NEW_LIKE':          return 'Quelqu\'un aime votre post';
    case 'NEW_REPOST':        return 'Votre post a été partagé';
    case 'NEW_MESSAGE':       return 'Nouveau message';
    case 'NEW_LEAD':          return 'Nouveau lead';
    case 'NEW_VISIT_REQUEST': return 'Demande de visite';
    case 'NEW_PROPERTY':      return 'Nouveau bien à découvrir';
    default:                  return 'Notification';
  }
}
function legacyBody(n, actorMap) {
  const actor = n.payload?.actorId ? actorMap[n.payload.actorId] : null;
  const actorName = actor?.name || 'Un membre';
  switch (n.type) {
    case 'NEW_FOLLOWER': return `${actorName} vous suit désormais.`;
    case 'NEW_COMMENT':  return `${actorName} a commenté votre post.`;
    case 'NEW_LIKE':     return `${actorName} aime votre post.`;
    case 'NEW_REPOST':   return `${actorName} a partagé votre post.`;
    case 'NEW_MESSAGE':  return n.payload?.preview ? `"${n.payload.preview}"` : `${actorName} vous a envoyé un message.`;
    case 'NEW_LEAD':    return n.payload?.name ? `Lead : ${n.payload.name}` : 'Nouveau lead capturé.';
    case 'NEW_VISIT_REQUEST': return 'Une nouvelle demande de visite à traiter.';
    case 'NEW_PROPERTY': return 'Un nouveau bien vient d\'être ajouté.';
    default: return '';
  }
}

export default router;
