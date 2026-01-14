import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout for faster failure detection
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

