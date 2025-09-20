import { api } from './apiClient';
export const captureEvent = (payload) => api('/analytics/events', { method: 'POST', body: JSON.stringify(payload) });
