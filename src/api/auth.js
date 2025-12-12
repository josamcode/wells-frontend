import axios from './axios';

export const authAPI = {
  login: (email, password) => axios.post('/auth/login', { email, password }),
  clientLogin: (phone) => axios.post('/auth/client-login', { phone }),
  getProfile: () => axios.get('/auth/profile'),
  updateProfile: (data) => axios.put('/auth/profile', data),
  changePassword: (currentPassword, newPassword) =>
    axios.post('/auth/change-password', { currentPassword, newPassword }),
  forgotPassword: (email) => axios.post('/auth/forgot-password', { email }),
  resetPassword: (token, newPassword) =>
    axios.post('/auth/reset-password', { token, newPassword }),
};

