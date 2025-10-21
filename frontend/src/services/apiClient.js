// Prefer env, otherwise auto-detect backend at same host on port 5000
const __DEFAULT_API_BASE__ = (typeof window !== 'undefined'
  ? `${window.location.protocol}//${window.location.hostname}:5000`
  : 'http://localhost:5000');
// Note: this client expects full paths including '/api' in the call sites, so base should NOT include '/api'
const API_BASE = process.env.REACT_APP_API_BASE || __DEFAULT_API_BASE__;

export async function api(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    credentials: 'include',
    ...options,
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.status !== 204 ? res.json() : null;
}
