import { Router } from 'express';
import { users, posts, publicUser } from '../data/store.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

/* GET /api/users/:id — public profile.
 *
 * Falls back to the most recent post by that user.id when the id doesn't
 * exist in our auth-users table (this lets us surface "demo" seed authors
 * like Claire, Marc… with a real-looking profile page).
 */
router.get('/:id', optionalAuth, (req, res) => {
  const { id } = req.params;
  const userPosts = posts.filter((p) => p.user.id === id);

  // Real registered user
  const u = users.find((x) => x.id === id);
  if (u) {
    return res.json({
      user: {
        ...publicUser(u),
        postsCount: userPosts.length,
        likesReceived: userPosts.reduce((acc, p) => acc + p.likes, 0),
      },
    });
  }

  // Stub user inferred from posts
  if (userPosts.length > 0) {
    const seed = userPosts[0].user;
    return res.json({
      user: {
        id: seed.id,
        name: seed.name,
        avatar: seed.avatar,
        location: seed.location,
        bio: '',
        role: 'user',
        postsCount: userPosts.length,
        likesReceived: userPosts.reduce((acc, p) => acc + p.likes, 0),
        seeded: true,
      },
    });
  }

  res.status(404).json({ error: 'User not found' });
});

/* GET /api/users/:id/posts — posts by this user */
router.get('/:id/posts', optionalAuth, (req, res) => {
  const viewerId = req.user?.sub;
  const result = posts
    .filter((p) => p.user.id === req.params.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map((p) => ({ ...p, liked: viewerId ? p.likedBy.includes(viewerId) : false }));
  res.json({ posts: result });
});

export default router;
