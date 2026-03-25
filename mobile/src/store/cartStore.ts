import { create } from 'zustand';
import { cartService, Cart } from '../services/cartService';

interface CartState {
  cart: Cart | null;
  isLoading: boolean;
  error: string | null;
  fetchCart: () => Promise<void>;
  addToCart: (productId: string, quantity: number) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

export const useCartStore = create<CartState>((set) => ({
  cart: null,
  isLoading: false,
  error: null,

  fetchCart: async () => {
    set({ isLoading: true, error: null });
    try {
      const cart = await cartService.getCart();
      set({ cart, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  addToCart: async (productId: string, quantity: number) => {
    set({ isLoading: true, error: null });
    try {
      const cart = await cartService.addItem(productId, quantity);
      set({ cart, isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.detail || 'Failed to add to cart', isLoading: false });
      throw error;
    }
  },

  updateQuantity: async (productId: string, quantity: number) => {
    set({ isLoading: true, error: null });
    try {
      const cart = await cartService.updateItem(productId, quantity);
      set({ cart, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  removeFromCart: async (productId: string) => {
    set({ isLoading: true, error: null });
    try {
      const cart = await cartService.removeItem(productId);
      set({ cart, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  clearCart: async () => {
    try {
      await cartService.clearCart();
      set({ cart: null });
    } catch (error: any) {
      console.error('Clear cart error:', error);
    }
  },
}));