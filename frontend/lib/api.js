'use client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

function getToken() {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem('omega.token');
}

function getAdminToken() {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem('omega.adminToken');
}

async function request(path, { method = 'GET', body, auth = false, headers = {} } = {}) {
  const finalHeaders = { 'Content-Type': 'application/json', ...headers };
  if (auth) {
    const token = getToken();
    if (token) finalHeaders.Authorization = `Bearer ${token}`;
    const adminToken = getAdminToken();
    if (adminToken) finalHeaders['X-Admin-Session'] = adminToken;
  }
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: finalHeaders,
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });
  let data = null;
  try { data = await res.json(); } catch { /* empty */ }
  if (!res.ok) {
    const err = new Error(data?.error || `Request failed (${res.status})`);
    err.status = res.status;
    err.code = data?.code;
    if (typeof window !== 'undefined' && String(data?.code || '').startsWith('ADMIN_SESSION_')) {
      window.localStorage.removeItem('omega.adminToken');
      window.localStorage.removeItem('omega.adminTokenExpiresAt');
      window.dispatchEvent(new Event('omega:admin-session-expired'));
    }
    throw err;
  }
  return data;
}

export const api = {
  // Auth
  signup: (payload) => request('/api/auth/signup', { method: 'POST', body: payload }),
  login:  (payload) => request('/api/auth/login',  { method: 'POST', body: payload }),
  me:     () => request('/api/auth/me', { auth: true }),
  startAdminSession: (password) =>
    request('/api/auth/admin-session', { method: 'POST', body: { password }, auth: true }),
  updateProfile: (payload) => request('/api/auth/me', { method: 'PATCH', body: payload, auth: true }),
  changePassword: (payload) =>
    request('/api/auth/change-password', { method: 'POST', body: payload, auth: true }),

  // Guides
  guides: (params = {}) => request(`/api/guides${qs(params)}`),
  guide:  (slug) => request(`/api/guides/${slug}`),

  // Posts
  posts: (params = {}) => request(`/api/posts${qs(params)}`, { auth: true }),
  createPost: (payload) => request('/api/posts', { method: 'POST', body: payload, auth: true }),
  updatePost: (id, payload) => request(`/api/posts/${id}`, { method: 'PATCH', body: payload, auth: true }),
  deletePost: (id) => request(`/api/posts/${id}`, { method: 'DELETE', auth: true }),
  likePost:   (id) => request(`/api/posts/${id}/like`, { method: 'POST', auth: true }),
  repostPost: (id, commentary) =>
    request(`/api/posts/${id}/repost`, { method: 'POST', body: { commentary }, auth: true }),

  // Comments
  comments:        (postId) => request(`/api/posts/${postId}/comments`),
  createComment:   (postId, payload) => request(`/api/posts/${postId}/comments`, { method: 'POST', body: payload, auth: true }),
  deleteComment:   (id) => request(`/api/comments/${id}`, { method: 'DELETE', auth: true }),

  // Public user profiles + follow
  publicUser:   (id) => request(`/api/users/${id}`, { auth: true }),
  userPosts:    (id) => request(`/api/users/${id}/posts`, { auth: true }),
  userFollowers:(id) => request(`/api/users/${id}/followers`),
  userFollowing:(id) => request(`/api/users/${id}/following`),
  toggleFollow: (id) => request(`/api/follow/${id}`, { method: 'POST', auth: true }),
  searchUsers:  (q, limit = 8) => request(`/api/users${qs({ q, limit })}`),

  // Conversations / chat
  conversations:       () => request('/api/conversations', { auth: true }),
  startConversation:   (userId) => request('/api/conversations', { method: 'POST', body: { userId }, auth: true }),
  deleteConversation:  (id) => request(`/api/conversations/${id}`, { method: 'DELETE', auth: true }),
  conversationMessages:(id) => request(`/api/conversations/${id}/messages`, { auth: true }),
  sendChatMessage:     (id, body) => request(`/api/conversations/${id}/messages`, { method: 'POST', body: { body }, auth: true }),
  editChatMessage:     (id, msgId, body) => request(`/api/conversations/${id}/messages/${msgId}`, { method: 'PATCH',  body: { body }, auth: true }),
  deleteChatMessage:   (id, msgId)       => request(`/api/conversations/${id}/messages/${msgId}`, { method: 'DELETE', auth: true }),

  // Properties
  properties: (params = {}) => request(`/api/properties${qs(params)}`),
  property:   (id) => request(`/api/properties/${id}`),
  createProperty: (payload) => request('/api/properties', { method: 'POST', body: payload, auth: true }),
  updateProperty: (id, payload) =>
    request(`/api/properties/${id}`, { method: 'PUT', body: payload, auth: true }),
  deleteProperty: (id) =>
    request(`/api/properties/${id}`, { method: 'DELETE', auth: true }),

  // Favorites
  favorites: () => request('/api/favorites', { auth: true }),
  toggleFavorite: (id) =>
    request(`/api/favorites/${id}`, { method: 'POST', auth: true }),

  // Notifications
  notifications:     () => request('/api/notifications', { auth: true }),
  markNotificationRead: (id) => request(`/api/notifications/${id}/read`, { method: 'POST', auth: true }),
  markAllNotificationsRead: () => request('/api/notifications/read-all', { method: 'POST', auth: true }),

  // Leads — public capture + admin management (unified Lead model)
  createLead: (payload) => request('/api/leads', { method: 'POST', body: payload }),
  // params: { type: 'property'|'service'|'general', status, q, from, to }
  leads:       (params = {}) => request(`/api/admin/leads${qs(params)}`, { auth: true }),
  adminLeads:  (params = {}) => request(`/api/admin/leads${qs(params)}`, { auth: true }),
  updateLead:  (id, payload) => request(`/api/admin/leads/${id}`, { method: 'PATCH',  body: payload, auth: true }),
  deleteLead:  (id)          => request(`/api/admin/leads/${id}`, { method: 'DELETE', auth: true }),

  // Visit requests
  createVisitRequest: (payload) =>
    request('/api/visits', { method: 'POST', body: payload, auth: true }),
  visitRequests: () => request('/api/visits', { auth: true }),
  updateVisitRequest: (id, payload) =>
    request(`/api/visits/${id}`, { method: 'PATCH', body: payload, auth: true }),

  // Messages
  createMessage: (payload) =>
    request('/api/messages', { method: 'POST', body: payload, auth: true }),
  messages: () => request('/api/messages', { auth: true }),
  updateMessage: (id, payload) =>
    request(`/api/messages/${id}`, { method: 'PATCH', body: payload, auth: true }),

  // Services directory (annuaire)
  services: (params = {}) => request(`/api/services${qs(params)}`),
  service: (id) => request(`/api/services/${id}`),
  createService: (payload) => request('/api/services', { method: 'POST', body: payload, auth: true }),
  updateService: (id, payload) =>
    request(`/api/services/${id}`, { method: 'PUT', body: payload, auth: true }),
  deleteService: (id) =>
    request(`/api/services/${id}`, { method: 'DELETE', auth: true }),

  // Admin
  adminStats: () => request('/api/admin/stats', { auth: true }),
  adminUsers: () => request('/api/admin/users', { auth: true }),
  adminCreateUser: (payload) => request('/api/admin/users', { method: 'POST', body: payload, auth: true }),
  adminUpdateUser: (id, payload) => request(`/api/admin/users/${id}`, { method: 'PATCH', body: payload, auth: true }),
  adminDeleteUser: (id) => request(`/api/admin/users/${id}`, { method: 'DELETE', auth: true }),
};

function qs(params) {
  const entries = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== null && v !== ''
  );
  if (!entries.length) return '';
  return '?' + new URLSearchParams(Object.fromEntries(entries)).toString();
}
