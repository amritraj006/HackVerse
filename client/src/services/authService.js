import api from './api';

export const authService = {
  signup: async (userData) => {
    return await api.post('/auth/signup', userData);
  },
  login: async (credentials) => {
    return await api.post('/auth/login', credentials);
  },
  logout: async () => {
    return await api.post('/auth/logout');
  },
  getCurrentUser: async () => {
    return await api.get('/auth/me');
  },
};
