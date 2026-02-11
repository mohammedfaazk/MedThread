import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../lib/api.refactored';

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  verified?: boolean;
  avatar?: string;
  specialty?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Async actions
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    username: string;
    password: string;
    role: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  fetchCurrentUser: () => Promise<void>;
  
  // Computed
  isAuthenticated: () => boolean;
  isDoctor: () => boolean;
  isPatient: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      setUser: (user) => set({ user, error: null }),
      setToken: (token) => set({ token }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error, isLoading: false }),

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const result = await api.login({ email, password });
          set({
            user: result.user,
            token: result.token,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          set({
            error: error.message || 'Login failed',
            isLoading: false,
          });
          throw error;
        }
      },

      register: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const result = await api.register(data);
          set({
            user: result.user,
            token: result.token,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          set({
            error: error.message || 'Registration failed',
            isLoading: false,
          });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await api.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          set({
            user: null,
            token: null,
            isLoading: false,
            error: null,
          });
        }
      },

      fetchCurrentUser: async () => {
        const { token } = get();
        if (!token) return;

        set({ isLoading: true });
        try {
          const user = await api.getCurrentUser();
          set({ user, isLoading: false, error: null });
        } catch (error: any) {
          set({
            error: error.message || 'Failed to fetch user',
            isLoading: false,
          });
          // Clear invalid token
          if (error.message?.includes('token') || error.message?.includes('auth')) {
            set({ user: null, token: null });
          }
        }
      },

      isAuthenticated: () => {
        const { token, user } = get();
        return !!(token && user);
      },

      isDoctor: () => {
        const { user } = get();
        return user?.role === 'VERIFIED_DOCTOR';
      },

      isPatient: () => {
        const { user } = get();
        return user?.role === 'PATIENT';
      },
    }),
    {
      name: 'medthread-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
    }
  )
);
