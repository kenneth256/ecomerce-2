import { API_ROUTES } from "@/lib/api";
import axios from "axios";
import { toast } from "sonner";
import { create } from "zustand";

export interface Item {
  id: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  color?: string | null;
  size?: string | null;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  addressId: string; 
  couponId?: string;
  totalAmount: number;
  paymentId: string; 
  items: Item[];
  paymentStatus?: string;
  address: any ;
  user: any;
  createdAt: any;
  status: string;
}

export interface OrderData {
  items: Item[];
  couponId?: string;
  totalAmount: number;
  paymentMethod: string;
  transactionId: string;
}

export interface OrderStore {
  isLoading?: boolean;
  error?: string | null;
  order?: Order | null;
  userOrder: Order[];
  adminOrders: Order[];
  createPaypalOrder: (items: Item[], total: number) => Promise<string>;
  capturePayPalOrder: (orderId: string) => Promise<any>;
  createOrder: (orderData: OrderData) => Promise<Order | null>;
  getOrderById: (id: string) => Promise<Order | null>;
  updateOrder: (id: string, status: string) => Promise<boolean>;
  getOrdersAdmin: () => Promise<Order[] | null>;
  getOrdersByUser: () => Promise<Order[] | null>;
}

export const useOrderStore = create<OrderStore>()((set, get) => ({
  isLoading: false,
  error: null,
  userOrder: [],
  adminOrders: [],

  createPaypalOrder: async(items, total) => {
    set({ error: null, isLoading: true });
    
    try {
      console.log('📦 Creating PayPal order...', { itemCount: items.length, total });

      // Validate input
      if (!items || items.length === 0) {
        throw new Error('Cart is empty');
      }

      if (!total || total <= 0) {
        throw new Error('Invalid total amount');
      }

      const response = await axios.post(
        `${API_ROUTES.ORDERS}/createPaypalOrder`, 
        { items, total }, 
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('📨 PayPal API Response:', response.data);

      // Check if request was successful
      if (!response.data?.success) {
        const errorMsg = response.data?.error || 'Failed to create PayPal order';
        console.error('❌ PayPal order creation failed:', response.data);
        throw new Error(errorMsg);
      }

      // Extract order ID
      const orderId = response.data.data;

      if (!orderId || typeof orderId !== 'string') {
        console.error('❌ Invalid order ID received:', response.data);
        throw new Error('Invalid order ID received from server');
      }

      console.log('✅ PayPal order created successfully:', orderId);
      set({ isLoading: false });
      
      return orderId; // Return string, never null

    } catch (error) {
      console.error('❌ Error creating PayPal order:', error);
      
      let errorMessage = 'Failed to create PayPal order';
      
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.error || 
                      error.response?.data?.message || 
                      error.message;
        
        console.error('API Error Details:', {
          status: error.response?.status,
          data: error.response?.data,
        });
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      set({ isLoading: false, error: errorMessage });
      
      // Show toast notification
      toast.error(errorMessage);
      
      // ⚠️ CRITICAL: Throw error instead of returning null
      throw new Error(errorMessage);
    }
  },


  capturePayPalOrder: async(orderId) => {
    set({ isLoading: true, error: null });
    
    try {
      console.log('💰 Capturing PayPal order:', orderId);
      console.log("Full URL:", `${API_ROUTES.ORDERS}/capturePaypalOrder`);
      
      const result = await axios.post(
        `${API_ROUTES.ORDERS}/capturePaypalOrder`, 
        { orderId }, 
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (!result.data?.success) {
        throw new Error(result.data?.error || 'Failed to capture payment');
      }

      console.log('✅ Payment captured successfully');
      set({ isLoading: false });
      
      return result.data.data;

    } catch (error) {
      console.error('❌ Error capturing PayPal order:', error);
      
      let errorMessage = 'Failed to capture PayPal order';
      
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.error || error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      set({ isLoading: false, error: errorMessage });
      toast.error(errorMessage);
      
      throw new Error(errorMessage);
    }
  },

  createOrder: async(OrderData: OrderData) => {
    set({ isLoading: true, error: null });
    
    try {
      console.log("Creating order with data:", OrderData);
      
      const result = await axios.post(
        `${API_ROUTES.ORDERS}/create-order`,
        OrderData, 
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log("Order creation response:", result.data);
      
      if (!result.data?.success) {
        throw new Error(result.data?.error || 'Failed to create order');
      }
      
      set({ isLoading: false, order: result.data.data }); 
      return result.data.data;

    } catch (error: any) {
      console.error("Create order error:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error ||
                          'Failed to create final order, try again later';
      
      set({
        isLoading: false, 
        error: errorMessage
      });
      
      toast.error(errorMessage);
      return null;
    }
  },

 updateOrder: async(orderId, status) => {
  set({ isLoading: true, error: null });
  try {
    const result = await axios.put(
      `${API_ROUTES.ORDERS}/updateorderStatus/${orderId}`,
      {status},
      { withCredentials: true }
    );
   
    
    set((state) => ({
      ...state,
      order: state.order?.id === orderId
        ? { ...state.order, status }
        : state.order,
      adminOrders: state.adminOrders.map(order =>
        order.id === orderId ? { ...order, status } : order
      ),
      isLoading: false
    }));
    
    return true;
  } catch (error) {
    const errorMessage = 'Failed to update order status';
    set({ isLoading: false, error: errorMessage });
    toast.error(errorMessage);
    return false;
  }
},

  getOrdersAdmin: async () => {
  set({ isLoading: true, error: null });
  
  try {
    const response = await axios.get(
      `${API_ROUTES.ORDERS}/getOrderAdmin`, 
      { withCredentials: true }
    );
    
    const orders = response.data?.data || response.data || [];
    
    const ordersArray = Array.isArray(orders) ? orders : [];
    
    set({ 
      isLoading: false, 
      adminOrders: ordersArray,
      error: null 
    });
    
    return ordersArray;

  } catch (error) {
    // More detailed error handling
    const errorMessage = 
      axios.isAxiosError(error) 
        ? error.response?.data?.message || 'Failed to get orders'
        : 'Failed to get orders';
    
    console.error('Error fetching admin orders:', error);
    
    set({ 
      isLoading: false, 
      error: errorMessage,
      adminOrders: [] // Clear orders on error
    });
    
    toast.error(errorMessage);
    return []; // Return empty array instead of null for consistency
  }
},

  getOrdersByUser: async() => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await axios.get(
        `${API_ROUTES.ORDERS}/getorderByUser`, 
        { withCredentials: true }
      );
      
       const orders = response.data?.data || response.data || [];
    
    set({ isLoading: false, userOrder: Array.isArray(orders) ? orders : [] });
    return orders;

    } catch (error) {
      const errorMessage = 'Failed to get your orders';
      set({ isLoading: false, error: errorMessage });
      toast.error(errorMessage);
      return null;
    }
  },

 getOrderById: async(id) => {
  console.log('🔍 Starting fetch for order ID:', id);
  set({ isLoading: true, error: null });
  
  try {
    const response = await axios.get(
      `${API_ROUTES.ORDERS}/getorder/${id}`, 
      { withCredentials: true }
    );
    
    console.log('📦 Full response:', response);
    console.log('📦 response.data:', response.data);
    console.log('📦 response.data.data:', response.data.data);
    
    const orderData = response.data.data || response.data;
    console.log('✅ Setting order to:', orderData);
    
    set({ 
      isLoading: false, 
      order: orderData
    });
    
    return orderData;

  } catch (error) {
    console.error('❌ Error fetching order:', error);
    const errorMessage = 'Failed to get order details';
    set({ isLoading: false, error: errorMessage });
    toast.error(errorMessage);
    return null;
  }
},
}));