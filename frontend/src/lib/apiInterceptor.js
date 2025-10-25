import { API_BASE } from './api';

// Track if we're currently refreshing
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Helper to get token
function getToken() {
  return (
    localStorage.getItem('accessToken') ||
    localStorage.getItem('token') ||
    localStorage.getItem('authToken') ||
    localStorage.getItem('adminToken')
  );
}

// Helper to save token
function saveToken(token) {
  localStorage.setItem('accessToken', token);
  localStorage.setItem('token', token);
}

// Helper to clear tokens
function clearTokens() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('token');
  localStorage.removeItem('authToken');
  localStorage.removeItem('adminToken');
}

// Refresh token function
async function refreshToken() {
  try {
    console.log('🔄 Attempting to refresh token...');
    
    const response = await fetch(`${API_BASE}/api/auth/refresh`, {
      method: 'POST',
      credentials: 'include', // Important: send cookies
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Token refresh failed');
    }
    
    const data = await response.json();
    
    if (data.accessToken) {
      console.log('✅ Token refreshed successfully');
      saveToken(data.accessToken);
      return data.accessToken;
    }
    
    throw new Error('No access token in response');
  } catch (error) {
    console.error('❌ Token refresh failed:', error);
    clearTokens();
    
    // Redirect to login
    if (window.location.pathname !== '/admin/login') {
      window.location.href = '/admin/login?expired=true';
    }
    
    throw error;
  }
}

// Enhanced fetch with auto token refresh
export async function fetchWithAuth(url, options = {}) {
  const token = getToken();
  
  // Add token to headers
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const config = {
    ...options,
    headers,
    credentials: 'include'
  };
  
  try {
    console.log(`📡 Request: ${options.method || 'GET'} ${url}`);
    let response = await fetch(url, config);
    
    // If 401 and token expired, try to refresh
    if (response.status === 401) {
      const errorData = await response.json().catch(() => ({}));
      
      console.log('⚠️ 401 Error:', errorData);
      
      if (errorData.error === 'TokenExpired' || errorData.message?.includes('expired')) {
        console.log('🔄 Token expired, attempting refresh...');
        
        if (isRefreshing) {
          // Wait for the current refresh to complete
          console.log('⏳ Waiting for ongoing refresh...');
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then(newToken => {
            config.headers['Authorization'] = `Bearer ${newToken}`;
            return fetch(url, config);
          });
        }
        
        isRefreshing = true;
        
        try {
          const newToken = await refreshToken();
          isRefreshing = false;
          processQueue(null, newToken);
          
          // Retry original request with new token
          config.headers['Authorization'] = `Bearer ${newToken}`;
          console.log('🔁 Retrying original request...');
          response = await fetch(url, config);
        } catch (refreshError) {
          isRefreshing = false;
          processQueue(refreshError, null);
          throw refreshError;
        }
      } else {
        // Not a token expiry issue, redirect to login
        console.log('❌ Unauthorized - redirecting to login');
        clearTokens();
        if (window.location.pathname !== '/admin/login') {
          window.location.href = '/admin/login';
        }
        throw new Error(errorData.message || 'Unauthorized');
      }
    }
    
    return response;
  } catch (error) {
    console.error('❌ Fetch error:', error);
    throw error;
  }
}

// Wrapper for api function
export async function apiWithRefresh(path, { method = 'GET', body, token } = {}) {
  const url = `${API_BASE}${path}`;
  
  const options = {
    method,
    body: body ? JSON.stringify(body) : undefined
  };
  
  if (token) {
    options.headers = { 'Authorization': `Bearer ${token}` };
  }
  
  const response = await fetchWithAuth(url, options);
  
  // Handle 204 No Content
  if (response.status === 204) {
    console.log(`✅ ${method} ${path} - No Content`);
    return {};
  }
  
  // Parse JSON
  let data;
  try {
    data = await response.json();
  } catch (e) {
    data = {};
  }
  
  // Handle errors
  if (!response.ok) {
    console.error(`❌ ${method} ${path}`, { status: response.status, error: data });
    const message = data?.error || data?.message || `Request failed (${response.status})`;
    throw new Error(message);
  }
  
  console.log(`✅ ${method} ${path}`, data);
  return data;
}

export { clearTokens, getToken, saveToken };