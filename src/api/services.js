import api from './axios';

export const authService = {
  login: async (identifier, password) => {
    const response = await api.post('/auth/login', { identifier, password });
    return response.data;
  },
  changePassword: async (oldPassword, newPassword) => {
    const response = await api.post('/auth/change-password', { oldPassword, newPassword });
    return response.data;
  },
  getProfile: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

export const categoryService = {
  getAll: async (params = {}) => {
    const response = await api.get('/categories', { params });
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },
  create: async (formData) => {
    const response = await api.post('/categories', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  update: async (id, formData) => {
    const response = await api.put(`/categories/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },
};

export const imageService = {
  uploadBatch: async (formData, onUploadProgress) => {
    const response = await api.post('/images/batch', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress,
    });
    return response.data;
  },
  getAll: async (params = {}) => {
    const response = await api.get('/images', { params });
    return response.data;
  },
  toggleSlider: async (id) => {
    const response = await api.patch(`/images/${id}/toggle-slider`);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/images/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/images/${id}`);
    return response.data;
  },
};

export const settingsService = {
  get: async () => {
    const response = await api.get('/settings');
    return response.data;
  },
  update: async (data) => {
    const response = await api.put('/settings', data);
    return response.data;
  },
};

