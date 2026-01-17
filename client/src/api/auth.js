import axios from 'axios';

// Ensure API URL is properly configured
const API_URL = import.meta.env.VITE_API_URL || '/api';

// Log API URL in development for debugging
if (import.meta.env.DEV) {
  console.log('API URL:', API_URL);
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout for slower devices/networks
  withCredentials: false, // Set to true only if using cookies
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response cache for GET requests
const responseCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

api.interceptors.response.use(
  (response) => {
    // Cache GET requests
    if (response.config.method === 'get') {
      responseCache.set(response.config.url, {
        data: response.data,
        timestamp: Date.now(),
      });
    }
    return response;
  },
  (error) => {
    // Enhanced error handling for cross-device issues
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout - slow network or server issue');
      error.message = 'Request timeout. Please check your internet connection.';
    } else if (error.message === 'Network Error') {
      console.error('Network error - possible CORS or connectivity issue');
      error.message = 'Unable to connect to server. Please check your connection.';
    } else if (error.response) {
      // Log server error for debugging
      console.error('API Error:', error.response.status, error.response.data);
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (name, email, password) =>
    api.post('/auth/register', { name, email, password }),

  login: (email, password) =>
    api.post('/auth/login', { email, password }),

  getMe: () => {
    // Check cache first
    const cached = responseCache.get('/auth/me');
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return Promise.resolve({ data: cached.data });
    }
    return api.get('/auth/me');
  },

  getGmailAuthUrl: () => api.get('/auth/gmail/url'),

  handleGmailCallback: (code) =>
    api.post('/auth/gmail/callback', { code }),

  disconnectGmail: () => api.post('/auth/gmail/disconnect'),
};

export default api;

