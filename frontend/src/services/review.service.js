import api from './api';

export const reviewService = {
  async createReview(data) {
    const response = await api.post('/reviews', data);
    return response.data;
  },

  async getRestaurantReviews(restaurantId) {
    const response = await api.get(`/reviews/restaurant/${restaurantId}`);
    return response.data;
  },

  async getMenuItemReviews(menuItemId) {
    const response = await api.get(`/reviews/menu/${menuItemId}`);
    return response.data;
  },

  async updateReview(id, data) {
    const response = await api.put(`/reviews/${id}`, data);
    return response.data;
  },

  async deleteReview(id) {
    const response = await api.delete(`/reviews/${id}`);
    return response.data;
  },
};

export default reviewService;
