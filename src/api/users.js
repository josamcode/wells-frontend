import axios from './axios';

export const usersAPI = {
  getAll: (params) => axios.get('/users', { params }),
  getById: (id) => axios.get(`/users/${id}`),
  getByRole: (role) => axios.get(`/users/role/${role}`),
  getStats: () => axios.get('/users/stats'),
  create: (data) => axios.post('/users', data),
  update: (id, data) => axios.put(`/users/${id}`, data),
  delete: (id) => axios.delete(`/users/${id}`),
  toggleStatus: (id) => axios.patch(`/users/${id}/toggle-status`),
  changePassword: (id, password) => axios.patch(`/users/${id}/change-password`, { password }),
  uploadMedia: (userId, file, name) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', name);
    return axios.post(`/users/${userId}/media`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  deleteMedia: (userId, mediaId) => axios.delete(`/users/${userId}/media/${mediaId}`),
};

