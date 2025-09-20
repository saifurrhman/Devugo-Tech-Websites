import { api } from './apiClient';
export const listPosts = () => api('/blog');
