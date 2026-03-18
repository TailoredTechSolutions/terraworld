import { create } from 'zustand';
import { Product } from '@/data/products';

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CouponCartItem {
  id: string;
  packageId: string;
  name: string;
  price: number;
  bv: number;
  reward: string;
  image: string;
  recipient: 'self' | 'existing_user' | 'new_member';
  recipientDetails?: {
    email?: string;
    fullName?: string;
    phone?: string;
    sponsorId?: string;
  };
}

export interface UpgradeCartItem {
  id: string;
  targetTier: string;
  targetPrice: number;
  currentTier: string;
  currentValue: number;
  upgradeCost: number;
  bvGenerated: number;
  image: string;
  benefits: string;
}

interface CartStore {
  items: CartItem[];
  couponItems: CouponCartItem[];
  upgradeItem: UpgradeCartItem | null;
  isOpen: boolean;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  addCoupon: (coupon: CouponCartItem) => void;
  removeCoupon: (id: string) => void;
  updateCouponRecipient: (id: string, recipient: CouponCartItem['recipient'], details?: CouponCartItem['recipientDetails']) => void;
  setUpgrade: (upgrade: UpgradeCartItem | null) => void;
  clearCart: () => void;
  toggleCart: () => void;
  setCartOpen: (open: boolean) => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getProductSubtotal: () => number;
  getCouponSubtotal: () => number;
  getUpgradeSubtotal: () => number;
  hasItems: () => boolean;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  couponItems: [],
  upgradeItem: null,
  isOpen: false,
  
  addItem: (product, quantity = 1) => {
    set((state) => {
      const existingItem = state.items.find(item => item.product.id === product.id);
      if (existingItem) {
        return {
          items: state.items.map(item =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          ),
        };
      }
      return { items: [...state.items, { product, quantity }] };
    });
  },
  
  removeItem: (productId) => {
    set((state) => ({
      items: state.items.filter(item => item.product.id !== productId),
    }));
  },
  
  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(productId);
      return;
    }
    set((state) => ({
      items: state.items.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      ),
    }));
  },

  addCoupon: (coupon) => {
    set((state) => ({
      couponItems: [...state.couponItems, coupon],
    }));
  },

  removeCoupon: (id) => {
    set((state) => ({
      couponItems: state.couponItems.filter(c => c.id !== id),
    }));
  },

  updateCouponRecipient: (id, recipient, details) => {
    set((state) => ({
      couponItems: state.couponItems.map(c =>
        c.id === id ? { ...c, recipient, recipientDetails: details } : c
      ),
    }));
  },
  
  setUpgrade: (upgrade) => set({ upgradeItem: upgrade }),

  clearCart: () => set({ items: [], couponItems: [], upgradeItem: null }),
  
  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
  
  setCartOpen: (open) => set({ isOpen: open }),
  
  getTotalItems: () => {
    return get().items.reduce((sum, item) => sum + item.quantity, 0) + get().couponItems.length;
  },
  
  getTotalPrice: () => {
    return get().items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
  },

  getProductSubtotal: () => {
    return get().items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  },

  getCouponSubtotal: () => {
    return get().couponItems.reduce((sum, c) => sum + c.price, 0);
  },

  hasItems: () => {
    return get().items.length > 0 || get().couponItems.length > 0;
  },
}));
