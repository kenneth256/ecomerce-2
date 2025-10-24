import { API_ROUTES } from "@/lib/api";
import axios from "axios";
import { create } from "zustand";

type IsFeatured = {
    id?: string;
    imageUrl: string;
}

type FeaturedProduct = {
    id?: string;
    name: string;
    price: string;
    images: string[];
}

interface SettingStore {
    banners: IsFeatured[];
    isLoading: boolean;
    featuredProducts: FeaturedProduct[];
    error: string | null;
    hasFetchedBanners: boolean;
    hasFetchedProducts: boolean;
    fetchbanners: () => Promise<void>;
    updateFeaturedProducts: (ids: string[]) => Promise<boolean>;
    fetchFeaturedProducts: () => Promise<void>;
    addBanner: (files: File[]) => Promise<boolean>;
}

export const useSettingStore = create<SettingStore>()((set, get) => ({
  banners: [],
  featuredProducts: [],
  error: null,
  isLoading: false,
  hasFetchedBanners: false,
  hasFetchedProducts: false,
  
  addBanner: async (files: File[]) => {
    set({ isLoading: true, error: null });
    try {
        const formData = new FormData();
        files.forEach((file) => formData.append('images', file));
        
        const response = await axios.post(
            `${API_ROUTES.SETTINGS}/createbanner`, 
            formData, 
            { withCredentials: true }
        );
        
        if (response.data.success) {
            set({ hasFetchedBanners: false });
            await get().fetchbanners();
        }
        
        return response.data.success;
    } catch (error: any) {
        const errorMessage = error.response?.data?.message || 'Failed to add banner';
        set({ error: errorMessage });
        return false;
    } finally {
        set({ isLoading: false });
    }
  },
  
  fetchbanners: async () => {
    if (get().hasFetchedBanners) {
      console.log('❌ BLOCKED: Banners already fetched');
      return;
    }
    
    console.log('✅ Fetching banners for the first time');
    
    set({ hasFetchedBanners: true, isLoading: true, error: null });
    try {
        const response = await axios.get(`${API_ROUTES.SETTINGS}/banners`);
        
        if (!response.data.success) {
            set({ error: "Failed getting banners", hasFetchedBanners: false });
            return;
        }
        console.log('✅ Banners loaded:', response.data.banners.length);
        set({ banners: response.data.banners });
    } catch (error: any) {
        const errorMessage = error.response?.data?.message || 'Failed to fetch banners';
        set({ error: errorMessage, hasFetchedBanners: false });
    } finally {
        set({ isLoading: false });
    }
  },
  
  fetchFeaturedProducts: async () => {
    if (get().hasFetchedProducts) {
      console.log('❌ BLOCKED: Products already fetched');
      return;
    }
    
    console.log('✅ Fetching products for the first time');
    
    set({ hasFetchedProducts: true, isLoading: true, error: null });
    try {
        const response = await axios.get(`${API_ROUTES.SETTINGS}/featuredProducts`);
        
        if (!response.data.featuredProducts) {
            set({ error: "No featured products found", hasFetchedProducts: false });
            return;
        }
        console.log('✅ Products loaded:', response.data.featuredProducts.length);
        set({ featuredProducts: response.data.featuredProducts });
    } catch (error: any) {
        const errorMessage = error.response?.data?.message || 'Failed to fetch featured products';
        set({ error: errorMessage, hasFetchedProducts: false });
    } finally {
        set({ isLoading: false });
    }
  },
  
  updateFeaturedProducts: async (ids: string[]) => {
    set({ isLoading: true, error: null });
    try {
        const response = await axios.put(
            `${API_ROUTES.SETTINGS}/updateFeaturedProducts`,
            { ids }, 
            { withCredentials: true }
        );
        
        if (!response.data.success) {
            set({ error: "Failed to update featured products" });
            return false;
        }
        
        set({ hasFetchedProducts: false });
        await get().fetchFeaturedProducts();
        
        return true;
    } catch (error: any) {
        const errorMessage = error.response?.data?.message || 'Failed to update featured products';
        set({ error: errorMessage });
        return false;
    } finally {
        set({ isLoading: false });
    }
  }
}));