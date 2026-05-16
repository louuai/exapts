import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/auth.js';
import guidesRoutes from './routes/guides.js';
import postsRoutes from './routes/posts.js';
import propertiesRoutes from './routes/properties.js';
import favoritesRoutes from './routes/favorites.js';
import notificationsRoutes from './routes/notifications.js';
import leadsRoutes from './routes/leads.js';
import visitsRoutes from './routes/visits.js';
import messagesRoutes from './routes/messages.js';
import servicesRoutes from './routes/services.js';
import adminRoutes from './routes/admin.js';
import usersRoutes from './routes/users.js';

const app = express();
const PORT = process.env.PORT || 4000;

/* ---------- Middlewares ---------- */
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(',') || '*',
    credentials: true,
  })
);
app.use(express.json({ limit: '5mb' }));
app.use(morgan('dev'));

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

/* ---------- Health ---------- */
app.get('/api/health', (_req, res) =>
  res.json({
    status: 'ok',
    service: 'omega-api',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  })
);

/* ---------- Routes ---------- */
app.use('/api/auth', authRoutes);
app.use('/api/guides', guidesRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/properties', propertiesRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/leads', leadsRoutes);
app.use('/api/visits', visitsRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', usersRoutes);

/* ---------- 404 ---------- */
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found', path: req.originalUrl });
});

/* ---------- Error handler ---------- */
app.use((err, _req, res, _next) => {
  console.error('[error]', err);
  res
    .status(err.status || 500)
    .json({ error: err.message || 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`\n  OMEGA API running on http://localhost:${PORT}`);
  console.log(`  Health: http://localhost:${PORT}/api/health\n`);
});
