import api from './api';

export const addressService = {
  async getAddresses() {
    const response = await api.get('/addresses');
    return response.data;
  },

  async getDefaultAddress() {
    const response = await api.get('/addresses/default');
    return response.data;
  },

  async getAddress(id) {
    const response = await api.get(`/addresses/${id}`);
    return response.data;
  },

  async createAddress(data) {
    const response = await api.post('/addresses', data);
    return response.data;
  },

  async updateAddress(id, data) {
    const response = await api.put(`/addresses/${id}`, data);
    return response.data;
  },

  async deleteAddress(id) {
    const response = await api.delete(`/addresses/${id}`);
    return response.data;
  },

  async setDefaultAddress(id) {
    const response = await api.patch(`/addresses/${id}/default`);
    return response.data;
  },
};

export default addressService;
