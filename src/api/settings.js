import axios from './axios';

export const settingsAPI = {
  getAll: (params) => axios.get('/settings', { params }),
  getByKey: (key) => axios.get(`/settings/${key}`),
  update: (data) => axios.put('/settings', data),
  updateMultiple: (settings) => axios.post('/settings/bulk', { settings }),
  delete: (key) => axios.delete(`/settings/${key}`),
  initializeGoogleDrive: (type, credentials) =>
    axios.post('/settings/google-drive/initialize', { type, credentials }),
  getGoogleDriveStatus: () => axios.get('/settings/google-drive/status'),
  getGoogleDriveAuthUrl: () => axios.get('/settings/google-drive/auth-url'),
  updateTheme: (theme) => axios.post('/settings/theme', theme),
};

