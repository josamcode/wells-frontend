import axios from './axios';

export const paymentsAPI = {
  create: (data) => axios.post('/payments', data),
  getProjectPayments: (projectId) => axios.get(`/payments/project/${projectId}`),
  getPaymentSummary: (projectId) => axios.get(`/payments/project/${projectId}/summary`),
  getPending: () => axios.get('/payments/pending'),
  approve: (paymentId) => axios.post(`/payments/${paymentId}/approve`),
  reject: (paymentId, rejectionReason) => axios.post(`/payments/${paymentId}/reject`, { rejectionReason }),
};
