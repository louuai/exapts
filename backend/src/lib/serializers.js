/**
 * Map Prisma rows to the JSON shape the frontend expects (legacy compat).
 * Hide admin-only fields when isAdmin = false.
 */

export function serializeUser(u, { includePrivate = false } = {}) {
  if (!u) return null;
  const { passwordHash, ...rest } = u;
  if (!includePrivate) {
    // Public profile — drop email/phone/notificationPrefs
    delete rest.email;
    delete rest.phone;
    delete rest.notificationPrefs;
  }
  return rest;
}

export function serializeProperty(p, { isAdmin = false } = {}) {
  if (!p) return null;
  const out = { ...p };
  if (!isAdmin) {
    delete out.sourceUrl;
    delete out.internalNotes;
  }
  return out;
}

export function serializeService(s, { isAdmin = false } = {}) {
  if (!s) return null;
  const out = { ...s };
  if (!isAdmin) {
    delete out.sourceUrl;
    delete out.internalNotes;
  }
  return out;
}

/**
 * Posts shape: { id, user:{...}, content, image, tag, likes, comments,
 *                liked, repostsCount, reposted, createdAt, editedAt }
 */
export function serializePost(p, viewerId = null) {
  if (!p) return null;
  return {
    id: p.id,
    user: p.author ? {
      id: p.author.id,
      name: p.author.name,
      avatar: p.author.avatar,
      location: p.author.location,
    } : { id: p.authorId },
    content: p.content,
    image: p.image,
    tag: p.tag,
    likes: p._count?.likes ?? 0,
    likedBy: [], // legacy compat
    liked: viewerId ? (p.likes?.some?.((l) => l.userId === viewerId) ?? false) : false,
    comments: p._count?.comments ?? 0,
    repostsCount: p._count?.reposts ?? 0,
    reposted: viewerId ? (p.reposts?.some?.((r) => r.userId === viewerId) ?? false) : false,
    createdAt: p.createdAt,
    editedAt: p.editedAt,
  };
}
