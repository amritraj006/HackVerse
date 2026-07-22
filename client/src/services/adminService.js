import api from './api';

export const adminService = {
  getAnalytics: async () => {
    return await api.get('/admin/analytics');
  },
  getUsers: async (params) => {
    return await api.get('/admin/users', { params });
  },
  toggleBlockUser: async (userId, isBlocked) => {
    return await api.put(`/admin/users/${userId}/block`, { isBlocked });
  },
  updateUserRole: async (userId, role) => {
    return await api.put(`/admin/users/${userId}/role`, { role });
  },
  deleteUser: async (userId) => {
    return await api.delete(`/admin/users/${userId}`);
  },
  getHackathons: async (params) => {
    return await api.get('/admin/hackathons', { params });
  },
  deleteHackathon: async (hackathonId) => {
    return await api.delete(`/admin/hackathons/${hackathonId}`);
  },
  getSubmissions: async (params) => {
    return await api.get('/admin/submissions', { params });
  },
  deleteSubmission: async (submissionId) => {
    return await api.delete(`/admin/submissions/${submissionId}`);
  },
};
