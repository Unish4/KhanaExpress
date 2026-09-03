import { create } from 'zustand';
import restaurantService from '../services/restaurant.service';
import menuService from '../services/menu.service';
import toast from 'react-hot-toast';

export const useRestaurantStore = create((set, get) => ({
  restaurants: [],
  currentRestaurant: null,
  menu: [],
  pagination: null,
  stats: null,
  loading: false,
  error: null,

  fetchRestaurants: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const response = await restaurantService.getRestaurants(params);
      set({
        restaurants: response.data || [],
        pagination: response.pagination || null,
        loading: false,
      });
      return response.data;
    } catch (err) {
      const message = err.response?.data?.error || 'Failed to fetch restaurants';
      set({ error: message, loading: false });
      return [];
    }
  },

  fetchRestaurant: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await restaurantService.getRestaurant(id);
      const restaurantData = response.data;
      set({
        currentRestaurant: restaurantData,
        menu: restaurantData.menu || [],
        loading: false,
      });
      return restaurantData;
    } catch (err) {
      const message = err.response?.data?.error || 'Failed to fetch restaurant details';
      set({ error: message, loading: false });
      return null;
    }
  },

  createRestaurant: async (data) => {
    set({ loading: true });
    try {
      const response = await restaurantService.createRestaurant(data);
      toast.success(response.message || 'Restaurant created successfully');
      set({ currentRestaurant: response.data, loading: false });
      return response.data;
    } catch (err) {
      const message = err.response?.data?.error || 'Failed to create restaurant';
      set({ loading: false });
      toast.error(message);
      throw err;
    }
  },

  updateRestaurant: async (id, data) => {
    set({ loading: true });
    try {
      const response = await restaurantService.updateRestaurant(id, data);
      toast.success(response.message || 'Restaurant updated successfully');
      set({ currentRestaurant: response.data, loading: false });
      return response.data;
    } catch (err) {
      const message = err.response?.data?.error || 'Failed to update restaurant';
      set({ loading: false });
      toast.error(message);
      throw err;
    }
  },

  toggleOpen: async (id) => {
    try {
      const response = await restaurantService.toggleOpen(id);
      const isOpen = response.data?.isOpen;
      toast.success(response.message || `Restaurant is now ${isOpen ? 'OPEN' : 'CLOSED'}`);
      if (get().currentRestaurant) {
        set({
          currentRestaurant: { ...get().currentRestaurant, isOpen },
        });
      }
      return isOpen;
    } catch (err) {
      const message = err.response?.data?.error || 'Failed to toggle restaurant status';
      toast.error(message);
    }
  },

  fetchStats: async (id) => {
    try {
      const response = await restaurantService.getStats(id);
      set({ stats: response.data });
      return response.data;
    } catch (err) {
      return null;
    }
  },

  clearCurrentRestaurant: () => {
    set({ currentRestaurant: null, menu: [] });
  },
}));

export default useRestaurantStore;
