import axios from 'axios';

const rawBase = import.meta.env.VITE_API_URL || '';
const baseURL = rawBase
  ? // ensure no trailing slash, then add /api unless it's already present
    (rawBase.replace(/\/$/, '').endsWith('/api')
      ? rawBase.replace(/\/$/, '')
      : rawBase.replace(/\/$/, '') + '/api')
  : 'http://localhost:5000/api';

const instance = axios.create({
  baseURL,
  // optional: if you rely on cookies for auth, enable this
  // withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add the auth token to every request
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers || {};
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default instance;
