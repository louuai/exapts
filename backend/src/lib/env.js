/**
 * Centralised env-var validation. Runs once at startup.
 * If a required var is missing or malformed, the process exits with a
 * descriptive error — preventing the API from booting in a broken state.
 */
import { z } from 'zod';

const schema = z.object({
  NODE_ENV:       z.enum(['development', 'production', 'test']).default('development'),
  PORT:           z.coerce.number().int().positive().default(4000),

  // Auth
  JWT_SECRET:     z.string().min(32, 'JWT_SECRET must be at least 32 chars (use 64+ in production)'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  ADMIN_SESSION_SECRET: z.string().min(32).optional(),
  ADMIN_SESSION_EXPIRES_IN: z.string().default('30m'),

  // Data layer
  DATABASE_URL:   z.string().url(),
  REDIS_URL:      z.string().url().default('redis://redis:6379'),

  // CORS — comma-separated list of allowed origins
  CORS_ORIGIN:    z.string().default('http://localhost:3000'),

  // Optional: behind a TLS-terminating proxy (Cloudflare, nginx…)
  TRUST_PROXY:    z.coerce.boolean().default(false),
  FORCE_HTTPS:    z.coerce.boolean().default(false),

  // Optional: transactional email (Resend). When unset, emails are logged.
  RESEND_API_KEY: z.string().optional(),
  MAIL_FROM:      z.string().default('OMEGA <no-reply@omega.mu>'),

  // Optional: Cloudinary unsigned upload (so the frontend never sees the secret).
  // CLOUDINARY_URL has the form  cloudinary://<api_key>:<api_secret>@<cloud_name>
  CLOUDINARY_URL:              z.string().optional(),
  CLOUDINARY_UPLOAD_PRESET:    z.string().optional(),

  // Optional: error tracking
  SENTRY_DSN:     z.string().optional(),

  // Public-ish app URL (used in emails)
  APP_URL:        z.string().url().default('http://localhost:3000'),
});

let _env = null;

export function loadEnv() {
  if (_env) return _env;
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    console.error('\n❌ Invalid environment variables:\n');
    for (const issue of parsed.error.issues) {
      console.error(`  • ${issue.path.join('.')} — ${issue.message}`);
    }
    console.error('\n  Set these in your .env or compose file and restart.\n');
    process.exit(1);
  }
  _env = parsed.data;
  return _env;
}

export const env = loadEnv();
