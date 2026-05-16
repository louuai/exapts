'use client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

function getToken() {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem('omega.token');
}

async function request(path, { method = 'GET', body, auth = false, headers = {} } = {}) {
  const finalHeaders = { 'Content-Type': 'application/json', ...headers };
  if (auth) {
    const token = getToken();
    if (token) finalHeaders.Authorization = `Bearer ${token}`;
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
    throw err;
  }
  return data;
}

export const api = {
  // Auth
  signup: (payload) => request('/api/auth/signup', { method: 'POST', body: payload }),
  login:  (payload) => request('/api/auth/login',  { method: 'POST', body: payload }),
  me:     () => request('/api/auth/me', { auth: true }),
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

  // Public user profiles
  publicUser:  (id) => request(`/api/users/${id}`),
  userPosts:   (id) => request(`/api/users/${id}/posts`),

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
  notifications: () => request('/api/notifications'),

  // Leads (public capture)
  createLead: (payload) => request('/api/leads', { method: 'POST', body: payload }),
  leads: (params = {}) => request(`/api/leads${qs(params)}`, { auth: true }),
  updateLead: (id, payload) => request(`/api/leads/${id}`, { method: 'PATCH', body: payload, auth: true }),
  deleteLead: (id) => request(`/api/leads/${id}`, { method: 'DELETE', auth: true }),

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
};

function qs(params) {
  const entries = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== null && v !== ''
  );
  if (!entries.length) return '';
  return '?' + new URLSearchParams(Object.fromEntries(entries)).toString();
}
