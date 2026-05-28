import 'dotenv/config';
import http from 'http';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import { prisma } from './lib/prisma.js';
import { initSocket } from './lib/socket.js';
import { env } from './lib/env.js';
import { errorHandler, forceHttps, helmetConfig } from './middleware/security.js';

import authRoutes          from './routes/auth.js';
import guidesRoutes        from './routes/guides.js';
import postsRoutes         from './routes/posts.js';
import propertiesRoutes    from './routes/properties.js';
import favoritesRoutes     from './routes/favorites.js';
import notificationsRoutes from './routes/notifications.js';
import leadsRoutes         from './routes/leads.js';
import visitsRoutes        from './routes/visits.js';
import messagesRoutes      from './routes/messages.js';
import servicesRoutes      from './routes/services.js';
import adminRoutes         from './routes/admin.js';
import usersRoutes         from './routes/users.js';
import commentsRoutes      from './routes/comments.js';
import followRoutes        from './routes/follow.js';
import conversationsRoutes from './routes/conversations.js';
import partnersRoutes      from './routes/partners.js';
import onboardingRoutes    from './routes/onboarding.js';
import matchingRoutes      from './routes/matching.js';

const app = express();
const PORT = env.PORT || 4000;

if (env.TRUST_PROXY) app.set('trust proxy', 1);
app.use(forceHttps);
app.use(helmetConfig());

const allowedOrigins = env.CORS_ORIGIN.split(',').map((origin) => origin.trim()).filter(Boolean);
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('CORS origin not allowed'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Admin-Session'],
  maxAge: 86400,
}));

app.use(express.json({ limit: '8mb' })); // allow data-URL image uploads
app.use(morgan('dev'));

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 600,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

/* Health */
app.get('/api/health', async (_req, res) => {
  let db = 'unknown';
  try { await prisma.$queryRaw`SELECT 1`; db = 'ok'; }
  catch (e) { db = 'down: ' + e.message; }
  res.json({
    status: 'ok', service: 'omega-api', version: '2.0.0',
    db, timestamp: new Date().toISOString(),
  });
});

/* Routes */
app.use('/api/auth',          authRoutes);
app.use('/api/guides',        guidesRoutes);
app.use('/api/posts',         postsRoutes);
app.use('/api',               commentsRoutes);     // /api/posts/:id/comments
app.use('/api/follow',        followRoutes);       // POST /api/follow/:id ; the followers/following live under users
app.use('/api/properties',    propertiesRoutes);
app.use('/api/favorites',     favoritesRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/leads',         leadsRoutes);
app.use('/api/admin/leads',   leadsRoutes);   // admin alias (same handlers, requireAdmin guards GET/PATCH/DELETE)
app.use('/api/visits',        visitsRoutes);
app.use('/api/messages',      messagesRoutes);     // property inquiries (legacy contract)
app.use('/api/services',      servicesRoutes);
app.use('/api/admin',         adminRoutes);
app.use('/api/users',         usersRoutes);
app.use('/api/users',         followRoutes);       // /api/users/:id/followers + /following
app.use('/api/conversations', conversationsRoutes);
app.use('/api/partners',      partnersRoutes);
app.use('/api/onboarding',    onboardingRoutes);
app.use('/api/matching',      matchingRoutes);

/* 404 */
app.use((req, res) => res.status(404).json({ error: 'Not Found', path: req.originalUrl }));

/* Error handler */
app.use(errorHandler);

const httpServer = http.createServer(app);
initSocket(httpServer);

httpServer.listen(PORT, () => {
  console.log(`\n  OMEGA API running on http://localhost:${PORT}`);
  console.log(`  Health: http://localhost:${PORT}/api/health`);
  console.log(`  Socket.io path: /socket.io\n`);
});
