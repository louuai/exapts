import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import { notify } from '../lib/notifications.js';
import { serializeUser } from '../lib/serializers.js';

const router = Router();

/* POST /api/follow/:id — toggle follow target user */
router.post('/:id', requireAuth, async (req, res, next) => {
  try {
    const followerId  = req.user.sub;
    const followingId = req.params.id;
    if (followerId === followingId) return res.status(400).json({ error: "You can't follow yourself" });

    const target = await prisma.user.findUnique({ where: { id: followingId } });
    if (!target) return res.status(404).json({ error: 'User not found' });

    const existing = await prisma.follow.findUnique({
      where: { followerId_followingId: { followerId, followingId } },
    });

    if (existing) {
      await prisma.follow.delete({ where: { id: existing.id } });
      return res.json({ ok: true, following: false });
    }

    await prisma.follow.create({ data: { followerId, followingId } });
    notify({ userId: followingId, type: 'NEW_FOLLOWER', payload: { actorId: followerId } }).catch(() => {});
    res.status(201).json({ ok: true, following: true });
  } catch (e) { next(e); }
});

/* Hydrate a user list with isFollowing + mutualCount for the current viewer. */
async function decorate(users, viewerId) {
  if (!viewerId) return users.map(serializeUser);

  const viewerFollowing = await prisma.follow.findMany({
    where:  { followerId: viewerId },
    select: { followingId: true },
  });
  const viewerFollowingIds = viewerFollowing.map((f) => f.followingId);
  const viewerFollowingSet = new Set(viewerFollowingIds);

  // For each listed user U: mutual = how many people viewer follows also follow U.
  const counts = await Promise.all(users.map((u) =>
    u.id === viewerId
      ? 0
      : prisma.follow.count({
          where: {
            followingId: u.id,
            followerId:  { in: viewerFollowingIds },
          },
        })
  ));

  return users.map((u, i) => ({
    ...serializeUser(u),
    isFollowing:  u.id !== viewerId && viewerFollowingSet.has(u.id),
    mutualCount:  counts[i],
    isSelf:       u.id === viewerId,
  }));
}

/* GET /api/users/:id/followers — users following this user */
router.get('/:id/followers', optionalAuth, async (req, res, next) => {
  try {
    const list = await prisma.follow.findMany({
      where: { followingId: req.params.id },
      include: { follower: true },
      orderBy: { createdAt: 'desc' },
    });
    const users = await decorate(list.map((f) => f.follower), req.user?.sub);
    res.json({ users });
  } catch (e) { next(e); }
});

/* GET /api/users/:id/following — users this user follows */
router.get('/:id/following', optionalAuth, async (req, res, next) => {
  try {
    const list = await prisma.follow.findMany({
      where: { followerId: req.params.id },
      include: { following: true },
      orderBy: { createdAt: 'desc' },
    });
    const users = await decorate(list.map((f) => f.following), req.user?.sub);
    res.json({ users });
  } catch (e) { next(e); }
});

export default router;
