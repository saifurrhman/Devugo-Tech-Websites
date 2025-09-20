import { api } from './apiClient';
export const submitContact = (data) => api('/contacts', { method: 'POST', body: JSON.stringify(data) });
