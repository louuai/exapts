import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { optionalAuth } from '../middleware/auth.js';
import { serializeUser, serializePost } from '../lib/serializers.js';

const router = Router();

const POST_INCLUDE = {
  author:  { select: { id: true, name: true, avatar: true, location: true } },
  likes:   true,
  reposts: true,
  _count:  { select: { likes: true, comments: true, reposts: true } },
};

/* GET /api/users — user search (Instagram-style "search a friend")
   Query: ?q=<term>&limit=<n>
   Returns minimal projection so it stays fast for autocomplete dropdowns. */
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const q = String(req.query.q || '').trim();
    const limit = Math.min(parseInt(req.query.limit, 10) || 8, 20);
    if (!q) return res.json({ users: [] });

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name:     { contains: q, mode: 'insensitive' } },
          { location: { contains: q, mode: 'insensitive' } },
          { bio:      { contains: q, mode: 'insensitive' } },
        ],
      },
      orderBy: { name: 'asc' },
      take: limit,
      select: { id: true, name: true, avatar: true, location: true, role: true, bio: true },
    });
    res.json({ users });
  } catch (e) { next(e); }
});

/* GET /api/users/:id — public profile + counts + isFollowing for the viewer */
router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const viewerId = req.user?.sub || null;

    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: {
        _count: { select: { posts: true, followers: true, following: true, reposts: true } },
      },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const likesReceived = await prisma.like.count({
      where: { post: { authorId: user.id } },
    });

    let isFollowing = false;
    if (viewerId && viewerId !== user.id) {
      const f = await prisma.follow.findUnique({
        where: { followerId_followingId: { followerId: viewerId, followingId: user.id } },
      });
      isFollowing = !!f;
    }

    res.json({
      user: {
        ...serializeUser(user),
        postsCount:     user._count.posts,
        repostsCount:   user._count.reposts,
        followersCount: user._count.followers,
        followingCount: user._count.following,
        likesReceived,
        isFollowing,
      },
    });
  } catch (e) { next(e); }
});

/* GET /api/users/:id/posts — posts AND reposts by this user, mixed and
   sorted desc, so visiting a profile shows their full activity stream. */
router.get('/:id/posts', optionalAuth, async (req, res, next) => {
  try {
    const viewerId = req.user?.sub || null;
    const userId   = req.params.id;

    const [posts, reposts] = await Promise.all([
      prisma.post.findMany({
        where:   { authorId: userId },
        orderBy: { createdAt: 'desc' },
        include: POST_INCLUDE,
      }),
      prisma.repost.findMany({
        where:   { userId },
        orderBy: { createdAt: 'desc' },
        include: {
          user:         { select: { id: true, name: true, avatar: true, location: true } },
          originalPost: { include: POST_INCLUDE },
        },
      }),
    ]);

    const feed = [
      ...posts.map((p) => ({ ...serializePost(p, viewerId), feedKey: `post-${p.id}`, _at: p.createdAt })),
      ...reposts
        .filter((r) => r.originalPost)
        .map((r) => ({
          ...serializePost(r.originalPost, viewerId),
          repost: { id: r.id, by: r.user, commentary: r.commentary, at: r.createdAt },
          feedKey: `repost-${r.id}`,
          _at:     r.createdAt,
        })),
    ]
      .sort((a, b) => new Date(b._at) - new Date(a._at));

    feed.forEach((i) => delete i._at);
    res.json({ posts: feed });
  } catch (e) { next(e); }
});

export default router;
