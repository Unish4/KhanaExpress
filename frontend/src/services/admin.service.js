import api from './api';

export const adminService = {
  async getStats() {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  async getUsers(params = {}) {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  async updateUserStatus(id, data) {
    const response = await api.patch(`/admin/users/${id}`, data);
    return response.data;
  },

  async getRestaurants(params = {}) {
    const response = await api.get('/admin/restaurants', { params });
    return response.data;
  },

  async toggleRestaurantStatus(id, data) {
    const response = await api.patch(`/admin/restaurants/${id}/status`, data);
    return response.data;
  },

  async getOrders(params = {}) {
    const response = await api.get('/admin/orders', { params });
    return response.data;
  },
};

export default adminService;
