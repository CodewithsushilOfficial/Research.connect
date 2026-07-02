import axios from 'axios';
import { toast } from 'react-hot-toast';

const apiRoot = import.meta.env.VITE_API_BASE_URL?.trim() || '';
const normalizedApiRoot = apiRoot.replace(/\/+$/, '');
const baseURL = normalizedApiRoot
  ? normalizedApiRoot.endsWith('/api')
    ? normalizedApiRoot
    : `${normalizedApiRoot}/api`
  : '/api';

const axiosInstance = axios.create({
  baseURL,
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request Interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Generate a unique Request ID for distributed tracing
    config.headers['X-Request-Id'] = typeof crypto !== 'undefined' && crypto.randomUUID 
      ? crypto.randomUUID() 
      : Math.random().toString(36).substring(2, 15);

    // Attach Bearer JWT token if stored locally
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    // Return formatted data block directly for ease of use
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;
    const status = error.response ? error.response.status : null;

    // Toast configuration
    const toastStyle = {
      style: {
        background: '#EF4444',
        color: '#FFFFFF',
        fontSize: '14px',
        fontFamily: 'Inter, sans-serif'
      }
    };

    if (status === 401) {
      // Token expired or invalid - clear stored auth and show user-facing error
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      toast.error(error.response?.data?.message || 'Session expired. Please log in again.', toastStyle);

      // Prevent infinite loop if we are already attempting refresh or on login page
      if (!originalRequest._retry && !window.location.pathname.includes('/login')) {
        originalRequest._retry = true;
        setTimeout(() => {
          window.location.href = '/login';
        }, 1500);
      }
    } else if (status === 403) {
      toast.error('You do not have permission to perform this action.', toastStyle);
    } else if (status === 429) {
      toast.error('Too many requests. Please slow down and try again later.', toastStyle);
    } else if (status >= 500) {
      toast.error('Internal server error. Our engineering team has been notified.', toastStyle);
    } else {
      // Local operational errors
      const errorMsg = error.response?.data?.message || 'Something went wrong. Please try again.';
      toast.error(errorMsg, toastStyle);
    }

    return Promise.reject(error.response?.data || error);
  }
);

export default axiosInstance;
