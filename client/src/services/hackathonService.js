import api from './api';

export const hackathonService = {
  getAll: async (params) => {
    return await api.get('/hackathons', { params });
  },
  getById: async (id) => {
    return await api.get(`/hackathons/${id}`);
  },
  getMyEvents: async () => {
    return await api.get('/hackathons/my-events');
  },
  create: async (data) => {
    return await api.post('/hackathons', data);
  },
  update: async (id, data) => {
    return await api.put(`/hackathons/${id}`, data);
  },
  delete: async (id) => {
    return await api.delete(`/hackathons/${id}`);
  },
  toggleRegistration: async (id, isRegistrationOpen) => {
    return await api.put(`/hackathons/${id}/registration`, { isRegistrationOpen });
  },
  assignJudges: async (id, judgeIds) => {
    return await api.put(`/hackathons/${id}/judges`, { judgeIds });
  },
  publishResults: async (id, winners) => {
    return await api.put(`/hackathons/${id}/results`, { winners });
  },
  getLeaderboard: async (id) => {
    return await api.get(`/hackathons/${id}/leaderboard`);
  },
  getLeaderboardPreview: async (id) => {
    return await api.get(`/hackathons/${id}/leaderboard/preview`);
  },
  getTeams: async (id) => {
    return await api.get(`/hackathons/${id}/teams`);
  },
  updateTeamStatus: async (hackathonId, teamId, status) => {
    return await api.put(`/hackathons/${hackathonId}/teams/${teamId}/status`, { status });
  },
  getSubmissions: async (id) => {
    return await api.get(`/hackathons/${id}/submissions`);
  },
};
