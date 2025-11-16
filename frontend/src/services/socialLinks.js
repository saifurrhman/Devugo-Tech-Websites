import { api } from './apiClient';
export const SocialLinksAPI = {
  listPublic: () => api('/api/social-links/public'),
  list: () => api('/api/social-links'),
  get: (id) => api(`/api/social-links/${id}`),
  create: (payload) => api('/api/social-links', { method: 'POST', body: JSON.stringify(payload) }),
  update: (id, payload) => api(`/api/social-links/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  remove: (id) => api(`/api/social-links/${id}`, { method: 'DELETE' }),
};