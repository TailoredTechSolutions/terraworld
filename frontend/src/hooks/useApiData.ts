import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  productApi, 
  farmApi, 
  cartApi, 
  orderApi, 
  categoryApi,
  Product,
  Farm,
  Cart,
  Order,
  DeliveryAddress
} from '@/services/api';
import { useAuth } from '@/hooks/useAuth';

// ==================== PRODUCT HOOKS ====================

export function useProducts(params?: {
  category?: string;
  farm_id?: string;
  organic?: boolean;
  search?: string;
  min_price?: number;
  max_price?: number;
}) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => productApi.getAll(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => productApi.getById(id),
    enabled: !!id,
  });
}

// ==================== FARM HOOKS ====================

export function useFarms(params?: {
  category?: string;
  organic_certified?: boolean;
  delivery_available?: boolean;
  municipality?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: ['farms', params],
    queryFn: () => farmApi.getAll(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useFarm(id: string) {
  return useQuery({
    queryKey: ['farm', id],
    queryFn: () => farmApi.getById(id),
    enabled: !!id,
  });
}

export function useFarmProducts(farmId: string) {
  return useQuery({
    queryKey: ['farm-products', farmId],
    queryFn: () => farmApi.getProducts(farmId),
    enabled: !!farmId,
  });
}

// ==================== CATEGORY HOOKS ====================

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryApi.getAll(),
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

// ==================== CART HOOKS ====================

export function useCart() {
  const { user } = useAuth();
  const userId = user?.id || 'guest';
  
  return useQuery({
    queryKey: ['cart', userId],
    queryFn: () => cartApi.get(userId),
    enabled: !!userId,
    staleTime: 1000 * 60, // 1 minute
  });
}

export function useAddToCart() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.id || 'guest';
  
  return useMutation({
    mutationFn: ({ productId, quantity }: { productId: string; quantity?: number }) =>
      cartApi.addItem(userId, productId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart', userId] });
    },
  });
}

export function useUpdateCartItem() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.id || 'guest';
  
  return useMutation({
    mutationFn: ({ productId, quantity }: { productId: string; quantity: number }) =>
      cartApi.updateItem(userId, productId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart', userId] });
    },
  });
}

export function useRemoveFromCart() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.id || 'guest';
  
  return useMutation({
    mutationFn: (productId: string) => cartApi.removeItem(userId, productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart', userId] });
    },
  });
}

export function useClearCart() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.id || 'guest';
  
  return useMutation({
    mutationFn: () => cartApi.clear(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart', userId] });
    },
  });
}

// ==================== ORDER HOOKS ====================

export function useOrders() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['orders', user?.id],
    queryFn: () => orderApi.getUserOrders(user!.id),
    enabled: !!user?.id,
  });
}

export function useOrder(orderId: string) {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: () => orderApi.getById(orderId),
    enabled: !!orderId,
  });
}

export function useCreateOrder() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.id || 'guest';
  
  return useMutation({
    mutationFn: (data: {
      delivery_address: DeliveryAddress;
      payment_method: Order['payment_method'];
      notes?: string;
    }) => orderApi.create({
      user_id: userId,
      ...data,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart', userId] });
      queryClient.invalidateQueries({ queryKey: ['orders', userId] });
    },
  });
}

export function useCancelOrder() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (orderId: string) => orderApi.cancel(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['order'] });
    },
  });
}

// ==================== ADMIN HOOKS ====================

import { adminApi, farmerApi, AdminStats, FarmerStats, FarmerOrder } from '@/services/api';

export function useAdminStats() {
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminApi.getStats(),
    staleTime: 1000 * 30, // 30 seconds
  });
}

export function useAdminOrders(params?: { status?: string }) {
  return useQuery({
    queryKey: ['admin-orders', params],
    queryFn: () => adminApi.getAllOrders(params),
    staleTime: 1000 * 30, // 30 seconds
  });
}

export function useAdminUpdateOrderStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: Order['order_status'] }) =>
      adminApi.updateOrderStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
    },
  });
}

// ==================== FARMER HOOKS ====================

export function useFarmerStats(farmId: string) {
  return useQuery({
    queryKey: ['farmer-stats', farmId],
    queryFn: () => farmerApi.getStats(farmId),
    enabled: !!farmId,
  });
}

export function useFarmerProducts(farmId: string) {
  return useQuery({
    queryKey: ['farmer-products', farmId],
    queryFn: () => farmerApi.getProducts(farmId),
    enabled: !!farmId,
  });
}

export function useFarmerOrders(farmId: string) {
  return useQuery({
    queryKey: ['farmer-orders', farmId],
    queryFn: () => farmerApi.getOrders(farmId),
    enabled: !!farmId,
  });
}

export function useAddFarmerProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ farmId, product }: { farmId: string; product: Omit<Product, 'id' | 'farm_id' | 'farm_name' | 'created_at' | 'updated_at'> }) =>
      farmerApi.addProduct(farmId, product),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['farmer-products', variables.farmId] });
      queryClient.invalidateQueries({ queryKey: ['farmer-stats', variables.farmId] });
    },
  });
}

export function useUpdateFarmerProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ farmId, productId, product }: { farmId: string; productId: string; product: Partial<Product> }) =>
      farmerApi.updateProduct(farmId, productId, product),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['farmer-products', variables.farmId] });
    },
  });
}

export function useDeleteFarmerProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ farmId, productId }: { farmId: string; productId: string }) =>
      farmerApi.deleteProduct(farmId, productId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['farmer-products', variables.farmId] });
      queryClient.invalidateQueries({ queryKey: ['farmer-stats', variables.farmId] });
    },
  });
}
