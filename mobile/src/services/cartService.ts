import api from './api';

export interface CartItem {
  product_id: string;
  quantity: number;
  unit_price: number;
  added_at: string;
  product: {
    name: string;
    slug: string;
    unit: string;
    current_price: number;
    stock_quantity: number;
    images: Array<{ url: string }>;
    availability: { status: string };
  };
  farmer: {
    id: string;
    farm_name: string;
  };
  subtotal: number;
}

export interface Cart {
  _id: string;
  user_id: string;
  items: CartItem[];
  totals: {
    subtotal: number;
    items_count: number;
  };
  updated_at: string;
}

export const cartService = {
  getCart: async (): Promise<Cart> => {
    const response = await api.get('/cart');
    return response.data;
  },

  addItem: async (productId: string, quantity: number = 1): Promise<Cart> => {
    const response = await api.post('/cart/items', {
      product_id: productId,
      quantity,
    });
    return response.data;
  },

  updateItem: async (productId: string, quantity: number): Promise<Cart> => {
    const response = await api.put(`/cart/items/${productId}`, { quantity });
    return response.data;
  },

  removeItem: async (productId: string): Promise<Cart> => {
    const response = await api.delete(`/cart/items/${productId}`);
    return response.data;
  },

  clearCart: async (): Promise<void> => {
    await api.delete('/cart');
  },
};