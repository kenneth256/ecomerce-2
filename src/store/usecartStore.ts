import { API_ROUTES } from "@/lib/api";
import axios from "axios";
import debounce from "lodash.debounce";
import { create } from "zustand";


const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': token ? `Bearer ${token}` : '',
    'Content-Type': 'application/json'
  };
};




export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  category: string | '',
  color?: string | null;
  size?: string | null;
  quantity: number;
}

export interface CartStore {
  cartItems: CartItem[];
  isLoading: boolean;
  error: string | null;
  fetchCart: () => Promise<void>;
  addToCart: (item: {
    productID: string;
    quantity: number;
    color?: string;
    size?: string;
  }) => Promise<void>;
  removeFromCart: (id: string) => Promise<void>;
  updateCart: (id: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
}

export const useCartStore = create<CartStore>((set, get) => {
  const debounceCartQuantity = debounce(
    async (id: string, quantity: number) => {
      try {
        await axios.post(
          `${API_ROUTES.CART}/updatecart/${id}`, 
          { quantity }, 
          { 
            headers: getAuthHeaders(),
            withCredentials: true 
          }
        );
      } catch (error: any) {
        console.error('Update cart error:', error.response?.data);
        
        
        
        set({ 
          error: error.response?.data?.message || 'Failed to update cart!' 
        });
      }
    },
    500
  );

  return {
    cartItems: [],
    isLoading: false,
    error: null,
    
    fetchCart: async () => {
      set({ isLoading: true, error: null });
      try {

        const response = await axios.get(`${API_ROUTES.CART}/cart`, {
          headers: getAuthHeaders(),
          withCredentials: true
        });
        
        if (!response.data || !response.data.data) {
          set({ isLoading: false, cartItems: [] });
          return;
        }
        
        set({ 
          isLoading: false, 
          cartItems: response.data.data
        });
      } catch (error: any) {
        console.error('Fetch cart error:', error.response?.data);
        
        
        
        set({ 
          isLoading: false, 
          error: error.response?.data?.message || "Failed to fetch cart",
          cartItems: []
        });
      }
    },
    
    addToCart: async (item) => {
      set({ isLoading: true, error: null });
      try {
        const sanitizedItem = {
          ...item,
          color: item.color || "",  // Send empty string instead of null
          size: item.size || "",     // Send empty string instead of null
        };

        const response = await axios.post(
          `${API_ROUTES.CART}/addToCart`, 
          sanitizedItem, 
          { 
            headers: getAuthHeaders(),
            withCredentials: true 
          }
        );
        
        console.log('Add to cart response:', response.data);
        
        if (!response.data.success || !response.data.data) {
          throw new Error('Invalid response from server');
        }
        
        set((state) => {
          const newCartItem = response.data.data;
          
          // Check if this cart item already exists in state (by cart item ID)
          const existingIndex = state.cartItems.findIndex(
            cartItem => cartItem.id === newCartItem.id
          );
          
          if (existingIndex !== -1) {
            // Update existing cart item (quantity was incremented by backend)
            const updatedCartItems = [...state.cartItems];
            updatedCartItems[existingIndex] = newCartItem;
            return {
              cartItems: updatedCartItems,
              isLoading: false,
              error: null
            };
          } else {
            // Add new cart item (new product/color/size combination)
            return {
              cartItems: [...state.cartItems, newCartItem],
              isLoading: false,
              error: null
            };
          }
        });
      } catch (error: any) {
        console.error('Add to cart error:', error.response?.data || error);
        
       
        
        set({
          isLoading: false,
          error: error.response?.data?.message || "Failed to add item to cart"
        });
        throw error; 
      }
    },
    
    removeFromCart: async (id) => {
      set({ isLoading: true, error: null });
      try {
        const response = await axios.delete(
          `${API_ROUTES.CART}/removecartItem/${id}`, 
          { 
            headers: getAuthHeaders(),
            withCredentials: true 
          }
        );
        
        console.log('Remove from cart response:', response.data);
        
        set((state) => {
          if (response.data.data) {
            // Backend returned updated item (quantity decremented)
            return {
              cartItems: state.cartItems.map(item => 
                item.id === id ? response.data.data : item
              ),
              isLoading: false,
              error: null
            };
          } else {
            // Backend removed the item completely
            return {
              cartItems: state.cartItems.filter(item => item.id !== id),
              isLoading: false,
              error: null
            };
          }
        });
      } catch (error: any) {
        console.error('Remove from cart error:', error.response?.data);
        
        
        
        set({
          isLoading: false,
          error: error.response?.data?.message || "Failed to remove item from cart"
        });
        throw error; 
      }
    },
    
    updateCart: async (id: string, quantity: number) => {
      // Validate quantity
      if (quantity < 1) {
        console.warn('Quantity must be at least 1');
        return;
      }
      
      // Optimistically update UI
      set((state) => ({
        cartItems: state.cartItems.map(item => 
          item.id === id ? { ...item, quantity } : item
        ),
        error: null
      }));
      
      // Debounced API call
      debounceCartQuantity(id, quantity);
    },
    
    clearCart: async () => {
      set({ isLoading: true, error: null });
      try {
        await axios.delete(`${API_ROUTES.CART}/clear`, {
          withCredentials: true
        });
        
        set({ 
          isLoading: false, 
          cartItems: [],
          error: null
        });
      } catch (error: any) {
        console.error('Clear cart error:', error.response?.data);
        
        
        
        
        set({ 
          isLoading: false, 
          error: error.response?.data?.message || 'Failed to clear cart' 
        });
        throw error; 
      }
    }
  };
});