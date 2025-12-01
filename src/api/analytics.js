import axios from './axios';

export const analyticsAPI = {
  getDashboard: () => axios.get('/analytics/dashboard'),
  exportData: (type, format) => axios.get('/analytics/export', { params: { type, format } }),
};

