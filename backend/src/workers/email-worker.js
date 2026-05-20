/**
 * Email worker — backed by Resend when RESEND_API_KEY is set, otherwise
 * structured logging only.
 *
 * Jobs:
 *   - lead-followup  : auto-thank-you sent to the lead's email
 *   - notification   : generic transactional email triggered by lib/notifications.js
 */
import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import { prisma } from '../lib/prisma.js';
import { sendMail } from '../lib/mailer.js';
import { logger } from '../lib/logger.js';
import { env } from '../lib/env.js';

const REDIS_URL = env.REDIS_URL;
const connection = new IORedis(REDIS_URL, { maxRetriesPerRequest: null });

const APP_URL = env.APP_URL;

function leadFollowupHtml(lead, related) {
  const subject = lead.type === 'property'
    ? "Votre demande pour ce bien"
    : lead.type === 'service'
    ? `Votre demande de devis — ${related?.name || ''}`
    : "Bienvenue chez OMEGA";

  return {
    subject,
    text: `Bonjour ${lead.name},\n\n` +
      `Nous avons bien reçu votre demande et reviendrons vers vous sous 24h ouvrées.\n\n` +
      (lead.message ? `Votre message :\n"${lead.message}"\n\n` : '') +
      `À bientôt,\nL'équipe OMEGA — Île Maurice\n${APP_URL}`,
    html: `
      <div style="font-family:Inter,Arial,sans-serif;color:#0f1626;max-width:560px;margin:0 auto;padding:24px">
        <div style="background:linear-gradient(135deg,#0e7490,#0f1626);padding:24px;border-radius:16px;color:#fff">
          <h1 style="font-size:20px;margin:0 0 8px">Merci ${lead.name.split(' ')[0]} 👋</h1>
          <p style="margin:0;opacity:0.85;font-size:14px">Votre demande est bien enregistrée. Notre équipe revient vers vous sous 24h ouvrées.</p>
        </div>
        ${lead.message ? `
          <div style="margin-top:20px;padding:16px;background:#f7f9fc;border-left:3px solid #06b6d4;border-radius:8px">
            <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#5d6c84;font-weight:700">Votre message</p>
            <p style="margin:0;color:#2a3447">${lead.message.replace(/</g,'&lt;')}</p>
          </div>` : ''}
        ${related ? `
          <div style="margin-top:20px">
            <p style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#5d6c84;font-weight:700;margin:0 0 6px">Bien concerné</p>
            <p style="margin:0;font-weight:700">${(related.title || related.name)?.replace(/</g,'&lt;')}</p>
          </div>` : ''}
        <p style="margin-top:24px;font-size:14px">D'ici là, vous pouvez explorer d'autres opportunités sur <a href="${APP_URL}/properties" style="color:#0e7490;font-weight:600">notre catalogue</a>.</p>
        <p style="margin-top:32px;font-size:12px;color:#8d9bb0">— L'équipe OMEGA · Île Maurice</p>
      </div>
    `,
  };
}

export function createEmailWorker() {
  return new Worker('email', async (job) => {
    const { name, data } = job;

    if (name === 'lead-followup') {
      const lead = await prisma.lead.findUnique({
        where: { id: data.leadId },
        include: {
          property: { select: { id: true, title: true, reference: true } },
          service:  { select: { id: true, name: true, category: true } },
        },
      });
      if (!lead) return { skipped: 'lead-not-found' };
      const tpl = leadFollowupHtml(lead, lead.property || lead.service);
      return sendMail({ to: lead.email, subject: tpl.subject, html: tpl.html, text: tpl.text });
    }

    if (name === 'notification') {
      const user = await prisma.user.findUnique({ where: { id: data.userId } });
      if (!user) return { skipped: 'user-not-found' };
      return sendMail({
        to: user.email,
        subject: `OMEGA — ${data.type}`,
        text: `Vous avez une nouvelle notification : ${data.type}\n${JSON.stringify(data.payload || {})}`,
        html: `<p>Vous avez une nouvelle notification : <strong>${data.type}</strong></p>
               <p><a href="${APP_URL}/dashboard">Ouvrir OMEGA</a></p>`,
      });
    }

    logger.warn({ name, data }, 'email worker: unknown job');
  }, {
    connection,
    concurrency: 5,
  });
}
