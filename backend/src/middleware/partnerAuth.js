import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';
import { env } from '../lib/env.js';

const PARTNER_JWT_SECRET = env.PARTNER_JWT_SECRET || `${env.JWT_SECRET}:partner`;

export function signPartnerToken(partner) {
  return jwt.sign(
    { sub: partner.id, email: partner.email, scope: 'partner' },
    PARTNER_JWT_SECRET,
    { expiresIn: env.PARTNER_JWT_EXPIRES_IN || '7d' }
  );
}

export async function requirePartner(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing partner token' });

  try {
    const payload = jwt.verify(token, PARTNER_JWT_SECRET);
    if (payload?.scope !== 'partner') return res.status(401).json({ error: 'Invalid partner token' });
    const partner = await prisma.partner.findUnique({ where: { id: payload.sub } });
    if (!partner || partner.status !== 'active') return res.status(403).json({ error: 'Partner access suspended' });
    req.partner = partner;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired partner token' });
  }
}
