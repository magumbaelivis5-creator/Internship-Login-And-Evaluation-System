import axios from 'axios';

const API_BASE = 'http://localhost:8000/api';

const api = axios.create({ baseURL: API_BASE });

// Automatically attach your authentication token to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }

  // CLEANUP TRICK: Convert empty strings "" to null so Django doesn't fail on foreign keys
  if (config.data && typeof config.data === 'object') {
    Object.keys(config.data).forEach(key => {
      if (config.data[key] === '') {
        config.data[key] = null;
      }
    });
  }

  return config;
});

export const auth = {
  login: (data) => api.post('/auth/login/', data),
  register: (data) => api.post('/auth/register/', data),
  logout: () => api.post('/auth/logout/'),
  me: () => api.get('/auth/me/'),
  updateMe: (data) => api.patch('/auth/me/', data),
};

export const dashboard = {
  stats: () => api.get('/dashboard/stats/'),
};

export const internships = {
  list: () => api.get('/internships/'),
  create: (data) => api.post('/internships/', data),
  update: (id, data) => api.patch(`/internships/${id}/`, data),
  delete: (id) => api.delete(`/internships/${id}/`),
};

export const companies = {
  list: () => api.get('/companies/'),
  create: (data) => api.post('/companies/', data),
  update: (id, data) => api.patch(`/companies/${id}/`, data),
  delete: (id) => api.delete(`/companies/${id}/`),
};

export const reports = {
  list: () => api.get('/reports/'),
  create: (data) => api.post('/reports/', data),
  update: (id, data) => api.patch(`/reports/${id}/`, data),
};

export const evaluations = {
  list: () => api.get('/evaluations/'),
  create: (data) => api.post('/evaluations/', data),
  update: (id, data) => api.patch(`/evaluations/${id}/`, data),
  delete: (id) => api.delete(`/evaluations/${id}/`),
};

export const users = {
  list: (role) => api.get(`/users/${role ? `?role=${role}` : ''}`),
};

export default api;
