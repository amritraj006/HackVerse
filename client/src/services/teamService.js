import api from './api';

export const teamService = {
  /**
   * Create a team for a hackathon
   */
  create: async (data) => {
    return await api.post('/teams', data);
  },

  /**
   * Join a team via join code
   */
  joinByCode: async (joinCode) => {
    return await api.post('/teams/join', { joinCode });
  },

  /**
   * Get user's active/joined teams
   */
  getMyTeams: async (params) => {
    return await api.get('/teams/my-teams', { params });
  },

  /**
   * Get teams for a specific hackathon
   */
  getHackathonTeams: async (hackathonId, params) => {
    return await api.get(`/teams/hackathon/${hackathonId}`, { params });
  },


  /**
   * Get team details by ID
   */
  getById: async (teamId) => {
    return await api.get(`/teams/${teamId}`);
  },

  /**
   * Invite member by email
   */
  inviteMember: async (teamId, email) => {
    return await api.post(`/teams/${teamId}/invite`, { email });
  },

  /**
   * Remove member from team
   */
  removeMember: async (teamId, memberId) => {
    return await api.delete(`/teams/${teamId}/members/${memberId}`);
  },

  /**
   * Transfer leadership
   */
  transferLeadership: async (teamId, newLeaderId) => {
    return await api.put(`/teams/${teamId}/transfer-leadership`, { newLeaderId });
  },

  /**
   * Leave team
   */
  leaveTeam: async (teamId) => {
    return await api.post(`/teams/${teamId}/leave`);
  },

  /**
   * Delete team
   */
  deleteTeam: async (teamId) => {
    return await api.delete(`/teams/${teamId}`);
  },
};
