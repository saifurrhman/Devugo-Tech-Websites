// Prefer env, otherwise auto-detect backend at same host on port 5000
const __DEFAULT_API_BASE__ = (typeof window !== 'undefined'
  ? `${window.location.protocol}//${window.location.hostname}:5000`
  : 'http://localhost:5000');
export const API_BASE = process.env.REACT_APP_API_BASE || __DEFAULT_API_BASE__;

// ✅ Helper to get token from localStorage (supports admin token)
function getToken() {
  // Prefer explicit admin token, then fall back to general keys
  return (
    localStorage.getItem('adminToken') ||
    localStorage.getItem('token') ||
    localStorage.getItem('authToken')
  );
}

export async function api(path, { method = 'GET', body, token } = {}){
  const headers = { 'Content-Type': 'application/json' };
  
  // ✅ Auto-attach token if not provided
  const authToken = token || getToken();
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  
  console.log(`📡 API: ${method} ${path}`, { hasToken: !!authToken });
  
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include',
  });
  
  // Handle 204 No Content (DELETE responses)
  if (res.status === 204) {
    console.log(`✅ API: ${method} ${path} - No Content`);
    return {};
  }
  
  const data = await res.json().catch(()=>({}));
  
  if (!res.ok) {
    console.error(`❌ API: ${method} ${path}`, { status: res.status, error: data });
    const message = data?.error || data?.message || `Request failed (${res.status})`;
    throw new Error(message);
  }
  
  console.log(`✅ API: ${method} ${path}`, data);
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
  summaryRange: ({ range, from, to } = {}) => {
    const params = new URLSearchParams();
    if (range) params.set('range', String(range));
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    const q = params.toString();
    const path = '/api/analytics/summary' + (q ? `?${q}` : '');
    return api(path, { method: 'GET' });
  },
};

export const UploadAPI = {
  image: (dataUrl, filename) => api('/api/upload/image', { method: 'POST', body: { dataUrl, filename } }),
};

// ✅ FIXED: ServiceAPI with auto-token
export const ServiceAPI = {
  // Admin: all services (draft + published)
  list: () => api('/api/services', { method: 'GET' }), // ✅ Token auto-attach hoga
  
  // Public: published-only
  listPublic: () => api('/api/services/public', { method: 'GET' }),
  
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

export const PortfolioCategoryAPI = {
  list: () => api('/api/portfolio-categories', { method: 'GET' }),
  get: (id) => api(`/api/portfolio-categories/${id}`, { method: 'GET' }),
  create: (payload) => api('/api/portfolio-categories', { method: 'POST', body: payload }),
  update: (id, payload) => api(`/api/portfolio-categories/${id}`, { method: 'PUT', body: payload }),
  remove: (id) => api(`/api/portfolio-categories/${id}`, { method: 'DELETE' }),
};

export const TechStackAPI = {
  list: () => api('/api/tech-stack', { method: 'GET' }),
  get: (id) => api(`/api/tech-stack/${id}`, { method: 'GET' }),
  create: (payload) => api('/api/tech-stack', { method: 'POST', body: payload }),
  update: (id, payload) => api(`/api/tech-stack/${id}`, { method: 'PUT', body: payload }),
  remove: (id) => api(`/api/tech-stack/${id}`, { method: 'DELETE' }),
};

export const TeamAPI = {
  list: () => api('/api/team', { method: 'GET' }),
  get: (id) => api(`/api/team/${id}`, { method: 'GET' }),
  create: (payload) => api('/api/team', { method: 'POST', body: payload }),
  update: (id, payload) => api(`/api/team/${id}`, { method: 'PUT', body: payload }),
  remove: (id) => api(`/api/team/${id}`, { method: 'DELETE' }),
};