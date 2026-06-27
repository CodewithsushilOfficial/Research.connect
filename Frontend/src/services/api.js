import axios from 'axios';

// Get API base URL from environment variables, fallback to local port
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Allow cookies to be sent with requests
});

// Request Interceptor: Attach JWT Bearer Token if exists
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

// Response Interceptor: Uniform error handling and token invalidation redirects
api.interceptors.response.use(
  (response) => {
    // Return the response data body directly to reduce client redundancy
    return response.data;
  },
  (error) => {
    const originalRequest = error.config;
    
    // In case of JWT expiry, signout user and redirect to login page
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Redirect dynamically if not on login/register view
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        window.location.href = '/login?expired=true';
      }
    }
    
    // Extract formatted message from API response
    const apiError = (error.response && error.response.data && error.response.data.message)
      || error.message
      || 'Network request failure';
      
    return Promise.reject(new Error(apiError));
  }
);

export default api;
