import axios from './axios';

export const projectsAPI = {
  getAll: (params) => axios.get('/projects', { params }),
  getById: (id) => axios.get(`/projects/${id}`),
  getList: () => axios.get('/projects/list'),
  getStats: () => axios.get('/projects/stats'),
  create: (data) => axios.post('/projects', data),
  update: (id, data) => axios.put(`/projects/${id}`, data),
  delete: (id) => axios.delete(`/projects/${id}`),
  toggleArchive: (id) => axios.patch(`/projects/${id}/toggle-archive`),
  updateStatus: (id, status) => axios.patch(`/projects/${id}/status`, { status }),
};

