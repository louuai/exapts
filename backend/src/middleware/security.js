/**
 * Production security middleware:
 *   - Helmet with a hardened CSP that whitelists the image CDNs we actually use
 *   - HTTPS redirect when FORCE_HTTPS is on (trust-proxy aware)
 *   - Generic error handler that never leaks stack traces in prod
 */
import helmet from 'helmet';
import { env } from '../lib/env.js';
import { logger } from '../lib/logger.js';
import { captureError } from '../lib/sentry.js';

export function helmetConfig() {
  return helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        defaultSrc: ["'self'"],
        imgSrc:     ["'self'", 'data:', 'blob:', 'https://images.unsplash.com', 'https://api.dicebear.com', 'https://res.cloudinary.com'],
        scriptSrc:  ["'self'"],
        styleSrc:   ["'self'", "'unsafe-inline'"], // Tailwind hashed classes ship inline-safe; relaxed for compat
        connectSrc: ["'self'", ...env.CORS_ORIGIN.split(',').map((o) => o.trim())],
        fontSrc:    ["'self'", 'data:'],
        objectSrc:  ["'none'"],
        frameAncestors: ["'none'"],
      },
    },
    frameguard: { action: 'deny' },
  });
}

/** Redirect HTTP → HTTPS when FORCE_HTTPS is on. Respects x-forwarded-proto when TRUST_PROXY is set. */
export function forceHttps(req, res, next) {
  if (!env.FORCE_HTTPS) return next();
  const proto = (env.TRUST_PROXY && req.headers['x-forwarded-proto']) || req.protocol;
  if (proto !== 'https') {
    return res.redirect(308, `https://${req.headers.host}${req.originalUrl}`);
  }
  next();
}

/**
 * Production-safe error handler: logs the full error server-side, returns a
 * sanitised JSON payload client-side. In dev we expose the message for DX.
 */
export function errorHandler(err, req, res, _next) {
  const status = err.status || err.statusCode || 500;

  logger.error({
    err: { message: err.message, stack: err.stack, code: err.code },
    method: req.method,
    url: req.originalUrl,
    userId: req.user?.sub,
  }, 'Unhandled error');

  captureError(err, { url: req.originalUrl, method: req.method, userId: req.user?.sub });

  const safeMessage =
    status < 500 && err.message
      ? err.message
      : env.NODE_ENV === 'production'
        ? 'Internal Server Error'
        : (err.message || 'Internal Server Error');

  res.status(status).json({ error: safeMessage });
}
