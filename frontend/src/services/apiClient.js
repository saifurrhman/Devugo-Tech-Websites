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
  window.location.href = '/login'; // Or your login page
};

// --- This is your original fetch logic ---
const __DEFAULT_API_BASE__ = (typeof window !== 'undefined'
  ? `${window.location.protocol}//${window.location.hostname}:5000`
  : 'http://localhost:5000');

const API_BASE = process.env.REACT_APP_API_BASE || __DEFAULT_API_BASE__;

// Renamed your original function to _api
async function _api(path, options = {}) {
  // Ensure headers object exists
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: headers, // Use the merged headers
    credentials: 'include', // This is vital for refresh cookies
  });

  if (!res.ok) {
    // Try to get error message from body
    let errorData;
    try {
      errorData = await res.json();
    } catch (e) {
      errorData = { message: 'Unknown API error' };
    }
    // Pass status code and message
    const error = new Error(errorData.message || `API error ${res.status}`);
    error.status = res.status;
    throw error;
  }
  return res.status !== 204 ? res.json() : null;
}
// --- End of original fetch logic ---


// Helper function to refresh the token
async function refreshToken() {
  console.log('Attempting to refresh token...');
  try {
    // This calls your backend's /api/auth/refresh endpoint
    const data = await _api('/api/auth/refresh', {
      method: 'POST',
    });

    // This *requires* your backend to send back the new token
    // { "accessToken": "..." }
    const { accessToken } = data;

    if (!accessToken) {
      throw new Error('Refresh response did not include accessToken');
    }

    setAccessToken(accessToken);
    console.log('Token refreshed successfully.');
    return accessToken;

  } catch (error) {
    console.error('Failed to refresh token', error);
    logoutUser(); // Log out if refresh fails
    throw new Error('Session expired.');
  }
}

// --- This is the new 'api' function you will use everywhere ---
export async function api(path, options = {}) {
  // Get the current token
  const token = getAccessToken();
  
  // Create a mutable options object
  const newOptions = { ...options };
  newOptions.headers = { ...(newOptions.headers || {}) };

  if (token) {
    newOptions.headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    // 1. First attempt at the request
    return await _api(path, newOptions);

  } catch (error) {
    
    // 2. Check if it was a 401 (Token Expired) error
    if (error.status === 401) {
      console.log('Token expired. Retrying with new token...');
      try {
        // 3. Attempt to refresh the token
        const newAccessToken = await refreshToken();
        
        // 4. Refresh was successful, update header and retry the request
        newOptions.headers['Authorization'] = `Bearer ${newAccessToken}`;
        
        return await _api(path, newOptions);
      
      } catch (refreshError) {
        // 5. Refresh failed. The refreshToken() function already handled logout.
        // We just re-throw the error to stop the component's logic.
        throw refreshError;
      }
    }
    
    // 6. It was a different error (403, 404, 500, etc)
    throw error;
  }
}