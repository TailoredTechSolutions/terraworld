import { create } from 'zustand';
import { authService, User, LoginCredentials, RegisterData } from '../services/authService';
import { setToken, setRefreshToken, setUser, removeToken, getToken, getUser } from '../utils/storage';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  login: async (credentials) => {
    try {
      const response = await authService.login(credentials);
      await setToken(response.access_token);
      await setRefreshToken(response.refresh_token);
      await setUser(response.user);
      set({ user: response.user, isAuthenticated: true });
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  register: async (data) => {
    try {
      const response = await authService.register(data);
      await setToken(response.access_token);
      await setRefreshToken(response.refresh_token);
      await setUser(response.user);
      set({ user: response.user, isAuthenticated: true });
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  },

  logout: async () => {
    try {
      await removeToken();
      set({ user: null, isAuthenticated: false });
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  loadUser: async () => {
    try {
      const token = await getToken();
      const savedUser = await getUser();
      
      if (token && savedUser) {
        // Optionally verify token is still valid
        try {
          const currentUser = await authService.getCurrentUser();
          await setUser(currentUser);
          set({ user: currentUser, isAuthenticated: true, isLoading: false });
        } catch (error) {
          // Token invalid, clear storage
          await removeToken();
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    } catch (error) {
      console.error('Load user error:', error);
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
