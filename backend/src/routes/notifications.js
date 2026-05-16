import { Router } from 'express';
import { notifications } from '../data/store.js';

const router = Router();

router.get('/', (_req, res) => {
  res.json({
    notifications,
    unread: notifications.filter((n) => !n.read).length,
  });
});

router.post('/:id/read', (req, res) => {
  const n = notifications.find((x) => x.id === req.params.id);
  if (!n) return res.status(404).json({ error: 'Notification not found' });
  n.read = true;
  res.json({ notification: n });
});

export default router;
