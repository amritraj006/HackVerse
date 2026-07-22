import api from './api';

export const submissionService = {
  /**
   * Create or update project submission with FormData (files + text)
   */
  submit: async (formData) => {
    return await api.post('/submissions', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * Get public showcase list of submissions
   */
  getAll: async (params = {}) => {
    return await api.get('/submissions', { params });
  },

  /**
   * Get current user's submissions
   */
  getMySubmissions: async () => {
    return await api.get('/submissions/my-submissions');
  },

  /**
   * Get submissions for a hackathon
   */
  getHackathonSubmissions: async (hackathonId) => {
    return await api.get(`/submissions/hackathon/${hackathonId}`);
  },

  /**
   * Get single submission by ID
   */
  getById: async (id) => {
    return await api.get(`/submissions/${id}`);
  },

  /**
   * Delete submission
   */
  deleteSubmission: async (id) => {
    return await api.delete(`/submissions/${id}`);
  },
};
