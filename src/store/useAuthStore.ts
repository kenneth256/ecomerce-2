// store/useAuthStore.ts

import { API_ROUTES } from '@/lib/api';
import axios from 'axios';
import { toast } from 'sonner';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type User = {
  name: string;
  email: string | null;
  id: string;
  role: "USER" | "SUPER_ADMIN";
}

type AuthStore = {
  user: User | null;
  loading: boolean;
  error: string | null;
  register: (name: string, email: string, password: string) => Promise<string | null>;
  logout: () => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  refreshAccessToken: () => Promise<boolean>;
}

const axio = axios.create({
  baseURL: API_ROUTES.AUTH,
  withCredentials: true
});

axio.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      error: null,
      loading: false,

      register: async (name: string, email: string, password: string) => {
        set({ loading: true, error: null });
        try {
          const response = await axio.post('/register', {
            name, email, password
          });
          set({ loading: false });
          toast.success('Registration successful');
          return response.data?.user?.id;
        } catch (error) {
          const msg = axios.isAxiosError(error)
            ? error?.response?.data?.error || "Registration Failed!"
            : "Registration Failed";
          set({
            loading: false,
            error: msg
          });
          toast.error(msg);
          return null;
        }
      },

      login: async (email: string, password: string) => {
        set({ loading: true, error: null });
        try {
          const response = await axio.post('/login', {
            email, password
          });

          console.log('✅ [STORE] Login successful');
          console.log('👤 [STORE] User:', response.data.user);
          console.log('👤 [STORE] Role:', response.data.user?.role);

          // Set user in state
          set({ loading: false, user: response.data.user });
          
          toast.success('Logged in successfully');

          // CRITICAL FIX: Force full page reload to trigger middleware
          // Small delay to ensure state is persisted and toast is shown
          setTimeout(() => {
            const role = response.data.user?.role;
            const redirectUrl = role === 'SUPER_ADMIN' ? '/dashboard' : '/';
            console.log('🔄 [STORE] Redirecting to:', redirectUrl);
            window.location.href = redirectUrl; // ✅ Full page reload
          }, 200);

          return true;
        } catch (error) {
          const msg = axios.isAxiosError(error)
            ? error?.response?.data?.error || "Failed to log in"
            : "Failed to login";
          if (axios.isAxiosError(error)) {
            console.error('❌ [STORE] Error response:', error.response?.data);
            console.error('❌ [STORE] Error status:', error.response?.status);
          }
          set({
            loading: false,
            error: msg
          });
          toast.error(msg);
          return false;
        }
      },

      logout: async () => {
        set({ loading: true, error: null });
        console.log('🚪 [STORE] Logging out!');
        try {
          await axio.post('/logout');
          set({ user: null, loading: false });
          toast.success('Logged out successfully');
          
          // Force full page reload to clear everything
          setTimeout(() => {
            window.location.href = '/auth/login';
          }, 200);
        } catch (error) {
          const msg = axios.isAxiosError(error)
            ? error?.response?.data?.error || "Logout failed"
            : "Logout failed";
          set({
            user: null,
            loading: false,
            error: msg
          });
          toast.error(msg);
        }
      },

      refreshAccessToken: async () => {
        try {
          const response = await axio.post('/refresh');
          set({ user: response.data.user });
          toast.success('Session refreshed');
          return true;
        } catch (error) {
          set({ user: null });
          const msg = axios.isAxiosError(error)
            ? error?.response?.data?.error || "Failed to refresh session"
            : "Failed to refresh session";
          toast.error(msg);
          return false;
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user })
    }
  )
);