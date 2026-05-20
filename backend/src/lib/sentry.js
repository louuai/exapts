/**
 * Optional Sentry init. Activated only when SENTRY_DSN is set,
 * and only if @sentry/node is installed (lazy import so the dep is optional).
 */
import { env } from './env.js';
import { logger } from './logger.js';

let sentryReady = false;
let Sentry = null;

export async function initSentry() {
  if (!env.SENTRY_DSN) return null;
  try {
    // Lazy import — only loaded if the package is installed
    Sentry = await import('@sentry/node');
    Sentry.init({
      dsn: env.SENTRY_DSN,
      environment: env.NODE_ENV,
      tracesSampleRate: env.NODE_ENV === 'production' ? 0.1 : 1.0,
      sendDefaultPii: false,
    });
    sentryReady = true;
    logger.info('Sentry initialised');
    return Sentry;
  } catch (e) {
    logger.warn({ err: e.message }, 'Sentry DSN set but @sentry/node missing — install it to enable');
    return null;
  }
}

export function captureError(err, context = {}) {
  if (sentryReady && Sentry?.captureException) {
    Sentry.captureException(err, { extra: context });
  }
}
