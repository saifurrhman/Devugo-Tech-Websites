import { api } from './apiClient';
export const login = (data) => api('/auth/login', { method: 'POST', body: JSON.stringify(data) });
export const me = () => api('/auth/me');
