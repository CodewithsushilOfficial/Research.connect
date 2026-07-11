import axios from 'axios';
import { toast } from 'react-hot-toast';
import { store } from '../redux';
import { updateToken, logoutSuccess } from '../redux/slices/authSlice';

// Use the backend url with suffix 'api' since in backend all routes are defined with prefix 'api'
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'  || '/api', 
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

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Keep track of active toasts to avoid spamming the same error repeatedly
const activeToasts = new Map();

const showDeduplicatedError = (message, options) => {
  const now = Date.now();
  const lastTime = activeToasts.get(message);
  
  // If the same message was displayed within the last 3 seconds, skip it
  if (lastTime && (now - lastTime < 3000)) {
    return;
  }
  
  activeToasts.set(message, now);
  
  // Clean up key after 3 seconds
  setTimeout(() => {
    if (activeToasts.get(message) === now) {
      activeToasts.delete(message);
    }
  }, 3000);

  toast.error(message, options);
};

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

    if (status === 401 && !originalRequest._retry) {
      // If we are already on login page or attempting to refresh token, do not retry
      if (window.location.pathname.includes('/login') || originalRequest.url.includes('/refresh-token')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('profile');
        store.dispatch(logoutSuccess());
        
        // Visual feedback for invalid credentials or refresh failure
        const errorMsg = error.response?.data?.message || 'Invalid email or password.';
        showDeduplicatedError(errorMsg, toastStyle);
        
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return axiosInstance(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      return new Promise(function(resolve, reject) {
        axiosInstance.post('/v1/auth/refresh-token', {}, { _retry: true })
          .then((res) => {
            if (res.success && res.data?.accessToken) {
              const newToken = res.data.accessToken;
              store.dispatch(updateToken(newToken));
              originalRequest.headers['Authorization'] = 'Bearer ' + newToken;
              processQueue(null, newToken);
              resolve(axiosInstance(originalRequest));
            } else {
              throw new Error('Refresh token invalid');
            }
          })
          .catch((err) => {
            processQueue(err, null);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('profile');
            store.dispatch(logoutSuccess());
            showDeduplicatedError('Session expired. Please log in again.', toastStyle);
            setTimeout(() => {
              window.location.href = '/login';
            }, 1500);
            reject(err);
          })
          .finally(() => {
            isRefreshing = false;
          });
      });
    } else if (status === 403) {
      showDeduplicatedError('You do not have permission to perform this action.', toastStyle);
    } else if (status === 429) {
      showDeduplicatedError('Too many requests. Please slow down and try again later.', toastStyle);
    } else if (status >= 500) {
      showDeduplicatedError('Internal server error. Our engineering team has been notified.', toastStyle);
    } else {
      // Local operational errors
      const errorMsg = error.response?.data?.message || 'Something went wrong. Please try again.';
      if (errorMsg === 'Complete Your profile and link Google Scholar') {
        showDeduplicatedError(errorMsg, {
          style: {
            background: '#F59E0B', // Warning Amber
            color: '#FFFFFF',
            fontSize: '14px',
            fontFamily: 'Inter, sans-serif',
            fontWeight: '600'
          }
        });
      } else {
        showDeduplicatedError(errorMsg, toastStyle);
      }
    }

    return Promise.reject(error.response?.data || error);
  }
);

export default axiosInstance;
