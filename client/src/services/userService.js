import api from './api';

export const userService = {
  getProfile: async () => {
    return await api.get('/users/profile');
  },
  updateProfile: async (profileData) => {
    return await api.put('/users/profile', profileData);
  },
  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return await api.post('/users/profile/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  getAllUsers: async (params) => {
    return await api.get('/users', { params });
  },
};

