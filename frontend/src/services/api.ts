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

// ==================== ADMIN API ====================

export interface AdminStats {
  total_orders: number;
  pending_orders: number;
  total_products: number;
  total_farms: number;
  total_revenue: number;
  recent_orders: Order[];
}

export const adminApi = {
  getStats: async (): Promise<AdminStats> => {
    return apiCall<AdminStats>('/admin/stats');
  },

  getAllOrders: async (params?: {
    status?: string;
    skip?: number;
    limit?: number;
  }): Promise<Order[]> => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.skip !== undefined) searchParams.set('skip', String(params.skip));
    if (params?.limit !== undefined) searchParams.set('limit', String(params.limit));
    
    const queryString = searchParams.toString();
    return apiCall<Order[]>(`/admin/orders${queryString ? `?${queryString}` : ''}`);
  },

  updateOrderStatus: async (orderId: string, status: Order['order_status']): Promise<void> => {
    return apiCall(`/admin/orders/${orderId}/status?status=${status}`, {
      method: 'PUT',
    });
  },
};

// ==================== FARMER API ====================

export interface FarmerStats {
  farm: Farm;
  product_count: number;
  total_orders: number;
  total_revenue: number;
}

export interface FarmerOrder {
  order_id: string;
  order_status: string;
  created_at: string;
  items: OrderItem[];
  farm_subtotal: number;
  delivery_address: DeliveryAddress;
}

export const farmerApi = {
  getStats: async (farmId: string): Promise<FarmerStats> => {
    return apiCall<FarmerStats>(`/farmer/${farmId}/stats`);
  },

  getProducts: async (farmId: string): Promise<Product[]> => {
    return apiCall<Product[]>(`/farmer/${farmId}/products`);
  },

  addProduct: async (farmId: string, product: Omit<Product, 'id' | 'farm_id' | 'farm_name' | 'created_at' | 'updated_at'>): Promise<Product> => {
    return apiCall<Product>(`/farmer/${farmId}/products`, {
      method: 'POST',
      body: JSON.stringify(product),
    });
  },

  updateProduct: async (farmId: string, productId: string, product: Partial<Product>): Promise<Product> => {
    return apiCall<Product>(`/farmer/${farmId}/products/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(product),
    });
  },

  deleteProduct: async (farmId: string, productId: string): Promise<void> => {
    return apiCall(`/farmer/${farmId}/products/${productId}`, { method: 'DELETE' });
  },

  getOrders: async (farmId: string): Promise<FarmerOrder[]> => {
    return apiCall<FarmerOrder[]>(`/farmer/${farmId}/orders`);
  },
};

// ==================== PAYMENT API (MOCK) ====================

export interface PaymentInitResponse {
  id: string;
  reference_number: string;
  amount: number;
  payment_method: string;
  status: string;
  qr_code: string;
  message: string;
  instructions: string[];
}

export interface PaymentStatus {
  id: string;
  status: string;
  amount: number;
  reference_number: string;
  payment_method: string;
}

export const paymentApi = {
  initiate: async (orderId: string, paymentMethod: string, phoneNumber?: string): Promise<PaymentInitResponse> => {
    return apiCall<PaymentInitResponse>('/payments/initiate', {
      method: 'POST',
      body: JSON.stringify({
        order_id: orderId,
        payment_method: paymentMethod,
        phone_number: phoneNumber,
      }),
    });
  },

  confirm: async (paymentId: string): Promise<{ status: string; message: string }> => {
    return apiCall(`/payments/${paymentId}/confirm`, { method: 'POST' });
  },

  getStatus: async (orderId: string): Promise<PaymentStatus> => {
    return apiCall<PaymentStatus>(`/payments/${orderId}/status`);
  },
};

// ==================== NOTIFICATION API ====================

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
  unread_count: number;
}

export const notificationApi = {
  getAll: async (userId: string): Promise<NotificationsResponse> => {
    return apiCall<NotificationsResponse>(`/notifications/${userId}`);
  },

  markAsRead: async (notificationId: string): Promise<void> => {
    return apiCall(`/notifications/${notificationId}/read`, { method: 'PUT' });
  },

  markAllAsRead: async (userId: string): Promise<void> => {
    return apiCall(`/notifications/${userId}/read-all`, { method: 'PUT' });
  },
};

// ==================== DRIVER API ====================

export interface Driver {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  vehicle_type: string;
  vehicle_plate: string;
  status: 'available' | 'on_delivery' | 'offline';
  current_location?: { lat: number; lng: number };
  rating: number;
  total_deliveries: number;
  created_at: string;
}

export interface DriverStats {
  driver: Driver;
  total_deliveries: number;
  active_deliveries: number;
  total_earnings: number;
  rating: number;
}

export interface Delivery {
  id: string;
  order_id: string;
  driver_id: string;
  driver_name: string;
  driver_phone: string;
  status: string;
  pickup_location: { lat: number; lng: number };
  delivery_location: { address: string };
  picked_up_at?: string;
  delivered_at?: string;
  created_at: string;
  order?: {
    id: string;
    total: number;
    items_count: number;
    customer_name: string;
    customer_phone: string;
    delivery_address: DeliveryAddress;
  };
}

export interface AvailableDelivery {
  order_id: string;
  total: number;
  items_count: number;
  customer_name: string;
  delivery_address: DeliveryAddress;
  created_at: string;
}

export const driverApi = {
  register: async (userId: string, name: string, phone: string, vehicleType: string, vehiclePlate: string): Promise<Driver> => {
    const params = new URLSearchParams({
      user_id: userId,
      name,
      phone,
      vehicle_type: vehicleType,
      vehicle_plate: vehiclePlate,
    });
    return apiCall<Driver>(`/drivers/register?${params}`, { method: 'POST' });
  },

  getDriver: async (driverId: string): Promise<Driver> => {
    return apiCall<Driver>(`/drivers/${driverId}`);
  },

  getStats: async (driverId: string): Promise<DriverStats> => {
    return apiCall<DriverStats>(`/drivers/${driverId}/stats`);
  },

  getDeliveries: async (driverId: string, status?: string): Promise<Delivery[]> => {
    const params = status ? `?status=${status}` : '';
    return apiCall<Delivery[]>(`/drivers/${driverId}/deliveries${params}`);
  },

  getAvailableDeliveries: async (): Promise<AvailableDelivery[]> => {
    return apiCall<AvailableDelivery[]>('/drivers/available-deliveries');
  },

  acceptDelivery: async (driverId: string, orderId: string): Promise<{ message: string; delivery_id: string }> => {
    return apiCall(`/drivers/${driverId}/accept-delivery/${orderId}`, { method: 'POST' });
  },

  updateDeliveryStatus: async (driverId: string, deliveryId: string, status: string): Promise<{ message: string }> => {
    return apiCall(`/drivers/${driverId}/delivery/${deliveryId}/status?status=${status}`, { method: 'PUT' });
  },

  updateLocation: async (driverId: string, latitude: number, longitude: number): Promise<{ message: string }> => {
    return apiCall(`/drivers/${driverId}/location`, {
      method: 'PUT',
      body: JSON.stringify({ latitude, longitude }),
    });
  },
};

// ==================== REVIEWS API ====================

export interface Review {
  id: string;
  user_id: string;
  user_name: string;
  product_id?: string;
  farm_id?: string;
  order_id?: string;
  rating: number;
  comment: string;
  images: string[];
  created_at: string;
}

export interface ReviewsResponse {
  reviews: Review[];
  total: number;
  average_rating: number;
  distribution?: Record<number, number>;
}

export const reviewApi = {
  createReview: async (userId: string, userName: string, review: {
    product_id?: string;
    farm_id?: string;
    order_id?: string;
    rating: number;
    comment: string;
    images?: string[];
  }): Promise<Review> => {
    const params = new URLSearchParams({ user_id: userId, user_name: userName });
    return apiCall<Review>(`/reviews?${params}`, {
      method: 'POST',
      body: JSON.stringify(review),
    });
  },

  getProductReviews: async (productId: string, skip?: number, limit?: number): Promise<ReviewsResponse> => {
    const params = new URLSearchParams();
    if (skip !== undefined) params.set('skip', String(skip));
    if (limit !== undefined) params.set('limit', String(limit));
    const query = params.toString();
    return apiCall<ReviewsResponse>(`/reviews/product/${productId}${query ? `?${query}` : ''}`);
  },

  getFarmReviews: async (farmId: string, skip?: number, limit?: number): Promise<ReviewsResponse> => {
    const params = new URLSearchParams();
    if (skip !== undefined) params.set('skip', String(skip));
    if (limit !== undefined) params.set('limit', String(limit));
    const query = params.toString();
    return apiCall<ReviewsResponse>(`/reviews/farm/${farmId}${query ? `?${query}` : ''}`);
  },
};

// ==================== COUPON API ====================

export interface Coupon {
  id: string;
  code: string;
  coupon_type: 'percentage' | 'fixed' | 'free_delivery';
  value: number;
  min_order: number;
  max_discount?: number;
  usage_limit?: number;
  used_count: number;
  valid_until?: string;
  is_active: boolean;
  description: string;
  created_at: string;
}

export interface CouponValidation {
  valid: boolean;
  code: string;
  coupon_type: string;
  discount: number;
  description: string;
  message: string;
}

export const couponApi = {
  validate: async (code: string, subtotal: number): Promise<CouponValidation> => {
    return apiCall<CouponValidation>('/coupons/validate', {
      method: 'POST',
      body: JSON.stringify({ code, subtotal }),
    });
  },

  apply: async (code: string): Promise<{ message: string }> => {
    return apiCall(`/coupons/apply?code=${encodeURIComponent(code)}`, { method: 'POST' });
  },

  getAll: async (): Promise<Coupon[]> => {
    return apiCall<Coupon[]>('/coupons');
  },

  create: async (coupon: Omit<Coupon, 'id' | 'used_count' | 'created_at'>): Promise<Coupon> => {
    return apiCall<Coupon>('/coupons', {
      method: 'POST',
      body: JSON.stringify(coupon),
    });
  },

  delete: async (couponId: string): Promise<void> => {
    return apiCall(`/coupons/${couponId}`, { method: 'DELETE' });
  },
};

// ==================== ANALYTICS API ====================

export interface AnalyticsOverview {
  total_revenue: number;
  total_orders: number;
  monthly_revenue: number;
  monthly_orders: number;
  weekly_revenue: number;
  weekly_orders: number;
  average_order_value: number;
  total_products: number;
  total_farms: number;
  total_drivers: number;
}

export interface RevenueChartData {
  date: string;
  revenue: number;
  orders: number;
}

export interface TopProduct {
  _id: string;
  product_name: string;
  farm_name: string;
  total_quantity: number;
  total_revenue: number;
}

export interface TopFarm {
  _id: string;
  total_orders: number;
  total_revenue: number;
  total_items: number;
}

export const analyticsApi = {
  getOverview: async (): Promise<AnalyticsOverview> => {
    return apiCall<AnalyticsOverview>('/analytics/overview');
  },

  getRevenueChart: async (days?: number): Promise<RevenueChartData[]> => {
    const params = days ? `?days=${days}` : '';
    return apiCall<RevenueChartData[]>(`/analytics/revenue-chart${params}`);
  },

  getTopProducts: async (limit?: number): Promise<TopProduct[]> => {
    const params = limit ? `?limit=${limit}` : '';
    return apiCall<TopProduct[]>(`/analytics/top-products${params}`);
  },

  getTopFarms: async (limit?: number): Promise<TopFarm[]> => {
    const params = limit ? `?limit=${limit}` : '';
    return apiCall<TopFarm[]>(`/analytics/top-farms${params}`);
  },

  getOrderStatusDistribution: async (): Promise<Record<string, number>> => {
    return apiCall<Record<string, number>>('/analytics/order-status-distribution');
  },
};

// ==================== EMAIL API (MOCK) ====================

export interface Email {
  id: string;
  to_email: string;
  subject: string;
  body: string;
  template: string;
  status: string;
  sent_at?: string;
  created_at: string;
}

export const emailApi = {
  getSentEmails: async (limit?: number): Promise<Email[]> => {
    const params = limit ? `?limit=${limit}` : '';
    return apiCall<Email[]>(`/emails${params}`);
  },

  sendTestEmail: async (toEmail: string, template?: string): Promise<{ message: string; email_id: string }> => {
    const params = new URLSearchParams({ to_email: toEmail });
    if (template) params.set('template', template);
    return apiCall(`/emails/send-test?${params}`, { method: 'POST' });
  },
};

// ==================== UPLOADS ====================

export interface UploadResult {
  filename: string;
  url: string;
  size: number;
  content_type: string;
}

export const uploadApi = {
  uploadImage: async (file: File): Promise<UploadResult> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(`${API_URL}/api/uploads/image`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.detail || 'Upload failed');
    }
    return response.json();
  },

  uploadMultipleImages: async (files: File[]): Promise<{ uploaded: UploadResult[]; count: number }> => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    const response = await fetch(`${API_URL}/api/uploads/images`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.detail || 'Upload failed');
    }
    return response.json();
  },

  getImageUrl: (url: string): string => {
    if (url.startsWith('http')) return url;
    return `${API_URL}${url}`;
  },
};

