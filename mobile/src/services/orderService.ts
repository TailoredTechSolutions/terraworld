import api from './api';

export interface Order {
  _id: string;
  order_number: string;
  buyer_id: string;
  items: Array<any>;
  pricing: {
    subtotal: number;
    platform_fee: number;
    tax: number;
    logistics_fee: number;
    total: number;
  };
  delivery_address: any;
  status: string;
  status_history: Array<{
    status: string;
    timestamp: string;
    note?: string;
  }>;
  created_at: string;
  updated_at: string;
}

export const orderService = {
  createOrder: async (data: {
    delivery_address_id: string;
    delivery_instructions?: string;
    buyer_notes?: string;
  }): Promise<Order> => {
    const response = await api.post('/orders', data);
    return response.data;
  },

  getOrders: async (page = 1, status?: string) => {
    const response = await api.get('/orders', {
      params: { page, status },
    });
    return response.data;
  },

  getOrder: async (orderId: string): Promise<Order> => {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  },

  cancelOrder: async (orderId: string, reason?: string): Promise<Order> => {
    const response = await api.put(`/orders/${orderId}/cancel`, { reason });
    return response.data;
  },
};