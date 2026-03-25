import api from './api';

export interface WalletBalance {
  available: number;
  pending: number;
  total: number;
  currency: string;
}

export interface TokenBalance {
  points: number;
  pending_points: number;
  tier: string;
  tier_progress: number;
}

export interface Coupon {
  _id: string;
  code: string;
  type: 'percentage' | 'fixed' | 'free_delivery';
  value: number;
  min_order_amount?: number;
  max_discount?: number;
  expires_at: string;
  is_used: boolean;
}

export const walletService = {
  getWalletBalance: async (): Promise<WalletBalance> => {
    try {
      const response = await api.get('/wallet/balance');
      return response.data;
    } catch (error) {
      // Return mock data if endpoint not available
      return {
        available: 0,
        pending: 0,
        total: 0,
        currency: 'PHP',
      };
    }
  },

  getTokenBalance: async (): Promise<TokenBalance> => {
    try {
      const response = await api.get('/rewards/balance');
      return response.data;
    } catch (error) {
      // Return mock data if endpoint not available
      return {
        points: 0,
        pending_points: 0,
        tier: 'Bronze',
        tier_progress: 0,
      };
    }
  },

  getCoupons: async (): Promise<Coupon[]> => {
    try {
      const response = await api.get('/wallet/coupons');
      return response.data;
    } catch (error) {
      return [];
    }
  },

  applyCoupon: async (code: string, orderId: string): Promise<{ discount: number }> => {
    const response = await api.post('/wallet/apply-coupon', { code, order_id: orderId });
    return response.data;
  },
};
