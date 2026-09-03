import { create } from 'zustand';
import toast from 'react-hot-toast';

const savedCart = localStorage.getItem('cart')
  ? JSON.parse(localStorage.getItem('cart'))
  : [];
const savedRestaurant = localStorage.getItem('cart_restaurant')
  ? JSON.parse(localStorage.getItem('cart_restaurant'))
  : null;

export const useCartStore = create((set, get) => ({
  cart: savedCart,
  restaurant: savedRestaurant,
  isOpen: false,

  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

  addItem: (item, restaurantInfo) => {
    const currentRestaurant = get().restaurant;
    const currentCart = get().cart;

    // If cart has items from a different restaurant
    if (currentCart.length > 0 && currentRestaurant && currentRestaurant._id !== restaurantInfo._id) {
      const confirmReplace = window.confirm(
        `Your cart contains items from "${currentRestaurant.name}". Reset cart to add items from "${restaurantInfo.name}"?`
      );
      if (!confirmReplace) return false;
      // Clear cart for new restaurant
      set({ cart: [], restaurant: restaurantInfo });
    }

    const itemTargetId = item._id || item.id;
    const existingIndex = get().cart.findIndex(
      (c) => (c._id || c.id || c.menuItem) === itemTargetId
    );

    let updatedCart = [];
    if (existingIndex > -1) {
      updatedCart = [...get().cart];
      updatedCart[existingIndex].quantity += 1;
    } else {
      updatedCart = [
        ...get().cart,
        {
          menuItem: itemTargetId,
          _id: itemTargetId,
          name: item.name,
          price: item.price,
          quantity: 1,
          specialInstructions: '',
          image: item.image?.url || item.imageUrl || '',
          isVegetarian: item.isVegetarian ?? item.isVeg ?? false,
        },
      ];
    }

    localStorage.setItem('cart', JSON.stringify(updatedCart));
    localStorage.setItem('cart_restaurant', JSON.stringify(restaurantInfo));
    set({ cart: updatedCart, restaurant: restaurantInfo });
    toast.success(`Added ${item.name} to cart`);
    return true;
  },

  updateQuantity: (itemId, quantity) => {
    let updatedCart = [];
    if (quantity <= 0) {
      updatedCart = get().cart.filter((i) => (i._id || i.id || i.menuItem) !== itemId);
    } else {
      updatedCart = get().cart.map((i) =>
        (i._id || i.id || i.menuItem) === itemId ? { ...i, quantity } : i
      );
    }

    if (updatedCart.length === 0) {
      localStorage.removeItem('cart');
      localStorage.removeItem('cart_restaurant');
      set({ cart: [], restaurant: null });
    } else {
      localStorage.setItem('cart', JSON.stringify(updatedCart));
      set({ cart: updatedCart });
    }
  },

  updateInstructions: (itemId, instructions) => {
    const updatedCart = get().cart.map((i) =>
      (i._id || i.id || i.menuItem) === itemId
        ? { ...i, specialInstructions: instructions }
        : i
    );
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    set({ cart: updatedCart });
  },

  removeItem: (itemId) => {
    const updatedCart = get().cart.filter((i) => (i._id || i.id || i.menuItem) !== itemId);
    if (updatedCart.length === 0) {
      localStorage.removeItem('cart');
      localStorage.removeItem('cart_restaurant');
      set({ cart: [], restaurant: null });
    } else {
      localStorage.setItem('cart', JSON.stringify(updatedCart));
      set({ cart: updatedCart });
    }
  },

  clearCart: () => {
    localStorage.removeItem('cart');
    localStorage.removeItem('cart_restaurant');
    set({ cart: [], restaurant: null });
  },

  getCartCount: () => {
    return get().cart.reduce((sum, i) => sum + i.quantity, 0);
  },

  getSubtotal: () => {
    return get().cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  },
}));

export default useCartStore;
