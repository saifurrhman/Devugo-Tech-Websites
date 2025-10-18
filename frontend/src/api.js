import axios from "axios";

// Prefer env, otherwise use production backend URL or auto-detect
const DEFAULT_API_BASE = (typeof window !== 'undefined'
  ? (window.location.hostname.includes('vercel.app') 
     ? 'https://devugo-tech-websites-backend.vercel.app' 
     : `${window.location.protocol}//${window.location.hostname}:5000`)
  : 'http://localhost:5000');
const API_BASE = process.env.REACT_APP_API_BASE || DEFAULT_API_BASE;

const api = axios.create({
  baseURL: `${API_BASE}/api`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

export default api;
