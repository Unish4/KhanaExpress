import { create } from 'zustand';
import authService from '../services/auth.service';
import toast from 'react-hot-toast';

const storedToken = localStorage.getItem('token');
const storedUser = localStorage.getItem('user')
  ? JSON.parse(localStorage.getItem('user'))
  : null;

export const useAuthStore = create((set, get) => ({
  user: storedUser,
  token: storedToken,
  isAuthenticated: !!storedToken,
  loading: false,
  error: null,

  login: async (credentials) => {
    set({ loading: true, error: null });
    try {
      const data = await authService.login(credentials);
      const { token, user } = data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      set({ user, token, isAuthenticated: true, loading: false });
      toast.success(data.message || 'Logged in successfully');
      return user;
    } catch (err) {
      const message = err.response?.data?.error || 'Login failed';
      set({ error: message, loading: false });
      toast.error(message);
      throw err;
    }
  },

  register: async (userData) => {
    set({ loading: true, error: null });
    try {
      const data = await authService.register(userData);
      const { token, user } = data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      set({ user, token, isAuthenticated: true, loading: false });
      toast.success(data.message || 'Account registered successfully');
      return user;
    } catch (err) {
      const message = err.response?.data?.error || 'Registration failed';
      set({ error: message, loading: false });
      toast.error(message);
      throw err;
    }
  },

  fetchMe: async () => {
    if (!get().token) return;
    set({ loading: true });
    try {
      const response = await authService.getMe();
      const user = response.data;
      localStorage.setItem('user', JSON.stringify(user));
      set({ user, isAuthenticated: true, loading: false });
      return user;
    } catch (err) {
      set({ loading: false });
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null, isAuthenticated: false, error: null });
    toast.success('Logged out successfully');
  },

  updateProfile: async (profileData) => {
    set({ loading: true });
    try {
      const res = await authService.updateProfile(profileData);
      const updatedUser = res.data;
      localStorage.setItem('user', JSON.stringify(updatedUser));
      set({ user: updatedUser, loading: false });
      toast.success(res.message || 'Profile updated successfully');
      return updatedUser;
    } catch (err) {
      const message = err.response?.data?.error || 'Update failed';
      set({ loading: false });
      toast.error(message);
      throw err;
    }
  },

  changePassword: async (passwordData) => {
    set({ loading: true });
    try {
      const res = await authService.changePassword(passwordData);
      set({ loading: false });
      toast.success(res.message || 'Password changed successfully');
      return res;
    } catch (err) {
      const message = err.response?.data?.error || 'Failed to change password';
      set({ loading: false });
      toast.error(message);
      throw err;
    }
  },

  uploadAvatar: async (file) => {
    set({ loading: true });
    try {
      const res = await authService.uploadAvatar(file);
      const updatedAvatar = res.data.avatar;
      const currentUser = get().user;
      const newUser = { ...currentUser, avatar: updatedAvatar };
      localStorage.setItem('user', JSON.stringify(newUser));
      set({ user: newUser, loading: false });
      toast.success('Avatar uploaded successfully');
      return updatedAvatar;
    } catch (err) {
      const message = err.response?.data?.error || 'Avatar upload failed';
      set({ loading: false });
      toast.error(message);
      throw err;
    }
  },

  deleteAvatar: async () => {
    set({ loading: true });
    try {
      await authService.deleteAvatar();
      const currentUser = get().user;
      const newUser = { ...currentUser, avatar: { url: '', publicId: '' } };
      localStorage.setItem('user', JSON.stringify(newUser));
      set({ user: newUser, loading: false });
      toast.success('Avatar removed');
    } catch (err) {
      const message = err.response?.data?.error || 'Failed to remove avatar';
      set({ loading: false });
      toast.error(message);
    }
  },
}));

export default useAuthStore;
