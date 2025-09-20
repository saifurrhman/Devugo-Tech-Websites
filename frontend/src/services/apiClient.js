const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000/api';

export async function api(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    credentials: 'include',
    ...options,
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.status !== 204 ? res.json() : null;
}
