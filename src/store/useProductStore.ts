import { API_ROUTES } from "@/lib/api";
import axios from "axios";
import { toast } from "sonner";
import { create } from "zustand";
import { persist } from 'zustand/middleware';

export interface Product {
  id: string;
  name: string;
  price: number;
  categoryId: string; 
  category: {         
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
  };
  description: string;
  stock: number;
  brand: string;
  color?: string[] | null;
  soldCount?: number;
  sizes?: string[] | null;
  gender?: string | null;
  rating?: number | null;
  images: string[];
  isFeatured?: boolean | null;
  createdAt: string;
  updatedAt: string;
}

interface Category {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

interface FilterProductsParams {
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  page?: number
  minPrice?: number
  maxPrice?: number
  limit?: number
  sizes?: string[]
  category?: string[]
  brands?: string[]
}

interface ProductState {
  products: Product[];
  categories: Category[];
  isLoading: boolean;
  totalPages?: number;
  totalProducts?: number;
  currentPage?: number;
  error: string | null;
  filterProducts: Product[];
  fetchAllProducts: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  createProduct: (product: FormData) => Promise<Product>;
  createCategory: (name: string) => Promise<Category>;
  deleteProduct: (id: string) => Promise<void>;
  updateProduct: (id: string, product: FormData) => Promise<void>;
  getProductById: (id: string) => Promise<Product | null>; 
  fetchFilterProducts: (params: FilterProductsParams) => Promise<void>;
  getCurrentPage: (page: number) => void
}

const axio = axios.create({
  baseURL: API_ROUTES.PRODUCTS,
  withCredentials: true
});

export const useProductStore = create<ProductState>()(
  persist(
    (set, get) => ({
      products: [],
      categories: [], 
      error: null,
      isLoading: false,
      filterProducts: [],
      fetchAllProducts: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await axio.get('/products');
          set({ products: response.data, isLoading: false });
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Failed to fetch products';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
        }
      },

      createProduct: async (product: FormData) => {
        set({ isLoading: true, error: null });
        console.log('creating!')
        try {
          const response = await axio.post('/products', product);
          
          set((state) => ({
            products: [...state.products, response.data.product],
            isLoading: false
          }));
          
          toast.success('Product created successfully');
          return response.data.product;
          
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || error.message || 'Failed to create product';
          
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          throw new Error(errorMessage);
        }
      },

      deleteProduct: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          await axio.delete(`/products/${id}`);
          
         
          set((state) => ({
            products: state.products.filter(p => p.id !== id),
            isLoading: false
          }));
          
          toast.success('Product deleted successfully');
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Failed to delete product';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
        }
      },

      updateProduct: async (id: string, product: FormData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axio.put(`/products/${id}`, product, {
            headers: {
              'Content-Type': 'multipart/form-data' 
            }
          });
          
          
          set((state) => ({
            products: state.products.map(p => 
              p.id === id ? response.data.product : p
            ),
            isLoading: false
          }));
          
          toast.success('Product updated successfully');
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Failed to update product';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          throw new Error(errorMessage);
        }
      },

      getProductById: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axio.get(`/products/${id}`);
          set({ isLoading: false });
          return response.data; 
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Failed to get product';
          set({ isLoading: false, error: errorMessage });
          toast.error(errorMessage);
          return null;
        }
      },

      createCategory: async (name: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axio.post('/categories', 
            { name },
            {
              headers: {
                'Content-Type': 'application/json'
              }
            }
          );
          
          
          set((state) => ({
            categories: [...state.categories, response.data],
            isLoading: false
          }));
          
          toast.success('Category created successfully');
          return response.data;
          
        } catch (error: any) {
          const errorMessage = error.response?.data?.error || 'Failed to create category';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      fetchCategories: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await axio.get('/categories');
          set({ categories: response.data, isLoading: false });
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Failed to fetch categories';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
        }
      },
fetchFilterProducts: async(params) => {
  set({ isLoading: true, error: null })
  
  try {
    // Build query params properly
    const queryParams = new URLSearchParams()
    
    if (params.sortBy) queryParams.append('sortBy', params.sortBy)
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder)
    if (params.page) queryParams.append('page', params.page.toString())
    if (params.limit) queryParams.append('limit', params.limit.toString())
    if (params.minPrice !== undefined) queryParams.append('minPrice', params.minPrice.toString())
    if (params.maxPrice !== undefined) queryParams.append('maxPrice', params.maxPrice.toString())
    if (params.category?.length) queryParams.append('category', params.category.join(','))  // ✅ 'category' not 'categories'
    if (params.brands?.length) queryParams.append('brands', params.brands.join(','))
    if (params.sizes?.length) queryParams.append('sizes', params.sizes.join(','))
    
    const response = await axios.get(
      `${API_ROUTES.PRODUCTS}/products/filtered?${queryParams}`,
      { withCredentials: true }
    )
    
    console.log('response', response.data.data)
    set({
      isLoading: false,
      totalProducts: response.data.pagination.totalProducts,     
      totalPages: response.data.pagination.totalPages,       
      filterProducts: response.data.data
    })
    console.log(response.data.data)
    toast.success('Filtered products fetched!')
    
  } catch (error) {
    console.error('Fetch error:', error) 
    set({ error: 'Failed to fetch filtered products', isLoading: false })
    toast.error('Failed to fetch products')
  }
},
      getCurrentPage: (page: number) => set({currentPage: page})
      
    }),
    {
      name: 'product-storage'
    }
  )
);