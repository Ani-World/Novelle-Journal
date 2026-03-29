import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Intercept requests to add token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('novelle-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Intercept responses to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('novelle-token');
      localStorage.removeItem('novelle-user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
