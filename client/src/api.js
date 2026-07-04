const TOKEN_KEY = 'homeroom_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request(path, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`/api${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  signup: (payload) => request('/auth/signup', { method: 'POST', body: payload }),
  login: (payload) => request('/auth/login', { method: 'POST', body: payload }),
  me: () => request('/auth/me'),

  getSubjects: () => request('/subjects'),
  createSubject: (payload) => request('/subjects', { method: 'POST', body: payload }),
  updateSubject: (id, payload) => request(`/subjects/${id}`, { method: 'PUT', body: payload }),
  deleteSubject: (id) => request(`/subjects/${id}`, { method: 'DELETE' }),

  getAssignments: () => request('/assignments'),
  createAssignment: (payload) => request('/assignments', { method: 'POST', body: payload }),
  updateAssignment: (id, payload) => request(`/assignments/${id}`, { method: 'PUT', body: payload }),
  setComplete: (id, completed) =>
    request(`/assignments/${id}/complete`, { method: 'PATCH', body: { completed } }),
  deleteAssignment: (id) => request(`/assignments/${id}`, { method: 'DELETE' }),

  getVapidPublicKey: () => request('/push/vapid-public-key'),
  subscribePush: (subscription) => request('/push/subscribe', { method: 'POST', body: { subscription } }),
  unsubscribePush: (endpoint) => request('/push/unsubscribe', { method: 'POST', body: { endpoint } }),
};
