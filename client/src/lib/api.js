import axios from 'axios';

// TEMPORARY: Hardcoded for production
const API_URL = 'https://novelle-backend-u8ph.onrender.com/api';

console.log('🔧 Using API URL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;