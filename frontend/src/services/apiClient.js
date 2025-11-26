// --- Helper functions for auth ---
const getAccessToken = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    return user ? user.accessToken : null;
  } catch (e) {
    return null;
  }
};

const setAccessToken = (token) => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      user.accessToken = token;
      localStorage.setItem('user', JSON.stringify(user));
    }
  } catch (e) {
    console.error('Failed to set access token', e);
  }
};

const logoutUser = () => {
  localStorage.removeItem('user');
  alert('Your session has expired. Please log in again.');
  window.location.href = '/login';
};

// --- API Configuration ---
// ✅ FIXED: Check if running on localhost or production
const isLocalhost = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const API_BASE = process.env.REACT_APP_API_BASE || 
  (isLocalhost ? 'http://localhost:5000' : 'https://devugo-tech-backend.vercel.app');

// Debug log (remove in production if you want)
console.log('API_BASE:', API_BASE);

// --- Base API function ---
async function _api(path, options = {}) {
  const headers = { 
    'Content-Type': 'application/json', 
    ...(options.headers || {}) 
  };

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: headers,
    credentials: 'include',
  });

  if (!res.ok) {
    let errorData;
    try {
      errorData = await res.json();
    } catch (e) {
      errorData = { message: 'Unknown API error' };
    }
    const error = new Error(errorData.message || `API error ${res.status}`);
    error.status = res.status;
    throw error;
  }
  
  return res.status !== 204 ? res.json() : null;
}

// --- Token refresh function ---
async function refreshToken() {
  console.log('Attempting to refresh token...');
  try {
    const data = await _api('/api/auth/refresh', {
      method: 'POST',
    });

    const { accessToken } = data;

    if (!accessToken) {
      throw new Error('Refresh response did not include accessToken');
    }

    setAccessToken(accessToken);
    console.log('Token refreshed successfully.');
    return accessToken;

  } catch (error) {
    console.error('Failed to refresh token', error);
    logoutUser();
    throw new Error('Session expired.');
  }
}

// --- Main API function with auto token refresh ---
export async function api(path, options = {}) {
  const token = getAccessToken();

  const newOptions = { ...options };
  newOptions.headers = { ...(newOptions.headers || {}) };

  if (token) {
    newOptions.headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    // First attempt
    return await _api(path, newOptions);

  } catch (error) {
    // If 401, refresh token and retry
    if (error.status === 401) {
      console.log('Token expired. Retrying with new token...');
      try {
        const newAccessToken = await refreshToken();
        newOptions.headers['Authorization'] = `Bearer ${newAccessToken}`;
        return await _api(path, newOptions);
      } catch (refreshError) {
        throw refreshError;
      }
    }
    
    // Other errors
    throw error;
  }
}

// Default export
export default api;