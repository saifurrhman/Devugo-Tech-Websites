const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';

export async function api(path, { method = 'GET', body, token } = {}){
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include',
  });
  const data = await res.json().catch(()=>({}));
  if (!res.ok) {
    const message = data?.error || data?.message || `Request failed (${res.status})`;
    throw new Error(message);
  }
  return data;
}

export const AuthAPI = {
  signup: (payload) => api('/api/auth/signup', { method: 'POST', body: payload }),
  login: (payload) => api('/api/auth/login', { method: 'POST', body: payload }),
  me:   (token) => api('/api/auth/me', { method: 'GET', token }),
  logout: (token) => api('/api/auth/logout', { method: 'POST', token }),
  requestReset: (email) => api('/api/auth/reset-password', { method: 'POST', body: { email } }),
  updateMe: (payload) => api('/api/auth/me', { method: 'PATCH', body: payload }),
  changePassword: (payload) => api('/api/auth/change-password', { method: 'POST', body: payload }),
};

export const BlogAPI = {
  list: () => api('/api/blog', { method: 'GET' }),
  listAll: () => api('/api/blog?all=1', { method: 'GET' }),
  get: (id) => api(`/api/blog/${id}`, { method: 'GET' }),
  create: (payload) => api('/api/blog', { method: 'POST', body: payload }),
  update: (id, payload) => api(`/api/blog/${id}`, { method: 'PUT', body: payload }),
  remove: (id) => api(`/api/blog/${id}`, { method: 'DELETE' }),
};

export const ContactAPI = {
  create: (payload) => api('/api/contact', { method: 'POST', body: payload }),
  list: () => api('/api/contact', { method: 'GET' }),
};

export const AnalyticsAPI = {
  summary: () => api('/api/analytics/summary', { method: 'GET' }),
};

export const UploadAPI = {
  image: (dataUrl, filename) => api('/api/upload/image', { method: 'POST', body: { dataUrl, filename } }),
};

export const ServiceAPI = {
  list: () => api('/api/services', { method: 'GET' }),
  get: (id) => api(`/api/services/${id}`, { method: 'GET' }),
  create: (payload) => api('/api/services', { method: 'POST', body: payload }),
  update: (id, payload) => api(`/api/services/${id}`, { method: 'PUT', body: payload }),
  remove: (id) => api(`/api/services/${id}`, { method: 'DELETE' }),
};

export const PricingAPI = {
  list: () => api('/api/pricing', { method: 'GET' }),
  get: (id) => api(`/api/pricing/${id}`, { method: 'GET' }),
  create: (payload) => api('/api/pricing', { method: 'POST', body: payload }),
  update: (id, payload) => api(`/api/pricing/${id}`, { method: 'PUT', body: payload }),
  remove: (id) => api(`/api/pricing/${id}`, { method: 'DELETE' }),
};

export const PortfolioAPI = {
  list: () => api('/api/portfolio', { method: 'GET' }),
  get: (id) => api(`/api/portfolio/${id}`, { method: 'GET' }),
  create: (payload) => api('/api/portfolio', { method: 'POST', body: payload }),
  update: (id, payload) => api(`/api/portfolio/${id}`, { method: 'PUT', body: payload }),
  remove: (id) => api(`/api/portfolio/${id}`, { method: 'DELETE' }),
};

export const TeamAPI = {
  list: () => api('/api/team', { method: 'GET' }),
  get: (id) => api(`/api/team/${id}`, { method: 'GET' }),
  create: (payload) => api('/api/team', { method: 'POST', body: payload }),
  update: (id, payload) => api(`/api/team/${id}`, { method: 'PUT', body: payload }),
  remove: (id) => api(`/api/team/${id}`, { method: 'DELETE' }),
};
