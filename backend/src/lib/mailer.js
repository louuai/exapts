/**
 * Mailer — uses Resend's REST API when RESEND_API_KEY is set, otherwise
 * falls back to a structured log (so workers can be exercised in dev/staging
 * without delivering real mail).
 */
import { env } from './env.js';
import { logger } from './logger.js';

export async function sendMail({ to, subject, html, text, replyTo }) {
  if (!to || !subject || (!html && !text)) {
    throw new Error('sendMail: to/subject/(html|text) required');
  }

  if (!env.RESEND_API_KEY) {
    logger.info({ to, subject, replyTo, mailer: 'log' }, '📧 (no RESEND_API_KEY) email would be sent');
    return { delivered: false, transport: 'log' };
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: env.MAIL_FROM,
      to, subject,
      html: html || undefined,
      text: text || undefined,
      reply_to: replyTo,
    }),
  });

  if (!res.ok) {
    const errBody = await res.text().catch(() => '');
    logger.error({ status: res.status, body: errBody, to, subject }, 'Resend error');
    throw new Error(`Resend ${res.status}: ${errBody.slice(0, 200)}`);
  }
  const data = await res.json().catch(() => ({}));
  logger.info({ to, subject, id: data.id, mailer: 'resend' }, 'email sent');
  return { delivered: true, transport: 'resend', id: data.id };
}
