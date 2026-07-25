import api from './api';

export const notificationService = {
  getAll: async () => {
    return await api.get('/notifications');
  },
  acceptInvitation: async (notificationId) => {
    return await api.post(`/notifications/${notificationId}/accept`);
  },
  rejectInvitation: async (notificationId) => {
    return await api.post(`/notifications/${notificationId}/reject`);
  },
  markAllAsRead: async () => {
    return await api.put('/notifications/read-all');
  },
};
