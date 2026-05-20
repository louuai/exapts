import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import { notify } from '../lib/notifications.js';

const router = Router();

const COMMENT_INCLUDE = {
  author: { select: { id: true, name: true, avatar: true, location: true } },
};

/* GET /api/posts/:postId/comments */
router.get('/posts/:postId/comments', optionalAuth, async (req, res, next) => {
  try {
    const list = await prisma.comment.findMany({
      where: { postId: req.params.postId },
      orderBy: { createdAt: 'asc' },
      include: COMMENT_INCLUDE,
    });
    res.json({ comments: list });
  } catch (e) { next(e); }
});

/* POST /api/posts/:postId/comments */
router.post('/posts/:postId/comments', requireAuth, async (req, res, next) => {
  try {
    const { content, parentId } = req.body || {};
    if (!content || !content.trim()) return res.status(400).json({ error: 'Content required' });

    const post = await prisma.post.findUnique({ where: { id: req.params.postId } });
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const c = await prisma.comment.create({
      data: {
        postId: post.id,
        authorId: req.user.sub,
        content: content.trim(),
        parentId: parentId || null,
      },
      include: COMMENT_INCLUDE,
    });

    // Notify post author (skip self-notification)
    if (post.authorId !== req.user.sub) {
      notify({
        userId: post.authorId, type: 'NEW_COMMENT',
        payload: { actorId: req.user.sub, postId: post.id, commentId: c.id },
      }).catch(() => {});
    }
    // If replying, also notify parent comment's author
    if (parentId) {
      const parent = await prisma.comment.findUnique({ where: { id: parentId } });
      if (parent && parent.authorId !== req.user.sub && parent.authorId !== post.authorId) {
        notify({
          userId: parent.authorId, type: 'NEW_COMMENT',
          payload: { actorId: req.user.sub, postId: post.id, commentId: c.id, replyTo: parentId },
        }).catch(() => {});
      }
    }

    res.status(201).json({ comment: c });
  } catch (e) { next(e); }
});

/* DELETE /api/comments/:id */
router.delete('/comments/:id', requireAuth, async (req, res, next) => {
  try {
    const c = await prisma.comment.findUnique({ where: { id: req.params.id } });
    if (!c) return res.status(404).json({ error: 'Comment not found' });
    if (c.authorId !== req.user.sub && req.user.role !== 'admin')
      return res.status(403).json({ error: 'Not your comment' });
    await prisma.comment.delete({ where: { id: c.id } });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

export default router;
