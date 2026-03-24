import api from './api';

export interface Product {
  _id: string;
  name: string;
  description: string;
  base_price: number;
  unit: string;
  stock_quantity: number;
  images: Array<{
    url: string;
    is_primary: boolean;
  }>;
  category_id: string;
  farmer_id: string;
  availability: {
    status: string;
  };
  stats: {
    rating: number;
    reviews: number;
  };
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  image_url?: string;
}

export const productService = {
  getProducts: async (params?: {
    category_id?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await api.get('/products', { params });
    return response.data;
  },

  getProduct: async (id: string): Promise<Product> => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  getCategories: async (): Promise<Category[]> => {
    const response = await api.get('/products/categories/all');
    return response.data;
  },

  // Farmer endpoints
  createProduct: async (data: any) => {
    const response = await api.post('/products', data);
    return response.data;
  },

  getMyProducts: async (page = 1, limit = 20) => {
    const response = await api.get('/products/my-products', {
      params: { page, limit },
    });
    return response.data;
  },

  updateProduct: async (id: string, data: any) => {
    const response = await api.put(`/products/${id}`, data);
    return response.data;
  },

  deleteProduct: async (id: string) => {
    await api.delete(`/products/${id}`);
  },
};
