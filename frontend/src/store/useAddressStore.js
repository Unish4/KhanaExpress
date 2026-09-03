import { create } from 'zustand';
import addressService from '../services/address.service';
import toast from 'react-hot-toast';

export const useAddressStore = create((set, get) => ({
  addresses: [],
  defaultAddress: null,
  loading: false,
  error: null,

  fetchAddresses: async () => {
    set({ loading: true, error: null });
    try {
      const response = await addressService.getAddresses();
      const addresses = response.data || [];
      const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0] || null;
      set({ addresses, defaultAddress: defaultAddr, loading: false });
      return addresses;
    } catch (err) {
      const message = err.response?.data?.error || 'Failed to fetch addresses';
      set({ error: message, loading: false });
      return [];
    }
  },

  fetchDefaultAddress: async () => {
    try {
      const response = await addressService.getDefaultAddress();
      const defaultAddr = response.data;
      set({ defaultAddress: defaultAddr });
      return defaultAddr;
    } catch (err) {
      return null;
    }
  },

  addAddress: async (addressData) => {
    set({ loading: true });
    try {
      const response = await addressService.createAddress(addressData);
      const newAddress = response.data;
      toast.success(response.message || 'Address added successfully');
      await get().fetchAddresses();
      return newAddress;
    } catch (err) {
      const message = err.response?.data?.error || 'Failed to add address';
      set({ loading: false });
      toast.error(message);
      throw err;
    }
  },

  updateAddress: async (id, addressData) => {
    set({ loading: true });
    try {
      const response = await addressService.updateAddress(id, addressData);
      toast.success(response.message || 'Address updated');
      await get().fetchAddresses();
      return response.data;
    } catch (err) {
      const message = err.response?.data?.error || 'Failed to update address';
      set({ loading: false });
      toast.error(message);
      throw err;
    }
  },

  deleteAddress: async (id) => {
    set({ loading: true });
    try {
      const response = await addressService.deleteAddress(id);
      toast.success(response.message || 'Address deleted');
      await get().fetchAddresses();
    } catch (err) {
      const message = err.response?.data?.error || 'Failed to delete address';
      set({ loading: false });
      toast.error(message);
    }
  },

  setDefaultAddress: async (id) => {
    set({ loading: true });
    try {
      const response = await addressService.setDefaultAddress(id);
      toast.success('Default address updated');
      await get().fetchAddresses();
    } catch (err) {
      const message = err.response?.data?.error || 'Failed to set default address';
      set({ loading: false });
      toast.error(message);
    }
  },
}));

export default useAddressStore;
