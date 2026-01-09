import { apiWithRefresh, saveToken, clearTokens, fetchWithAuth } from './apiInterceptor';

// ============================================
// ✅ API BASE URL CONFIGURATION
// ============================================
export const API_BASE = process.env.REACT_APP_API_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://devugo-tech-backend.vercel.app'
    : 'http://localhost:5000');

console.log('🌐 API_BASE:', API_BASE);
console.log('🔧 NODE_ENV:', process.env.NODE_ENV);

export const api = apiWithRefresh;

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
    if (data.accessToken) saveToken(data.accessToken);
    return data;
  },
  verifySignup: async (payload) => {
    const data = await api('/api/auth/verify-signup', { method: 'POST', body: payload });
    if (data.accessToken) saveToken(data.accessToken);
    return data;
  },
  login: async (payload) => {
    const data = await api('/api/auth/login', { method: 'POST', body: payload });
    if (data.accessToken) saveToken(data.accessToken);
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
  requestReset: (email) => api('/api/auth/reset-password', { method: 'POST', body: { email } }),
  resetPassword: (token, password) => api('/api/auth/reset-password-confirm', { method: 'POST', body: { token, password } }),
  updateMe: (payload) => api('/api/auth/me', { method: 'PATCH', body: payload }),
  changePassword: (payload) => api('/api/auth/change-password', { method: 'POST', body: payload }),
  sendOTP: (email) => api('/api/auth/send-otp', { method: 'POST', body: { email } }),
  resetPasswordWithOTP: (payload) => api('/api/auth/reset-password-otp', { method: 'POST', body: payload }),

  // Admin User Management
  getUsers: () => api('/api/auth/users'),
  inviteUser: (payload) => api('/api/admin/invite', { method: 'POST', body: payload }),
  getUserActivity: (id) => api(`/api/admin/users/${id}/activity`),
  resendInvitation: (id) => api(`/api/admin/invite/${id}/resend`, { method: 'POST' }),
  acceptInvitation: (payload) => api('/api/auth/invite/accept', { method: 'POST', body: payload }),

  // User Management
  deleteUser: (id) => api(`/api/admin/users/${id}`, { method: 'DELETE' }),
  toggleUserStatus: (id) => api(`/api/admin/users/${id}/status`, { method: 'PATCH' }),
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
  list: (params = {}) => api('/api/contact' + buildQuery(params)),
  delete: (id) => api(`/api/contact/${id}`, { method: 'DELETE' }),
  remove: (id) => api(`/api/contact/${id}`, { method: 'DELETE' }), // Alias for compatibility
  import: (payload) => api('/api/contact/import', { method: 'POST', body: payload }),
  verify: (id) => api(`/api/contact/${id}/verify`, { method: 'POST' }),
  verifyBatch: (emails) => api('/api/contact/verify-batch', { method: 'POST', body: { emails } }),
};

export const ListAPI = {
  list: () => api('/api/contact-lists').then(res => res.items || res), // Handle different responses
  create: (payload) => api('/api/contact-lists', { method: 'POST', body: payload }),
  delete: (id) => api(`/api/contact-lists/${id}`, { method: 'DELETE' }),
  addContacts: (id, contactIds) => api(`/api/contact-lists/${id}/add`, { method: 'POST', body: { contactIds } }),
  getContacts: (id) => api(`/api/contact-lists/${id}/contacts`),
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
  getEmailStats: (range = '7d') => api('/api/analytics/email' + buildQuery({ range })),
};

// ============================================
// ✅ UPLOAD API (COMPLETE WITH COMPATIBILITY)
// ============================================
export const UploadAPI = {
  // ✅ Main upload function
  uploadSingle: async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    const url = `${API_BASE}/api/images/upload-single`;
    const response = await fetchWithAuth(url, {
      method: 'POST',
      body: formData,
    });

    if (response.status === 204) return {};

    let data;
    try {
      data = await response.json();
    } catch (e) {
      data = {};
    }

    if (!response.ok) {
      const message = data?.error || data?.message || `Upload failed (${response.status})`;
      throw new Error(message);
    }

    return data;
  },

  // ✅ Multiple upload function
  uploadMultiple: async (files) => {
    const formData = new FormData();
    for (const file of files) {
      formData.append('images', file);
    }

    const url = `${API_BASE}/api/images/upload-multiple`;
    const response = await fetchWithAuth(url, {
      method: 'POST',
      body: formData,
    });

    if (response.status === 204) return {};

    let data;
    try {
      data = await response.json();
    } catch (e) {
      data = {};
    }

    if (!response.ok) {
      const message = data?.error || data?.message || `Upload failed (${response.status})`;
      throw new Error(message);
    }

    return data;
  },

  // ✅ COMPATIBILITY FUNCTION (For old Portfolio code)
  image: async (dataUrl, filename) => {
    console.warn('⚠️ UploadAPI.image() is deprecated. Use UploadAPI.uploadSingle() instead.');

    try {
      // Convert base64 dataUrl to Blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();

      // Convert Blob to File
      const file = new File([blob], filename || 'image.jpg', {
        type: blob.type || 'image/jpeg'
      });

      // Use uploadSingle
      const result = await UploadAPI.uploadSingle(file);

      // Return in old format for compatibility
      return {
        url: result.data?.url || '',
        success: result.success,
        message: result.message
      };
    } catch (err) {
      console.error('❌ UploadAPI.image error:', err);
      throw err;
    }
  }
};

// ============================================
// SENDER API
// ============================================
export const SenderAPI = {
  list: () => api('/api/senders'),
  create: (payload) => api('/api/senders', { method: 'POST', body: payload }),
  remove: (id) => api(`/api/senders/${id}`, { method: 'DELETE' }),
  resendVerification: (id) => api(`/api/senders/resend/${id}`, { method: 'POST' }),
  domains: {
    list: () => api('/api/senders/domains'),
    create: (payload) => api('/api/senders/domains', { method: 'POST', body: payload }),
    remove: (domain) => api(`/api/senders/domains/${domain}`, { method: 'DELETE' }),
    get: (domain) => api(`/api/senders/domains/${domain}`),
    verify: (domain) => api(`/api/senders/domains/${domain}/verify`, { method: 'POST' }),
  }
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
export const CompanyInfoAPI = {
  getPublic: () => api('/api/company-info/public'),
  get: () => api('/api/company-info'),
  update: (payload) => api('/api/company-info', { method: 'PUT', body: payload }),
};

// ============================================
// BRAND API
// ============================================
export const BrandAPI = {
  list: (params = {}) => api('/api/brands' + buildQuery(params)),
  create: (payload) => api('/api/brands', { method: 'POST', body: payload }),
  update: (id, payload) => api(`/api/brands/${id}`, { method: 'PUT', body: payload }),
  remove: (id) => api(`/api/brands/${id}`, { method: 'DELETE' }),
};

// ============================================
// CAMPAIGN API
// ============================================
export const CampaignAPI = {
  list: (params = {}) => api('/api/campaigns' + buildQuery(params)),
  get: (id) => api(`/api/campaigns/${id}`),
  create: (payload) => api('/api/campaigns', { method: 'POST', body: payload }),
  update: (id, payload) => api(`/api/campaigns/${id}`, { method: 'PUT', body: payload }),
  remove: (id) => api(`/api/campaigns/${id}`, { method: 'DELETE' }),
  schedule: (id, payload) => api(`/api/campaigns/${id}/schedule`, { method: 'POST', body: payload }),
};

// ============================================
// AUTOMATION API
// ============================================
export const AutomationAPI = {
  list: () => api('/api/automations'),
  get: (id) => api(`/api/automations/${id}`),
  create: (payload) => api('/api/automations', { method: 'POST', body: payload }),
  update: (id, payload) => api(`/api/automations/${id}`, { method: 'PUT', body: payload }),
  remove: (id) => api(`/api/automations/${id}`, { method: 'DELETE' }),
};

// ============================================
// INBOX API
// ============================================
export const InboxAPI = {
  list: (params = {}) => api('/api/inbox' + buildQuery(params)),
  get: (id) => api(`/api/inbox/${id}`),
  send: (payload) => api('/api/inbox/send', { method: 'POST', body: payload }),
  reply: (id, payload) => api(`/api/inbox/${id}/reply`, { method: 'POST', body: payload }),
  markRead: (id) => api(`/api/inbox/${id}/read`, { method: 'POST' }),
};

// ============================================
// TEMPLATE API
// ============================================
export const TemplateAPI = {
  list: () => api('/api/templates'),
  get: (id) => api(`/api/templates/${id}`),
  create: (payload) => api('/api/templates', { method: 'POST', body: payload }),
  update: (id, payload) => api(`/api/templates/${id}`, { method: 'PUT', body: payload }),
  remove: (id) => api(`/api/templates/${id}`, { method: 'DELETE' }),
  generate: (payload) => api('/api/templates/generate', { method: 'POST', body: payload }),
  generateAI: (payload) => api('/api/templates/generate-ai', { method: 'POST', body: payload }),
};

// ============================================
// PIPELINE API
// ============================================
export const PipelineAPI = {
  listDeals: (params = {}) => api('/api/pipeline/deals' + buildQuery(params)),
  getDeal: (id) => api(`/api/pipeline/deals/${id}`),
  createDeal: (payload) => api('/api/pipeline/deals', { method: 'POST', body: payload }),
  updateDeal: (id, payload) => api(`/api/pipeline/deals/${id}`, { method: 'PUT', body: payload }),
  removeDeal: (id) => api(`/api/pipeline/deals/${id}`, { method: 'DELETE' }),
  listStages: () => api('/api/pipeline/stages'),
  updateStages: (payload) => api('/api/pipeline/stages', { method: 'PUT', body: payload }),
};

// ============================================
// PROJECT API
// ============================================
export const ProjectAPI = {
  list: (params = {}) => api('/api/projects' + buildQuery(params)),
  get: (id) => api(`/api/projects/${id}`),
  create: (payload) => api('/api/projects', { method: 'POST', body: payload }),
  update: (id, payload) => api(`/api/projects/${id}`, { method: 'PUT', body: payload }),
  remove: (id) => api(`/api/projects/${id}`, { method: 'DELETE' }),
};

// ============================================
// INVOICE API
// ============================================
export const InvoiceAPI = {
  list: (params = {}) => api('/api/invoices' + buildQuery(params)),
  get: (id) => api(`/api/invoices/${id}`),
  create: (payload) => api('/api/invoices', { method: 'POST', body: payload }),
  update: (id, payload) => api(`/api/invoices/${id}`, { method: 'PUT', body: payload }),
  remove: (id) => api(`/api/invoices/${id}`, { method: 'DELETE' }),
  stats: () => api('/api/invoices/stats'),
};

// ============================================
// MEETING API
// ============================================
export const MeetingAPI = {
  list: (params = {}) => api('/api/meetings' + buildQuery(params)),
  get: (id) => api(`/api/meetings/${id}`),
  create: (payload) => api('/api/meetings', { method: 'POST', body: payload }),
  update: (id, payload) => api(`/api/meetings/${id}`, { method: 'PUT', body: payload }),
  remove: (id) => api(`/api/meetings/${id}`, { method: 'DELETE' }),
};

// ============================================
// SETTINGS API
// ============================================
export const SettingsAPI = {
  getSMTP: () => api('/api/settings/smtp'),
  updateSMTP: (payload) => api('/api/settings/smtp', { method: 'PUT', body: payload }),
  getIntegrations: () => api('/api/settings/integrations'),
  updateIntegrations: (payload) => api('/api/settings/integrations', { method: 'PUT', body: payload }),
  getEmail: () => api('/api/settings/email'),
  updateEmail: (payload) => api('/api/settings/email', { method: 'PUT', body: payload }),
  getAI: () => api('/api/settings/ai'),
  updateAI: (payload) => api('/api/settings/ai', { method: 'PUT', body: payload }),
};

// ============================================
// AI API
// ============================================
export const AIAPI = {
  generate: (payload) => api('/api/ai/generate', { method: 'POST', body: payload }),
};

// ============================================
// API KEYS (n8n Integration)
// ============================================
export const ApiKeyAPI = {
  list: () => api('/api/apikeys'),
  create: (payload) => api('/api/apikeys', { method: 'POST', body: payload }),
  revoke: (id) => api(`/api/apikeys/${id}`, { method: 'DELETE' }),
};

// ============================================
// N8N INTEGRATION API
// ============================================
export const N8nAPI = {
  getMetrics: (metric = 'traffic', limit = 30) => api('/api/n8n/metrics' + buildQuery({ metric, limit })),
};