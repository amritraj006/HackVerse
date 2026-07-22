import api from './api';

export const hackathonService = {
  getAll: async (params) => {
    return await api.get('/hackathons', { params });
  },
  getById: async (id) => {
    return await api.get(`/hackathons/${id}`);
  },
  create: async (data) => {
    return await api.post('/hackathons', data);
  },
};
