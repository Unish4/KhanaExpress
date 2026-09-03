import api from './api';

export const authService = {
  async register(userData) {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  async login(credentials) {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  async getMe() {
    const response = await api.get('/auth/me');
    return response.data;
  },

  async updateProfile(profileData) {
    const response = await api.patch('/auth/me', profileData);
    return response.data;
  },

  async changePassword(passwordData) {
    const response = await api.patch('/auth/change-password', passwordData);
    return response.data;
  },

  async uploadAvatar(file) {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await api.post('/auth/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async deleteAvatar() {
    const response = await api.delete('/auth/avatar');
    return response.data;
  },

  async getUserStats() {
    const response = await api.get('/auth/stats');
    return response.data;
  },
};

export default authService;
