import { create } from 'zustand';
import orderService from '../services/order.service';
import toast from 'react-hot-toast';

export const useOrderStore = create((set, get) => ({
  myOrders: [],
  currentOrder: null,
  restaurantOrders: [],
  deliveryOrders: [],
  availableOrders: [],
  adminStats: null,
  pagination: null,
  loading: false,
  error: null,

  createOrder: async (orderData) => {
    set({ loading: true, error: null });
    try {
      const response = await orderService.createOrder(orderData);
      const newOrder = response.data;
      set({ currentOrder: newOrder, loading: false });
      toast.success(response.message || 'Order placed successfully!');
      return newOrder;
    } catch (err) {
      const message = err.response?.data?.error || 'Failed to place order';
      set({ error: message, loading: false });
      toast.error(message);
      throw err;
    }
  },

  fetchMyOrders: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const response = await orderService.getMyOrders(params);
      set({
        myOrders: response.data || [],
        pagination: response.pagination || null,
        loading: false,
      });
      return response.data;
    } catch (err) {
      const message = err.response?.data?.error || 'Failed to fetch your orders';
      set({ error: message, loading: false });
      return [];
    }
  },

  fetchOrder: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await orderService.getOrder(id);
      const order = response.data;
      set({ currentOrder: order, loading: false });
      return order;
    } catch (err) {
      const message = err.response?.data?.error || 'Failed to fetch order details';
      set({ error: message, loading: false });
      return null;
    }
  },

  fetchRestaurantOrders: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const response = await orderService.getRestaurantOrders(params);
      set({
        restaurantOrders: response.data || [],
        pagination: response.pagination || null,
        loading: false,
      });
      return response.data;
    } catch (err) {
      const message = err.response?.data?.error || 'Failed to fetch restaurant orders';
      set({ error: message, loading: false });
      return [];
    }
  },

  fetchDeliveryOrders: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const response = await orderService.getDeliveryOrders(params);
      set({ deliveryOrders: response.data || [], loading: false });
      return response.data;
    } catch (err) {
      const message = err.response?.data?.error || 'Failed to fetch delivery orders';
      set({ error: message, loading: false });
      return [];
    }
  },

  fetchAvailableOrders: async () => {
    set({ loading: true, error: null });
    try {
      const response = await orderService.getAvailableOrders();
      set({ availableOrders: response.data || [], loading: false });
      return response.data;
    } catch (err) {
      const message = err.response?.data?.error || 'Failed to fetch available orders';
      set({ error: message, loading: false });
      return [];
    }
  },

  acceptOrder: async (id) => {
    try {
      const response = await orderService.acceptOrder(id);
      toast.success(response.message || 'Order accepted');
      // Refresh current or restaurant orders
      if (get().currentOrder?._id === id) {
        set({ currentOrder: { ...get().currentOrder, status: 'confirmed' } });
      }
      await get().fetchRestaurantOrders();
      return response.data;
    } catch (err) {
      const message = err.response?.data?.error || 'Failed to accept order';
      toast.error(message);
      throw err;
    }
  },

  updateOrderStatus: async (id, status) => {
    try {
      const response = await orderService.updateOrderStatus(id, status);
      toast.success(response.message || `Order status updated to ${status}`);
      if (get().currentOrder?._id === id) {
        set({ currentOrder: { ...get().currentOrder, status } });
      }
      return response.data;
    } catch (err) {
      const message = err.response?.data?.error || 'Failed to update order status';
      toast.error(message);
      throw err;
    }
  },

  cancelOrder: async (id, cancelReason) => {
    try {
      const response = await orderService.cancelOrder(id, cancelReason);
      toast.success(response.message || 'Order cancelled');
      if (get().currentOrder?._id === id) {
        set({ currentOrder: { ...get().currentOrder, status: 'cancelled', cancelReason } });
      }
      await get().fetchMyOrders();
      return response.data;
    } catch (err) {
      const message = err.response?.data?.error || 'Failed to cancel order';
      toast.error(message);
      throw err;
    }
  },

  pickupOrder: async (id) => {
    try {
      const response = await orderService.pickupOrder(id);
      toast.success(response.message || 'Order picked up');
      await get().fetchAvailableOrders();
      await get().fetchDeliveryOrders();
      return response.data;
    } catch (err) {
      const message = err.response?.data?.error || 'Failed to pickup order';
      toast.error(message);
      throw err;
    }
  },

  deliverOrder: async (id) => {
    try {
      const response = await orderService.deliverOrder(id);
      toast.success(response.message || 'Order delivered successfully');
      await get().fetchDeliveryOrders();
      return response.data;
    } catch (err) {
      const message = err.response?.data?.error || 'Failed to deliver order';
      toast.error(message);
      throw err;
    }
  },

  fetchAdminStats: async () => {
    set({ loading: true });
    try {
      const response = await orderService.getAdminStats();
      set({ adminStats: response.data, loading: false });
      return response.data;
    } catch (err) {
      set({ loading: false });
      return null;
    }
  },
}));

export default useOrderStore;
