import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api'
});

// Attach token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('fitness_auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global 401 handler — auto-clear stale token and redirect to login
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only hard-redirect if we actually had a token stored (i.e. session expired)
      const hadToken = !!localStorage.getItem('fitness_auth_token');
      localStorage.removeItem('fitness_auth_token');

      // Avoid redirect loops on /login or /admin/login pages
      const path = window.location.pathname;
      if (hadToken && path !== '/login' && path !== '/admin/login' && path !== '/signup') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default API;
