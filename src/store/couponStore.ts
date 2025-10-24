import { API_ROUTES } from '@/lib/api';
import axios from 'axios';
import { toast } from 'sonner';
import { create } from 'zustand';

export interface Coupon {
  id?: string;
  code?: string;
  percentage?: number;
  startDate?: string;
  endDate?: string;
  usageLimit?: number;
  usageCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface CouponStore {
  coupons: Coupon[];
  isLoading: boolean;
  error: string | null;
  fetchCoupons: () => Promise<void>;
  deleteCoupon: (id: string) => Promise<boolean>;
  createCoupon: (coupon: Omit<Coupon, 'id' | 'usageCount'>) => Promise<Coupon | null>;
}

export const useCouponStore = create<CouponStore>((set, get) => ({
  isLoading: false,
  coupons: [],
  error: null,

  fetchCoupons: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_ROUTES.COUPONS}/availableCoupons`);
      set({ coupons: response.data.data, isLoading: false });
      toast.success('Coupons fetched!')
    } catch (error: any) {
      console.error('Error fetching coupons:', error);
      set({ 
        isLoading: false, 
        error: error.response?.data?.message || 'Failed fetching coupons' 
      });
      toast.error(error)
    }
  },

  deleteCoupon: async (id: string): Promise<boolean> => {
    set({ isLoading: true, error: null });
    try {
      await axios.delete(`${API_ROUTES.COUPONS}/deleteCoupon/${id}`);
      
      const currentCoupons = get().coupons;
      set({ 
        coupons: currentCoupons.filter(coupon => coupon.id !== id),
        isLoading: false 
      });
      
      toast.success('Coupon deleted successfully!');
      return true;
    } catch (error: any) {
      console.error('Error deleting coupon:', error);
      set({
        error: error.response?.data?.message || error.message,
        isLoading: false
      });
      toast.error('Failed to delete coupon');
      return false;
    }
  },

  createCoupon: async (coupon): Promise<Coupon | null> => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(
        `${API_ROUTES.COUPONS}/createCoupon`, 
        coupon, 
        { withCredentials: true }
      );
      
      const newCoupon = response.data.data;
      
      // Update state by adding the new coupon
      const currentCoupons = get().coupons;
      set({ 
        coupons: [...currentCoupons, newCoupon],
        isLoading: false 
      });
      
      toast.success('Coupon created successfully!');
      return newCoupon;
    } catch (error: any) {
      console.error('Error creating coupon:', error);
      set({ 
        isLoading: false, 
        error: error.response?.data?.message || 'Failed to create coupon' 
      });
      toast.error('Failed to create coupon');
      return null;
    }
  }
}));