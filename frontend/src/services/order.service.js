import api from './api';

export const orderService = {
  async createOrder(orderData) {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  async getMyOrders(params = {}) {
    const response = await api.get('/orders', { params });
    return response.data;
  },

  async getRestaurantOrders(params = {}) {
    const response = await api.get('/orders/restaurant', { params });
    return response.data;
  },

  async getDeliveryOrders(params = {}) {
    const response = await api.get('/orders/delivery', { params });
    return response.data;
  },

  async getAvailableOrders() {
    const response = await api.get('/orders/available');
    return response.data;
  },

  async getOrder(id) {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  async acceptOrder(id) {
    const response = await api.patch(`/orders/${id}/accept`);
    return response.data;
  },

  async updateOrderStatus(id, status) {
    const response = await api.patch(`/orders/${id}/status`, { status });
    return response.data;
  },

  async cancelOrder(id, cancelReason = '') {
    const response = await api.patch(`/orders/${id}/cancel`, { cancelReason });
    return response.data;
  },

  async pickupOrder(id) {
    const response = await api.patch(`/orders/${id}/pickup`);
    return response.data;
  },

  async deliverOrder(id) {
    const response = await api.patch(`/orders/${id}/deliver`);
    return response.data;
  },

  async getAdminStats() {
    const response = await api.get('/orders/stats/summary');
    return response.data;
  },
};

export default orderService;
