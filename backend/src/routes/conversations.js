import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { notify } from '../lib/notifications.js';
import { emitToConversation, emitToUser } from '../lib/socket.js';

const router = Router();

/** Normalize userA < userB so the unique constraint deduplicates conversations. */
function pair(a, b) {
  return a < b ? { userAId: a, userBId: b } : { userAId: b, userBId: a };
}

/* GET /api/conversations — list my conversations */
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const me = req.user.sub;
    const list = await prisma.conversation.findMany({
      where: { OR: [{ userAId: me }, { userBId: me }] },
      orderBy: { lastMessageAt: 'desc' },
      include: {
        userA: { select: { id: true, name: true, avatar: true, location: true } },
        userB: { select: { id: true, name: true, avatar: true, location: true } },
        messages: { take: 1, orderBy: { createdAt: 'desc' } },
      },
    });

    // Compute "peer" and unread count per conversation
    const enriched = await Promise.all(list.map(async (c) => {
      const peer = c.userAId === me ? c.userB : c.userA;
      const unread = await prisma.chatMessage.count({
        where: { conversationId: c.id, senderId: { not: me }, readAt: null },
      });
      return {
        id: c.id,
        peer,
        lastMessage: c.messages[0] || null,
        lastMessageAt: c.lastMessageAt,
        unread,
      };
    }));

    res.json({ conversations: enriched });
  } catch (e) { next(e); }
});

/* POST /api/conversations — start (or fetch) a 1:1 conversation with userId */
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const me = req.user.sub;
    const otherId = req.body?.userId;
    if (!otherId || otherId === me) return res.status(400).json({ error: 'userId required' });

    const other = await prisma.user.findUnique({ where: { id: otherId } });
    if (!other) return res.status(404).json({ error: 'User not found' });

    const ids = pair(me, otherId);
    let convo = await prisma.conversation.findUnique({
      where: { userAId_userBId: { userAId: ids.userAId, userBId: ids.userBId } },
    });
    if (!convo) {
      convo = await prisma.conversation.create({ data: ids });
    }
    res.status(201).json({ conversationId: convo.id });
  } catch (e) { next(e); }
});

/* GET /api/conversations/:id/messages */
router.get('/:id/messages', requireAuth, async (req, res, next) => {
  try {
    const me = req.user.sub;
    const c = await prisma.conversation.findUnique({ where: { id: req.params.id } });
    if (!c) return res.status(404).json({ error: 'Conversation not found' });
    if (c.userAId !== me && c.userBId !== me) return res.status(403).json({ error: 'Not your conversation' });

    const messages = await prisma.chatMessage.findMany({
      where: { conversationId: c.id },
      orderBy: { createdAt: 'asc' },
      take: 200,
    });

    // Mark as read
    await prisma.chatMessage.updateMany({
      where: { conversationId: c.id, senderId: { not: me }, readAt: null },
      data:  { readAt: new Date() },
    });

    res.json({ messages });
  } catch (e) { next(e); }
});

/* POST /api/conversations/:id/messages */
router.post('/:id/messages', requireAuth, async (req, res, next) => {
  try {
    const me = req.user.sub;
    const body = (req.body?.body || '').trim();
    if (!body) return res.status(400).json({ error: 'Empty message' });

    const c = await prisma.conversation.findUnique({ where: { id: req.params.id } });
    if (!c) return res.status(404).json({ error: 'Conversation not found' });
    if (c.userAId !== me && c.userBId !== me) return res.status(403).json({ error: 'Not your conversation' });

    const message = await prisma.chatMessage.create({
      data: { conversationId: c.id, senderId: me, body },
    });
    await prisma.conversation.update({
      where: { id: c.id }, data: { lastMessageAt: message.createdAt },
    });

    // Real-time broadcast
    emitToConversation(c.id, 'message:new', message);
    const peerId = c.userAId === me ? c.userBId : c.userAId;
    emitToUser(peerId, 'conversation:bump', { conversationId: c.id, message });

    // Persistent notification + email
    notify({
      userId: peerId, type: 'NEW_MESSAGE',
      payload: { conversationId: c.id, actorId: me, preview: body.slice(0, 80) },
    }).catch(() => {});

    res.status(201).json({ message });
  } catch (e) { next(e); }
});

/* PATCH /api/conversations/:id/messages/:msgId — edit own message */
router.patch('/:id/messages/:msgId', requireAuth, async (req, res, next) => {
  try {
    const me = req.user.sub;
    const body = (req.body?.body || '').trim();
    if (!body) return res.status(400).json({ error: 'Empty message' });

    const msg = await prisma.chatMessage.findUnique({ where: { id: req.params.msgId } });
    if (!msg) return res.status(404).json({ error: 'Message not found' });
    if (msg.conversationId !== req.params.id) return res.status(400).json({ error: 'Conversation mismatch' });
    if (msg.senderId !== me) return res.status(403).json({ error: 'Not your message' });
    if (msg.deletedAt) return res.status(400).json({ error: 'Message was deleted' });

    const updated = await prisma.chatMessage.update({
      where: { id: msg.id },
      data:  { body, editedAt: new Date() },
    });

    emitToConversation(msg.conversationId, 'message:updated', updated);
    res.json({ message: updated });
  } catch (e) { next(e); }
});

/* DELETE /api/conversations/:id/messages/:msgId — soft-delete own message */
router.delete('/:id/messages/:msgId', requireAuth, async (req, res, next) => {
  try {
    const me = req.user.sub;
    const msg = await prisma.chatMessage.findUnique({ where: { id: req.params.msgId } });
    if (!msg) return res.status(404).json({ error: 'Message not found' });
    if (msg.conversationId !== req.params.id) return res.status(400).json({ error: 'Conversation mismatch' });
    if (msg.senderId !== me) return res.status(403).json({ error: 'Not your message' });

    const updated = await prisma.chatMessage.update({
      where: { id: msg.id },
      data:  { body: '', deletedAt: new Date() },
    });

    emitToConversation(msg.conversationId, 'message:deleted', updated);
    res.json({ message: updated });
  } catch (e) { next(e); }
});

/* DELETE /api/conversations/:id — hard delete (both participants lose it) */
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const me = req.user.sub;
    const c = await prisma.conversation.findUnique({ where: { id: req.params.id } });
    if (!c) return res.status(404).json({ error: 'Conversation not found' });
    if (c.userAId !== me && c.userBId !== me) return res.status(403).json({ error: 'Not your conversation' });

    await prisma.conversation.delete({ where: { id: c.id } });
    // Notify the peer so their UI removes the entry
    const peerId = c.userAId === me ? c.userBId : c.userAId;
    emitToUser(peerId, 'conversation:deleted', { conversationId: c.id });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

export default router;
