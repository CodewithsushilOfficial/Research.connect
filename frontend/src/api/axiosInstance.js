import axios from 'axios';
import { toast } from 'react-hot-toast';
import { store } from '../redux';
import { updateToken, logoutSuccess } from '../redux/slices/authSlice';

// Use the backend url with suffix 'api' since in backend all routes are defined with prefix 'api'
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api' || '/api', 
  timeout: 10000, // Enforce standard 10-second timeout
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// --- FEATURE 1: RETRY CONFIGURATION ---
const MAX_RETRIES = 3;
const RETRY_DELAY_BASE = 1000; // 1 second base delay
const IDEMPOTENT_METHODS = ['get', 'head', 'options', 'put', 'delete'];

const shouldRetry = (error) => {
  // Don't retry if the request was aborted/cancelled manually
  if (axios.isCancel(error)) return false;
  
  // Retry on network errors or transient 5xx server errors
  const status = error.response ? error.response.status : null;
  const isNetworkOrTransient = !status || (status >= 500 && status <= 599);
  
  // Only retry idempotent methods to prevent duplicating side-effects (like POST)
  const isIdempotent = error.config && IDEMPOTENT_METHODS.includes(error.config.method?.toLowerCase());
  
  return isNetworkOrTransient && isIdempotent;
};

// Request Deduplication and Abort tracking
const pendingRequests = new Map();

const getRequestKey = (config) => {
  const { method, url, params, data } = config;
  const serializedParams = params ? JSON.stringify(params) : '';
  // Avoid serializing large data objects, but serialize method, url and query params
  return [method, url, serializedParams].join('&');
};

const addPendingRequest = (config) => {
  const requestKey = getRequestKey(config);
  if (pendingRequests.has(requestKey)) {
    const controller = pendingRequests.get(requestKey);
    controller.abort(); // Cancel the duplicate pending request
    pendingRequests.delete(requestKey);
  }
  const controller = new AbortController();
  config.signal = controller.signal;
  pendingRequests.set(requestKey, controller);
};

const removePendingRequest = (config) => {
  const requestKey = getRequestKey(config);
  if (pendingRequests.has(requestKey)) {
    pendingRequests.delete(requestKey);
  }
};

// Request Interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // --- FEATURE 2: DEV LOGGING (REQUEST) ---
    if (import.meta.env.DEV) {
      console.log(`%c[Axios Request] [${config.method?.toUpperCase()}] %c${config.url}`, 'color: #3B82F6; font-weight: bold;', 'color: inherit;', {
        params: config.params,
        headers: config.headers,
        data: config.data,
      });
    }

    // Abort duplicate requests
    addPendingRequest(config);

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
    removePendingRequest(response.config);

    // --- FEATURE 2: DEV LOGGING (RESPONSE) ---
    if (import.meta.env.DEV) {
      console.log(`%c[Axios Response] %c${response.config.url}`, 'color: #10B981; font-weight: bold;', 'color: inherit;', response.data);
    }

    // Return formatted data block directly for ease of use
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    // --- FEATURE 2: DEV LOGGING (ERROR) ---
    if (import.meta.env.DEV) {
      console.error(`%c[Axios Error] %c${originalRequest?.url || 'Unknown URL'}`, 'color: #EF4444; font-weight: bold;', 'color: inherit;', error);
    }

    if (originalRequest) {
      removePendingRequest(originalRequest);
    }

    // Check if request was aborted/cancelled
    if (axios.isCancel(error)) {
      return Promise.reject({ isCanceled: true, message: 'Request aborted.' });
    }

    // --- FEATURE 1: RETRY LOGIC WITH EXPONENTIAL BACKOFF ---
    if (originalRequest && shouldRetry(error)) {
      originalRequest._retryCount = originalRequest._retryCount || 0;

      if (originalRequest._retryCount < MAX_RETRIES) {
        originalRequest._retryCount += 1;
        
        // Calculate backoff delay: 1000ms, 2000ms, 4000ms, etc.
        const delay = RETRY_DELAY_BASE * Math.pow(2, originalRequest._retryCount - 1);
        
        if (import.meta.env.DEV) {
          console.warn(`[Axios Retry] Retrying request to ${originalRequest.url} (Attempt ${originalRequest._retryCount}/${MAX_RETRIES}) in ${delay}ms...`);
        }

        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(axiosInstance(originalRequest));
          }, delay);
        });
      }
    }

    // Toast configuration
    const toastStyle = {
      style: {
        background: '#EF4444',
        color: '#FFFFFF',
        fontSize: '14px',
        fontFamily: 'Inter, sans-serif'
      }
    };

    // Check if actual network connection is down
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      const offlineError = {
        message: 'No internet connection.',
        isOffline: true,
        status: 'OFFLINE'
      };
      showDeduplicatedError(offlineError.message, toastStyle);
      return Promise.reject(offlineError);
    }

    // Check for request timeout (10s limit)
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      const timeoutError = {
        message: 'Server is taking longer than expected. (Request timed out)',
        isTimeout: true,
        status: 408
      };
      showDeduplicatedError(timeoutError.message, toastStyle);
      return Promise.reject(timeoutError);
    }

    const status = error.response ? error.response.status : null;

    if (status === 401 && !originalRequest?._retry) {
      // If we are already on login page or attempting to refresh token, do not retry
      if (window.location.pathname.includes('/login') || originalRequest?.url.includes('/refresh-token')) {
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

      if (originalRequest) {
        originalRequest._retry = true;
      }
      isRefreshing = true;

      return new Promise(function(resolve, reject) {
        axiosInstance.post('/v1/auth/refresh-token', {}, { _retry: true })
          .then((res) => {
            if (res.success && res.data?.accessToken) {
              const newToken = res.data.accessToken;
              store.dispatch(updateToken(newToken));
              if (originalRequest) {
                originalRequest.headers['Authorization'] = 'Bearer ' + newToken;
              }
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
