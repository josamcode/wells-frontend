import axios from './axios';

export const reportsAPI = {
  getAll: (params) => axios.get('/reports', { params }),
  getById: (id) => axios.get(`/reports/${id}`),
  getStats: () => axios.get('/reports/stats'),
  create: (data) => axios.post('/reports', data),
  update: (id, data) => axios.put(`/reports/${id}`, data),
  delete: (id) => axios.delete(`/reports/${id}`),
  submit: (id) => axios.post(`/reports/${id}/submit`),
  review: (id, action, reviewNotes, rejectionReason) =>
    axios.post(`/reports/${id}/review`, { action, reviewNotes, rejectionReason }),
  uploadAttachments: (id, formData) =>
    axios.post(`/reports/${id}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  deleteAttachment: (reportId, attachmentId) =>
    axios.delete(`/reports/${reportId}/attachments/${attachmentId}`),
};

