/**
 * Targeted rate limiters. Global limiter sits at the app level; these are
 * tighter limiters specifically for endpoints that are abuse-prone.
 */
import rateLimit from 'express-rate-limit';

/** Login + signup: protects against credential stuffing & spam accounts. */
export const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,  // 10 minutes
  max: 20,                    // 20 attempts per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts. Please wait a few minutes and try again.' },
});

/** Public lead capture: prevents form-spam bots from flooding the inbox. */
export const leadLimiter = rateLimit({
  windowMs: 60 * 1000,  // 1 minute
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many submissions. Please wait a moment.' },
});
