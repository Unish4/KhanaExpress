import api from './api';

export const restaurantService = {
  async getRestaurants(params = {}) {
    const response = await api.get('/restaurants', { params });
    return response.data;
  },

  async getRestaurant(id) {
    const response = await api.get(`/restaurants/${id}`);
    return response.data;
  },

  async createRestaurant(data) {
    const response = await api.post('/restaurants', data);
    return response.data;
  },

  async updateRestaurant(id, data) {
    const response = await api.put(`/restaurants/${id}`, data);
    return response.data;
  },

  async deleteRestaurant(id) {
    const response = await api.delete(`/restaurants/${id}`);
    return response.data;
  },

  async uploadImage(id, file) {
    const formData = new FormData();
    formData.append('image', file);
    const response = await api.post(`/restaurants/${id}/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async toggleOpen(id) {
    const response = await api.patch(`/restaurants/${id}/toggle-open`);
    return response.data;
  },

  async getStats(id) {
    const response = await api.get(`/restaurants/${id}/stats`);
    return response.data;
  },
};

export default restaurantService;
