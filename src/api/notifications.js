import axios from './axios';

export const notificationsAPI = {
  getAll: (params) => axios.get('/notifications', { params }),
  getUnreadCount: () => axios.get('/notifications/unread-count'),
  markAsRead: (id) => axios.patch(`/notifications/${id}/read`),
  markAllAsRead: () => axios.patch('/notifications/mark-all-read'),
  delete: (id) => axios.delete(`/notifications/${id}`),
};

