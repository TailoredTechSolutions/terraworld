import api from './api';

export interface Address {
  _id: string;
  user_id: string;
  type: 'delivery' | 'billing' | 'pickup';
  label: string;
  is_default: boolean;
  contact_name: string;
  contact_phone: string;
  street_address: string;
  barangay: string;
  city: string;
  province: string;
  postal_code: string;
  country: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  delivery_instructions?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateAddressData {
  type?: 'delivery' | 'billing' | 'pickup';
  label: string;
  is_default?: boolean;
  contact_name: string;
  contact_phone: string;
  street_address: string;
  barangay: string;
  city: string;
  province: string;
  postal_code: string;
  country?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  delivery_instructions?: string;
}

export const addressService = {
  getAddresses: async (): Promise<Address[]> => {
    const response = await api.get('/users/addresses');
    return response.data;
  },

  getAddress: async (addressId: string): Promise<Address> => {
    const response = await api.get(`/users/addresses/${addressId}`);
    return response.data;
  },

  createAddress: async (data: CreateAddressData): Promise<Address> => {
    const response = await api.post('/users/addresses', data);
    return response.data;
  },

  updateAddress: async (addressId: string, data: Partial<CreateAddressData>): Promise<Address> => {
    const response = await api.put(`/users/addresses/${addressId}`, data);
    return response.data;
  },

  deleteAddress: async (addressId: string): Promise<void> => {
    await api.delete(`/users/addresses/${addressId}`);
  },

  setDefaultAddress: async (addressId: string): Promise<Address> => {
    const response = await api.put(`/users/addresses/${addressId}`, { is_default: true });
    return response.data;
  },
};
