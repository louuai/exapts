import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import { serializePost } from '../lib/serializers.js';
import { notify } from '../lib/notifications.js';

const router = Router();

const POST_INCLUDE = {
  author: { select: { id: true, name: true, avatar: true, location: true } },
  likes: true,
  reposts: true,
  _count: { select: { likes: true, comments: true, reposts: true } },
};

/* GET /api/posts?userId=…  — feed mixed with reposts (Instagram-style).
   Each item is a serialized Post; when it's a repost, an extra `repost: { id, by, commentary, at }`
   field is attached so the frontend can render the "X reposted" banner. */
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const viewerId = req.user?.sub || null;
    const userIdFilter = req.query.userId;

    // Author scope: native posts authored by this user (if filtered)
    const wherePosts  = userIdFilter ? { authorId: userIdFilter } : {};
    // Repost scope: reposts performed by this user (if filtered)
    const whereRepost = userIdFilter ? { userId: userIdFilter } : {};

    const [posts, reposts] = await Promise.all([
      prisma.post.findMany({
        where: wherePosts,
        orderBy: { createdAt: 'desc' },
        include: POST_INCLUDE,
        take: 100,
      }),
      prisma.repost.findMany({
        where: whereRepost,
        orderBy: { createdAt: 'desc' },
        include: {
          user:         { select: { id: true, name: true, avatar: true, location: true } },
          originalPost: { include: POST_INCLUDE },
        },
        take: 100,
      }),
    ]);

    const feed = [
      ...posts.map((p) => ({ ...serializePost(p, viewerId), feedKey: `post-${p.id}`, _at: p.createdAt })),
      ...reposts
        .filter((r) => r.originalPost)
        .map((r) => ({
          ...serializePost(r.originalPost, viewerId),
          repost: {
            id:         r.id,
            by:         r.user,
            commentary: r.commentary,
            at:         r.createdAt,
          },
          feedKey: `repost-${r.id}`,
          _at:     r.createdAt,
        })),
    ]
      .sort((a, b) => new Date(b._at) - new Date(a._at))
      .slice(0, 80);

    feed.forEach((i) => delete i._at);

    res.json({ posts: feed });
  } catch (e) { next(e); }
});

/* GET /api/posts/:id */
router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const p = await prisma.post.findUnique({ where: { id: req.params.id }, include: POST_INCLUDE });
    if (!p) return res.status(404).json({ error: 'Post not found' });
    res.json({ post: serializePost(p, req.user?.sub) });
  } catch (e) { next(e); }
});

/* POST /api/posts */
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { content, image, tag } = req.body || {};
    if (!content || !content.trim()) return res.status(400).json({ error: 'Content required' });
    const created = await prisma.post.create({
      data: { authorId: req.user.sub, content: content.trim(), image: image || null, tag: tag || 'Général' },
      include: POST_INCLUDE,
    });
    res.status(201).json({ post: serializePost(created, req.user.sub) });
  } catch (e) { next(e); }
});

/* PATCH /api/posts/:id — own only */
router.patch('/:id', requireAuth, async (req, res, next) => {
  try {
    const p = await prisma.post.findUnique({ where: { id: req.params.id } });
    if (!p) return res.status(404).json({ error: 'Post not found' });
    if (p.authorId !== req.user.sub && req.user.role !== 'admin')
      return res.status(403).json({ error: 'Not your post' });

    const data = { editedAt: new Date() };
    if (req.body.content !== undefined) {
      if (!String(req.body.content).trim()) return res.status(400).json({ error: 'Content cannot be empty' });
      data.content = String(req.body.content).trim();
    }
    if (req.body.image !== undefined) data.image = req.body.image || null;
    if (req.body.tag   !== undefined) data.tag   = req.body.tag   || 'Général';

    const updated = await prisma.post.update({ where: { id: p.id }, data, include: POST_INCLUDE });
    res.json({ post: serializePost(updated, req.user.sub) });
  } catch (e) { next(e); }
});

/* DELETE /api/posts/:id */
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const p = await prisma.post.findUnique({ where: { id: req.params.id } });
    if (!p) return res.status(404).json({ error: 'Post not found' });
    if (p.authorId !== req.user.sub && req.user.role !== 'admin')
      return res.status(403).json({ error: 'Not your post' });
    await prisma.post.delete({ where: { id: p.id } });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

/* POST /api/posts/:id/like — toggle */
router.post('/:id/like', requireAuth, async (req, res, next) => {
  try {
    const postId = req.params.id;
    const userId = req.user.sub;
    const existing = await prisma.like.findUnique({ where: { postId_userId: { postId, userId } } });
    if (existing) {
      await prisma.like.delete({ where: { id: existing.id } });
    } else {
      await prisma.like.create({ data: { postId, userId } });
      // Notify author (don't self-notify)
      const post = await prisma.post.findUnique({ where: { id: postId } });
      if (post && post.authorId !== userId) {
        notify({ userId: post.authorId, type: 'NEW_LIKE', payload: { actorId: userId, postId } }).catch(() => {});
      }
    }
    const fresh = await prisma.post.findUnique({ where: { id: postId }, include: POST_INCLUDE });
    res.json({ post: serializePost(fresh, userId) });
  } catch (e) { next(e); }
});

/* POST /api/posts/:id/repost — toggle */
router.post('/:id/repost', requireAuth, async (req, res, next) => {
  try {
    const originalPostId = req.params.id;
    const userId = req.user.sub;
    const commentary = (req.body?.commentary || '').trim() || null;

    const existing = await prisma.repost.findUnique({
      where: { originalPostId_userId: { originalPostId, userId } },
    });

    if (existing) {
      await prisma.repost.delete({ where: { id: existing.id } });
      return res.json({ ok: true, reposted: false });
    }

    const r = await prisma.repost.create({ data: { originalPostId, userId, commentary } });
    const post = await prisma.post.findUnique({ where: { id: originalPostId } });
    if (post && post.authorId !== userId) {
      notify({ userId: post.authorId, type: 'NEW_REPOST', payload: { actorId: userId, postId: originalPostId } }).catch(() => {});
    }
    res.status(201).json({ ok: true, reposted: true, repost: r });
  } catch (e) { next(e); }
});

export default router;
