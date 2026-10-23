import axios from 'axios';

// Create base Axios instance
const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle common errors and 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to login if unauthorized
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

// Convenience HTTP helpers
export const get = async (url, config = {}) => {
  try {
    const res = await api.get(url, config);
    return res.data;
  } catch (err) {
    throw err;
  }
};

export const post = async (url, data = {}, config = {}) => {
  try {
    const res = await api.post(url, data, config);
    return res.data;
  } catch (err) {
    throw err;
  }
};

export const put = async (url, data = {}, config = {}) => {
  try {
    const res = await api.put(url, data, config);
    return res.data;
  } catch (err) {
    throw err;
  }
};

export const del = async (url, config = {}) => {
  try {
    const res = await api.delete(url, config);
    return res.data;
  } catch (err) {
    throw err;
  }
};

export default api;
