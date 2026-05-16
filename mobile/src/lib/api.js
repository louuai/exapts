// API base URL.
// - In dev with Expo Web (browser):    http://localhost:4000 works.
// - In dev with Expo Go on a phone:    use your computer's LAN IP, e.g.
//                                      EXPO_PUBLIC_API_URL=http://192.168.1.42:4000
// - In Docker:                         the compose file injects EXPO_PUBLIC_API_URL.
//
// EXPO_PUBLIC_* env vars are inlined into the bundle at build / start time
// (Expo SDK 49+).
const API_URL =
  process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000';

let authToken = null;
export function setToken(t) { authToken = t; }

async function request(path, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (authToken) headers.Authorization = `Bearer ${authToken}`;
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || `Request failed (${res.status})`);
  return data;
}

export const api = {
  login:  (p) => request('/api/auth/login',  { method: 'POST', body: p }),
  signup: (p) => request('/api/auth/signup', { method: 'POST', body: p }),
  me:     () => request('/api/auth/me'),
  properties: (qs = '') => request(`/api/properties${qs}`),
  property:   (id) => request(`/api/properties/${id}`),
  guides: () => request('/api/guides'),
  posts:  () => request('/api/posts'),
};
