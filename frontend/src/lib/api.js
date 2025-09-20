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
};
