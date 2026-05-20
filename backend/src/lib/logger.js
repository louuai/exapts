/**
 * Structured logger (pino) — JSON in production, pretty-printed in dev.
 * Use everywhere instead of console.* so logs are parseable & aggregable.
 */
import pino from 'pino';
import { env } from './env.js';

export const logger = pino({
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  base:  { service: 'omega-api' },
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      '*.passwordHash',
      '*.password',
      'password',
      'token',
    ],
    censor: '[REDACTED]',
  },
  transport: env.NODE_ENV === 'production'
    ? undefined
    : { target: 'pino-pretty', options: { colorize: true, translateTime: 'SYS:HH:MM:ss', ignore: 'pid,hostname,service' } },
});
