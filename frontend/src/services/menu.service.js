import api from './api';

export const menuService = {
  async getMenuItems(params = {}) {
    const response = await api.get('/menu', { params });
    return response.data;
  },

  async getRestaurantMenu(restaurantId) {
    const response = await api.get(`/menu/restaurant/${restaurantId}`);
    return response.data;
  },

  async getMenuItem(id) {
    const response = await api.get(`/menu/${id}`);
    return response.data;
  },

  async createMenuItem(data) {
    const response = await api.post('/menu', data);
    return response.data;
  },

  async updateMenuItem(id, data) {
    const response = await api.put(`/menu/${id}`, data);
    return response.data;
  },

  async deleteMenuItem(id) {
    const response = await api.delete(`/menu/${id}`);
    return response.data;
  },

  async uploadImage(id, file) {
    const formData = new FormData();
    formData.append('image', file);
    const response = await api.post(`/menu/${id}/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async toggleAvailability(id) {
    const response = await api.patch(`/menu/${id}/availability`);
    return response.data;
  },
};

export default menuService;
