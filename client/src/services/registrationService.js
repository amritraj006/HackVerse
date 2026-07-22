import api from './api';

export const registrationService = {
  /**
   * Register current user for a hackathon
   */
  register: async (hackathonId) => {
    return await api.post(`/registrations/${hackathonId}`);
  },

  /**
   * Cancel registration for a hackathon
   */
  cancel: async (hackathonId) => {
    return await api.delete(`/registrations/${hackathonId}`);
  },

  /**
   * Get logged-in user's registration history
   */
  getMyRegistrations: async (params = {}) => {
    return await api.get('/registrations/my-registrations', { params });
  },

  /**
   * Check if current user is registered for a specific hackathon
   */
  getStatus: async (hackathonId) => {
    return await api.get(`/registrations/${hackathonId}/status`);
  },
};
