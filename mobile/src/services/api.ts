import axios from 'axios';
import { getToken, removeToken } from '../utils/storage';

// API Base URL - Update this for production
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:8001/api' 
  : 'https://your-production-domain.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      await removeToken();
      // Navigate to login screen (handled by navigation context)
    }
    return Promise.reject(error);
  }
);

export default api;
