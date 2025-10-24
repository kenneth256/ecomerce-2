import { API_ROUTES } from '@/lib/api';
import axios from 'axios';
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

// Add token to all requests
axio.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const useAuthStore = create<AuthStore>(
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
          return response.data?.user?.id;
        } catch (error) {
          set({
            loading: false,
            error: axios.isAxiosError(error) 
              ? error?.response?.data?.error || "Registration Failed!" 
              : "Registration Failed"
          });
          return null;
        }
      },
      
      login: async (email: string, password: string) => {
        set({ loading: true, error: null });
        try {
          const response = await axio.post('/login', {
            email, password
          });
          
          
          
          set({ loading: false, user: response.data.user });
          console.log('Logged in user:', response.data.user);
          return true;
        } catch (error) {
          if (axios.isAxiosError(error)) {
            console.error('Error response:', error.response?.data);
            console.error('Error status:', error.response?.status); 
          }
          
          set({
            loading: false,
            error: axios.isAxiosError(error)
              ? error?.response?.data?.error || "Failed to log in"
              : "Failed to login"
          });
          return false;
        }
      },
      
      logout: async () => {
        set({ loading: true, error: null });
        console.log('Logging out!')
        try {
          await axio.post('/logout');
        set({ user: null, loading: false });
        } catch (error) {
         
          set({ 
            user: null,
            loading: false,
            error: axios.isAxiosError(error)
              ? error?.response?.data?.error || "Logout failed"
              : "Logout failed"
          });
        }
      },
      
      refreshAccessToken: async () => {
        try {
          const response = await axio.post('/refresh');
        
          
          set({ user: response.data.user });
          return true;
        } catch (error) {
          set({ user: null });
          return false;
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user })
    }
  ) as any
);