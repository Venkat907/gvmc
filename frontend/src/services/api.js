import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach Authorization header if token exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('gvmc_admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle unauthenticated responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if invalid or expired
      if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
        localStorage.removeItem('gvmc_admin_token');
        localStorage.removeItem('gvmc_admin_user');
      }
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// Datasets endpoints
export const datasetsAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/datasets', { params });
    return response.data;
  },
  getFeatured: async () => {
    const response = await api.get('/datasets/featured');
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/datasets/${id}`);
    return response.data;
  },
  getPreview: async (id) => {
    const response = await api.get(`/datasets/${id}/preview`);
    return response.data;
  },
  downloadUrl: (id) => {
    return `${API_BASE_URL}/datasets/${id}/download`;
  },
  create: async (formData) => {
    const response = await api.post('/datasets', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  update: async (id, formData) => {
    const response = await api.put(`/datasets/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/datasets/${id}`);
    return response.data;
  },
};

// Categories endpoints
export const categoriesAPI = {
  getAll: async () => {
    const response = await api.get('/categories');
    return response.data;
  },
  getDepartments: async () => {
    const response = await api.get('/categories/departments');
    return response.data;
  },
};

// Stats endpoints
export const statsAPI = {
  getStats: async () => {
    const response = await api.get('/stats');
    return response.data;
  },
};

// Activity logs endpoints
export const activityAPI = {
  getLogs: async (limit = 15) => {
    const response = await api.get('/activity', { params: { limit } });
    return response.data;
  },
};

export default api;
