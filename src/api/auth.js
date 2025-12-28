import axios from './axios';

export const authAPI = {
  login: (email, password) => axios.post('/auth/login', { email, password }),
  clientSendOTP: (email) => axios.post('/auth/client-send-otp', { email }),
  clientLogin: (email, otp) => axios.post('/auth/client-login', { email, otp }),
  getProfile: () => axios.get('/auth/profile'),
  updateProfile: (data) => axios.put('/auth/profile', data),
  changePassword: (currentPassword, newPassword) =>
    axios.post('/auth/change-password', { currentPassword, newPassword }),
  forgotPassword: (email) => axios.post('/auth/forgot-password', { email }),
  resetPassword: (token, newPassword) =>
    axios.post('/auth/reset-password', { token, newPassword }),
};

