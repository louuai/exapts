/**
 * Centralised Zod schemas for user-supplied payloads.
 * `validate(schema)` returns an Express middleware that 400s with a clean
 * error shape if the body fails — no sensitive details leaked.
 */
import { z } from 'zod';

const trimmed = (max) => z.string().trim().max(max);
const optionalUrl = z.preprocess((v) => v === '' ? undefined : v, z.string().url().max(300).optional().nullable());
const optionalEmail = z.preprocess((v) => v === '' ? undefined : v, z.string().email().max(200).optional().nullable());

export const schemas = {
  signup: z.object({
    email:    z.string().email().max(200),
    password: z.string().min(6, 'Password must be at least 6 characters').max(200),
    name:     trimmed(120).optional(),
  }),

  login: z.object({
    email:    z.string().email().max(200),
    password: z.string().min(1).max(200),
  }),

  adminSession: z.object({
    password: z.string().min(1).max(200),
  }),

  adminCreateUser: z.object({
    email:    z.string().email().max(200),
    password: z.string().min(6).max(200),
    name:     trimmed(120).min(2, 'Name too short'),
    phone:    trimmed(40).optional().nullable(),
    bio:      trimmed(500).optional().nullable(),
    location: trimmed(120).optional().nullable(),
    avatar:   z.string().max(8_000_000).optional().nullable(),
    role:     z.enum(['user', 'admin']).default('user'),
    notificationPrefs: z.record(z.boolean()).optional(),
  }),

  adminUpdateUser: z.object({
    email:    z.string().email().max(200).optional(),
    password: z.string().min(6).max(200).optional(),
    name:     trimmed(120).min(2, 'Name too short').optional(),
    phone:    trimmed(40).optional().nullable(),
    bio:      trimmed(500).optional().nullable(),
    location: trimmed(120).optional().nullable(),
    avatar:   z.string().max(8_000_000).optional().nullable(),
    role:     z.enum(['user', 'admin']).optional(),
    notificationPrefs: z.record(z.boolean()).optional(),
  }),

  adminCreatePartner: z.object({
    email:       z.string().email().max(200),
    password:    z.string().min(8).max(200),
    name:        trimmed(120).min(2),
    companyName: trimmed(160).min(2),
    phone:       trimmed(40).optional().nullable(),
    avatar:      z.string().max(8_000_000).optional().nullable(),
    bio:         trimmed(800).optional().nullable(),
    location:    trimmed(120).optional().nullable(),
    website:     optionalUrl,
    status:      z.enum(['active', 'suspended']).default('active'),
  }),

  adminUpdatePartner: z.object({
    email:       z.string().email().max(200).optional(),
    password:    z.string().min(8).max(200).optional(),
    name:        trimmed(120).min(2).optional(),
    companyName: trimmed(160).min(2).optional(),
    phone:       trimmed(40).optional().nullable(),
    avatar:      z.string().max(8_000_000).optional().nullable(),
    bio:         trimmed(800).optional().nullable(),
    location:    trimmed(120).optional().nullable(),
    website:     optionalUrl,
    status:      z.enum(['active', 'suspended']).optional(),
  }),

  partnerLogin: z.object({
    email:    z.string().email().max(200),
    password: z.string().min(1).max(200),
  }),

  partnerUpdateProfile: z.object({
    name:        trimmed(120).min(2).optional(),
    companyName: trimmed(160).min(2).optional(),
    phone:       trimmed(40).optional().nullable(),
    avatar:      z.string().max(8_000_000).optional().nullable(),
    bio:         trimmed(800).optional().nullable(),
    location:    trimmed(120).optional().nullable(),
    website:     optionalUrl,
  }),

  partnerService: z.object({
    name:        trimmed(160).min(2),
    category:    trimmed(80).min(2),
    description: trimmed(1200).optional().nullable(),
    location:    trimmed(120).optional().nullable(),
    image:       z.string().max(8_000_000).optional().nullable(),
    contact:     z.object({
      phone:   trimmed(40).optional().nullable(),
      email:   optionalEmail,
      website: optionalUrl,
    }).optional(),
  }),

  partnerServiceUpdate: z.object({
    name:        trimmed(160).min(2).optional(),
    category:    trimmed(80).min(2).optional(),
    description: trimmed(1200).optional().nullable(),
    location:    trimmed(120).optional().nullable(),
    image:       z.string().max(8_000_000).optional().nullable(),
    contact:     z.object({
      phone:   trimmed(40).optional().nullable(),
      email:   optionalEmail,
      website: optionalUrl,
    }).optional(),
  }),

  changePassword: z.object({
    currentPassword: z.string().min(1).max(200),
    newPassword:     z.string().min(6).max(200),
  }),

  updateProfile: z.object({
    name:     trimmed(120).optional(),
    phone:    trimmed(40).optional(),
    bio:      trimmed(500).optional(),
    location: trimmed(120).optional(),
    avatar:   z.string().max(8_000_000).optional(), // data URL or http URL — server-side storage validates further
    notificationPrefs: z.record(z.boolean()).optional(),
  }),

  createLead: z.object({
    type:     z.enum(['property', 'service', 'general']).optional(),
    propertyId: z.string().max(64).optional(),
    serviceId:  z.string().max(64).optional(),
    name:     trimmed(120).min(2, 'Name too short'),
    email:    z.string().email().max(200),
    phone:    trimmed(40).optional(),
    message:  trimmed(2000).optional(),
    source:   trimmed(64).optional(),
    interest: trimmed(120).optional(),
  }),

  createPost: z.object({
    content: trimmed(5000).min(1, 'Content required'),
    image:   z.string().max(8_000_000).optional().nullable(),
    tag:     trimmed(64).optional(),
  }),

  updatePost: z.object({
    content: trimmed(5000).min(1).optional(),
    image:   z.string().max(8_000_000).optional().nullable(),
    tag:     trimmed(64).optional(),
  }),

  createComment: z.object({
    content:  trimmed(2000).min(1),
    parentId: z.string().max(64).optional().nullable(),
  }),

  createVisit: z.object({
    propertyId:    z.string().max(64),
    preferredDate: z.string().max(40).optional().nullable(),
    message:       trimmed(2000).optional().nullable(),
    phone:         trimmed(40).optional(),
  }),

  sendChatMessage: z.object({
    body: trimmed(4000).min(1),
  }),
};

/** Returns an express middleware that validates req.body against a schema. */
export function validate(schema) {
  return (req, res, next) => {
    const parsed = schema.safeParse(req.body || {});
    if (!parsed.success) {
      const detail = parsed.error.issues.map((i) => ({
        path: i.path.join('.'),
        message: i.message,
      }));
      return res.status(400).json({ error: detail[0]?.message || 'Invalid input', detail });
    }
    req.body = parsed.data;
    next();
  };
}
