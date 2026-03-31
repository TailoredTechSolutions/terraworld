// API Service for Terra Farming Backend
const API_URL = import.meta.env.REACT_APP_BACKEND_URL || '';

// Types matching backend models
export interface Product {
  id: string;
  name: string;
  price: number;
  unit: string;
  farm_id: string;
  farm_name: string;
  image: string;
  category: string;
  stock: number;
  organic: boolean;
  description: string;
  created_at?: string;
  updated_at?: string;
}

export interface Farm {
  id: string;
  name: string;
  owner: string;
  latitude: number;
  longitude: number;
  rating: number;
  review_count: number;
  image: string;
  description: string;
  products: string[];
  contact?: string;
  farm_type?: string;
  certificate?: string;
  program?: string;
  municipality?: string;
  province?: string;
  elevation?: string;
  farm_area?: string;
  established?: string;
  specialties?: string[];
  categories?: string[];
  operating_hours?: string;
  delivery_available?: boolean;
  organic_certified?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CartItem {
  product_id: string;
  product_name: string;
  farm_name: string;
  price: number;
  unit: string;
  quantity: number;
  image: string;
}

export interface Cart {
  id: string;
  user_id: string;
  items: CartItem[];
  created_at?: string;
  updated_at?: string;
}

export interface DeliveryAddress {
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  province: string;
  postal_code: string;
  notes?: string;
}

export interface OrderItem {
  product_id: string;
  product_name: string;
  farm_name: string;
  price: number;
  unit: string;
  quantity: number;
  subtotal: number;
  image: string;
}

export interface Order {
  id: string;
  user_id: string;
  items: OrderItem[];
  delivery_address: DeliveryAddress;
  payment_method: 'gcash' | 'maya' | 'bank_transfer' | 'card' | 'cod';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  order_status: 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
  subtotal: number;
  delivery_fee: number;
  total: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

// Helper function for API calls
async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_URL}/api${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `API Error: ${response.status}`);
  }
  
  return response.json();
}

// ==================== PRODUCT API ====================

export const productApi = {
  getAll: async (params?: {
    category?: string;
    farm_id?: string;
    organic?: boolean;
    search?: string;
    min_price?: number;
    max_price?: number;
    skip?: number;
    limit?: number;
  }): Promise<Product[]> => {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.set('category', params.category);
    if (params?.farm_id) searchParams.set('farm_id', params.farm_id);
    if (params?.organic !== undefined) searchParams.set('organic', String(params.organic));
    if (params?.search) searchParams.set('search', params.search);
    if (params?.min_price !== undefined) searchParams.set('min_price', String(params.min_price));
    if (params?.max_price !== undefined) searchParams.set('max_price', String(params.max_price));
    if (params?.skip !== undefined) searchParams.set('skip', String(params.skip));
    if (params?.limit !== undefined) searchParams.set('limit', String(params.limit));
    
    const queryString = searchParams.toString();
    return apiCall<Product[]>(`/products${queryString ? `?${queryString}` : ''}`);
  },

  getById: async (id: string): Promise<Product> => {
    return apiCall<Product>(`/products/${id}`);
  },

  create: async (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> => {
    return apiCall<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  },

  update: async (id: string, product: Partial<Product>): Promise<Product> => {
    return apiCall<Product>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product),
    });
  },

  delete: async (id: string): Promise<void> => {
    return apiCall(`/products/${id}`, { method: 'DELETE' });
  },
};

// ==================== FARM API ====================

export const farmApi = {
  getAll: async (params?: {
    category?: string;
    organic_certified?: boolean;
    delivery_available?: boolean;
    municipality?: string;
    search?: string;
    skip?: number;
    limit?: number;
  }): Promise<Farm[]> => {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.set('category', params.category);
    if (params?.organic_certified !== undefined) searchParams.set('organic_certified', String(params.organic_certified));
    if (params?.delivery_available !== undefined) searchParams.set('delivery_available', String(params.delivery_available));
    if (params?.municipality) searchParams.set('municipality', params.municipality);
    if (params?.search) searchParams.set('search', params.search);
    if (params?.skip !== undefined) searchParams.set('skip', String(params.skip));
    if (params?.limit !== undefined) searchParams.set('limit', String(params.limit));
    
    const queryString = searchParams.toString();
    return apiCall<Farm[]>(`/farms${queryString ? `?${queryString}` : ''}`);
  },

  getById: async (id: string): Promise<Farm> => {
    return apiCall<Farm>(`/farms/${id}`);
  },

  getProducts: async (farmId: string): Promise<Product[]> => {
    return apiCall<Product[]>(`/farms/${farmId}/products`);
  },

  create: async (farm: Omit<Farm, 'id' | 'created_at' | 'updated_at'>): Promise<Farm> => {
    return apiCall<Farm>('/farms', {
      method: 'POST',
      body: JSON.stringify(farm),
    });
  },
};

// ==================== CART API ====================

export const cartApi = {
  get: async (userId: string): Promise<Cart> => {
    return apiCall<Cart>(`/cart/${userId}`);
  },

  addItem: async (userId: string, productId: string, quantity: number = 1): Promise<Cart> => {
    return apiCall<Cart>('/cart/add', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, product_id: productId, quantity }),
    });
  },

  updateItem: async (userId: string, productId: string, quantity: number): Promise<Cart> => {
    return apiCall<Cart>(`/cart/${userId}/item/${productId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
  },

  removeItem: async (userId: string, productId: string): Promise<Cart> => {
    return apiCall<Cart>(`/cart/${userId}/item/${productId}`, {
      method: 'DELETE',
    });
  },

  clear: async (userId: string): Promise<void> => {
    return apiCall(`/cart/${userId}`, { method: 'DELETE' });
  },
};

// ==================== ORDER API ====================

export const orderApi = {
  create: async (request: {
    user_id: string;
    delivery_address: DeliveryAddress;
    payment_method: Order['payment_method'];
    notes?: string;
  }): Promise<Order> => {
    return apiCall<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  getUserOrders: async (userId: string, skip?: number, limit?: number): Promise<Order[]> => {
    const searchParams = new URLSearchParams();
    if (skip !== undefined) searchParams.set('skip', String(skip));
    if (limit !== undefined) searchParams.set('limit', String(limit));
    
    const queryString = searchParams.toString();
    return apiCall<Order[]>(`/orders/${userId}${queryString ? `?${queryString}` : ''}`);
  },

  getById: async (orderId: string): Promise<Order> => {
    return apiCall<Order>(`/orders/detail/${orderId}`);
  },

  updateStatus: async (orderId: string, status: Order['order_status']): Promise<void> => {
    return apiCall(`/orders/${orderId}/status?status=${status}`, {
      method: 'PUT',
    });
  },

  cancel: async (orderId: string): Promise<void> => {
    return apiCall(`/orders/${orderId}/cancel`, {
      method: 'PUT',
    });
  },
};

// ==================== CATEGORY API ====================

export const categoryApi = {
  getAll: async (): Promise<Category[]> => {
    return apiCall<Category[]>('/categories');
  },
};

// ==================== UTILITY ====================

export const seedDatabase = async (): Promise<{ message: string; farms: number; products: number }> => {
  return apiCall('/seed', { method: 'POST' });
};

export const healthCheck = async (): Promise<{ status: string; database: string }> => {
  return apiCall('/health');
};
