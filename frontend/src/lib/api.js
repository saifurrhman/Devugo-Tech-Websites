import { apiWithRefresh, saveToken, clearTokens } from './apiInterceptor';

// ============================================
// API BASE URL CONFIGURATION
// ============================================
// Production: Use your deployed backend URL
// Development: Use localhost
export const API_BASE = process.env.REACT_APP_API_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://your-backend-url.vercel.app' // ⚠️ REPLACE with your actual backend URL
    : 'http://localhost:5000');

console.log('🌐 API_BASE:', API_BASE);
console.log('🔧 NODE_ENV:', process.env.NODE_ENV);

// Use the interceptor version
export const api = apiWithRefresh;

// Build query string
function buildQuery(params = {}) {
  const entries = Object.entries(params).filter(([, v]) => 
    v !== undefined && v !== null && v !== ''
  );
  if (!entries.length) return '';
  
  const qs = new URLSearchParams();
  for (const [k, v] of entries) {
    qs.set(k, String(v));
  }
  return `?${qs.toString()}`;
}

// ============================================
// AUTH API
// ============================================
export const AuthAPI = {
  signup: async (payload) => {
    const data = await api('/api/auth/signup', { method: 'POST', body: payload });
    if (data.accessToken) {
      saveToken(data.accessToken);
    }
    return data;
  },
  
  login: async (payload) => {
    const data = await api('/api/auth/login', { method: 'POST', body: payload });
    if (data.accessToken) {
      saveToken(data.accessToken);
    }
    return data;
  },
  
  me: () => api('/api/auth/me', { method: 'GET' }),
  
  logout: async () => {
    try {
      const data = await api('/api/auth/logout', { method: 'POST' });
      clearTokens();
      return data;
    } catch (error) {
      clearTokens();
      throw error;
    }
  },
  
  refresh: () => api('/api/auth/refresh', { method: 'POST' }),
  
  requestReset: (email) => api('/api/auth/reset-password', { 
    method: 'POST', 
    body: { email } 
  }),
  
  resetPassword: (token, password) => api('/api/auth/reset-password-confirm', {
    method: 'POST',
    body: { token, password }
  }),
  
  updateMe: (payload) => api('/api/auth/me', { 
    method: 'PATCH', 
    body: payload 
  }),
  
  changePassword: (payload) => api('/api/auth/change-password', { 
    method: 'POST', 
    body: payload 
  }),
};

// ============================================
// BLOG API
// ============================================
export const BlogAPI = {
  list: (params = {}) => api('/api/blog' + buildQuery(params)),
  listAll: (params = {}) => api('/api/blog' + buildQuery({ ...params, all: 1 })),
  get: (id) => api(`/api/blog/${id}`),
  getBySlug: (slug) => api('/api/blog' + buildQuery({ slug })),
  create: (payload) => api('/api/blog', { method: 'POST', body: payload }),
  update: (id, payload) => api(`/api/blog/${id}`, { method: 'PUT', body: payload }),
  remove: (id) => api(`/api/blog/${id}`, { method: 'DELETE' }),
};

// ============================================
// BLOG CATEGORIES API
// ============================================
export const BlogCategoryAPI = {
  list: () => api('/api/blog-categories'),
  get: (id) => api(`/api/blog-categories/${id}`),
  create: (payload) => api('/api/blog-categories', { method: 'POST', body: payload }),
  update: (id, payload) => api(`/api/blog-categories/${id}`, { method: 'PUT', body: payload }),
  remove: (id) => api(`/api/blog-categories/${id}`, { method: 'DELETE' }),
};

// ============================================
// CONTACT API
// ============================================
export const ContactAPI = {
  create: (payload) => api('/api/contact', { method: 'POST', body: payload }),
  list: () => api('/api/contact'),
};

// ============================================
// ANALYTICS API
// ============================================
export const AnalyticsAPI = {
  summary: () => api('/api/analytics/summary'),
  summaryRange: ({ range, from, to } = {}) => {
    const params = new URLSearchParams();
    if (range) params.set('range', String(range));
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    const q = params.toString();
    return api('/api/analytics/summary' + (q ? `?${q}` : ''));
  },
};

// ============================================
// UPLOAD API
// ============================================
export const UploadAPI = {
  image: (dataUrl, filename) => api('/api/upload/image', { 
    method: 'POST', 
    body: { dataUrl, filename } 
  }),
};

// ============================================
// SERVICE API
// ============================================
export const ServiceAPI = {
  list: () => api('/api/services'),
  listPublic: () => api('/api/services/public'),
  get: (id) => api(`/api/services/${id}`),
  create: (payload) => api('/api/services', { method: 'POST', body: payload }),
  update: (id, payload) => api(`/api/services/${id}`, { method: 'PUT', body: payload }),
  remove: (id) => api(`/api/services/${id}`, { method: 'DELETE' }),
};

// ============================================
// PRICING API
// ============================================
export const PricingAPI = {
  list: () => api('/api/pricing'),
  get: (id) => api(`/api/pricing/${id}`),
  create: (payload) => api('/api/pricing', { method: 'POST', body: payload }),
  update: (id, payload) => api(`/api/pricing/${id}`, { method: 'PUT', body: payload }),
  remove: (id) => api(`/api/pricing/${id}`, { method: 'DELETE' }),
};

// ============================================
// PORTFOLIO API
// ============================================
export const PortfolioAPI = {
  list: () => api('/api/portfolio'),
  get: (id) => api(`/api/portfolio/${id}`),
  create: (payload) => api('/api/portfolio', { method: 'POST', body: payload }),
  update: (id, payload) => api(`/api/portfolio/${id}`, { method: 'PUT', body: payload }),
  remove: (id) => api(`/api/portfolio/${id}`, { method: 'DELETE' }),
};

// ============================================
// PORTFOLIO CATEGORIES API
// ============================================
export const PortfolioCategoryAPI = {
  list: () => api('/api/portfolio-categories'),
  get: (id) => api(`/api/portfolio-categories/${id}`),
  create: (payload) => api('/api/portfolio-categories', { method: 'POST', body: payload }),
  update: (id, payload) => api(`/api/portfolio-categories/${id}`, { method: 'PUT', body: payload }),
  remove: (id) => api(`/api/portfolio-categories/${id}`, { method: 'DELETE' }),
};

// ============================================
// TECH STACK API
// ============================================
export const TechStackAPI = {
  list: () => api('/api/tech-stack'),
  get: (id) => api(`/api/tech-stack/${id}`),
  create: (payload) => api('/api/tech-stack', { method: 'POST', body: payload }),
  update: (id, payload) => api(`/api/tech-stack/${id}`, { method: 'PUT', body: payload }),
  remove: (id) => api(`/api/tech-stack/${id}`, { method: 'DELETE' }),
};

// ============================================
// CLIENT REVIEW API
// ============================================
export const ClientReviewAPI = {
  list: (params = {}) => api('/api/reviews' + buildQuery(params)),
  get: (id) => api(`/api/reviews/${id}`),
  create: (payload) => api('/api/reviews', { method: 'POST', body: payload }),
  update: (id, payload) => api(`/api/reviews/${id}`, { method: 'PUT', body: payload }),
  remove: (id) => api(`/api/reviews/${id}`, { method: 'DELETE' }),
};

// ============================================
// FAQ API
// ============================================
export const ClientFaqAPI = {
  list: (params = {}) => api('/api/faqs' + buildQuery(params)),
  get: (id) => api(`/api/faqs/${id}`),
  create: (payload) => api('/api/faqs', { method: 'POST', body: payload }),
  update: (id, payload) => api(`/api/faqs/${id}`, { method: 'PUT', body: payload }),
  remove: (id) => api(`/api/faqs/${id}`, { method: 'DELETE' }),
};

// ============================================
// TEAM API
// ============================================
export const TeamAPI = {
  list: () => api('/api/team'),
  get: (id) => api(`/api/team/${id}`),
  create: (payload) => api('/api/team', { method: 'POST', body: payload }),
  update: (id, payload) => api(`/api/team/${id}`, { method: 'PUT', body: payload }),
  remove: (id) => api(`/api/team/${id}`, { method: 'DELETE' }),
};

// ============================================
// FORMS CONFIG API
// ============================================
export const FormAPI = {
  getPublic: (key) => api(`/api/forms/public/${key}`),
  list: () => api('/api/forms'),
  get: (id) => api(`/api/forms/${id}`),
  create: (payload) => api('/api/forms', { method: 'POST', body: payload }),
  update: (id, payload) => api(`/api/forms/${id}`, { method: 'PUT', body: payload }),
  remove: (id) => api(`/api/forms/${id}`, { method: 'DELETE' }),
};

// ============================================
// SOCIAL LINKS API
// ============================================
export const SocialLinkAPI = {
  list: () => api('/api/social-links'),
  get: (id) => api(`/api/social-links/${id}`),
  create: (payload) => api('/api/social-links', { method: 'POST', body: payload }),
  update: (id, payload) => api(`/api/social-links/${id}`, { method: 'PUT', body: payload }),
  remove: (id) => api(`/api/social-links/${id}`, { method: 'DELETE' }),
};