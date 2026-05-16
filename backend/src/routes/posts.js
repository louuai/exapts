import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { posts, users } from '../data/store.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';

const router = Router();

function decorate(p, userId) {
  return { ...p, liked: userId ? p.likedBy.includes(userId) : false };
}

/* GET /api/posts — global feed + optional ?userId filter */
router.get('/', optionalAuth, (req, res) => {
  const userId = req.user?.sub;
  const { userId: authorFilter } = req.query;
  let result = posts.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  if (authorFilter) result = result.filter((p) => p.user.id === authorFilter);
  res.json({ posts: result.map((p) => decorate(p, userId)) });
});

/* POST /api/posts */
router.post('/', requireAuth, (req, res) => {
  const { content, image, tag } = req.body || {};
  if (!content || !content.trim())
    return res.status(400).json({ error: 'Content required' });

  const author = users.find((u) => u.id === req.user.sub);
  const post = {
    id: uuid(),
    user: {
      id: author.id,
      name: author.name,
      avatar: author.avatar,
      location: author.location,
    },
    content: content.trim(),
    image: image || null,
    tag: tag || 'Général',
    likes: 0,
    comments: 0,
    likedBy: [],
    createdAt: new Date().toISOString(),
  };
  posts.unshift(post);
  res.status(201).json({ post: decorate(post, req.user.sub) });
});

/* PATCH /api/posts/:id — edit own post (admin can edit any) */
router.patch('/:id', requireAuth, (req, res) => {
  const p = posts.find((x) => x.id === req.params.id);
  if (!p) return res.status(404).json({ error: 'Post not found' });
  if (p.user.id !== req.user.sub && req.user.role !== 'admin')
    return res.status(403).json({ error: 'Not your post' });

  const { content, image, tag } = req.body || {};
  if (content !== undefined) {
    if (!String(content).trim()) return res.status(400).json({ error: 'Content cannot be empty' });
    p.content = String(content).trim();
  }
  if (image !== undefined) p.image = image || null;
  if (tag !== undefined) p.tag = tag || 'Général';
  p.editedAt = new Date().toISOString();
  res.json({ post: decorate(p, req.user.sub) });
});

/* DELETE /api/posts/:id — own post (admin can delete any) */
router.delete('/:id', requireAuth, (req, res) => {
  const idx = posts.findIndex((x) => x.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Post not found' });
  if (posts[idx].user.id !== req.user.sub && req.user.role !== 'admin')
    return res.status(403).json({ error: 'Not your post' });
  posts.splice(idx, 1);
  res.json({ ok: true });
});

/* POST /api/posts/:id/like */
router.post('/:id/like', requireAuth, (req, res) => {
  const p = posts.find((x) => x.id === req.params.id);
  if (!p) return res.status(404).json({ error: 'Post not found' });
  const uid = req.user.sub;
  const idx = p.likedBy.indexOf(uid);
  if (idx === -1) {
    p.likedBy.push(uid);
    p.likes += 1;
  } else {
    p.likedBy.splice(idx, 1);
    p.likes -= 1;
  }
  res.json({ post: decorate(p, uid) });
});

export default router;
