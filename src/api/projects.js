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
  review: (id, reviewStatus, reviewNotes) =>
    axios.post(`/projects/${id}/review`, { reviewStatus, reviewNotes }),
  evaluate: (id, evaluationData) =>
    axios.post(`/projects/${id}/evaluate`, evaluationData),
  clientEvaluate: (id, data) => axios.post(`/projects/${id}/client-evaluate`, data),
  uploadMedia: (projectId, file, name) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', name);
    return axios.post(`/projects/${projectId}/media`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  uploadMultipleMedia: (projectId, files, names) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    if (Array.isArray(names)) {
      names.forEach((name, index) => {
        formData.append(`names[${index}]`, name);
      });
    } else if (names) {
      formData.append('names', names);
    }
    return axios.post(`/projects/${projectId}/media/multiple`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  deleteMedia: (projectId, mediaId) => axios.delete(`/projects/${projectId}/media/${mediaId}`),
  uploadContract: (projectId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return axios.post(`/projects/${projectId}/contract`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  deleteContract: (projectId) => axios.delete(`/projects/${projectId}/contract`),
  getContract: (projectId) => axios.get(`/projects/${projectId}/contract`, { responseType: 'blob' }),
};

