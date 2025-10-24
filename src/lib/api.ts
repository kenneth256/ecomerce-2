//const BaseURL = 'http://localhost:4000'


import axios from 'axios';

const BaseURL = process.env.NEXT_PUBLIC_API_URL;

// Create axios instance with credentials
export const axio = axios.create({
  baseURL: BaseURL,
  withCredentials: true, // Send cookies with requests
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add request interceptor to handle auth tokens if needed
axio.interceptors.request.use(
  (config) => {
    // You can add additional headers here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors globally
axio.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - could redirect to login
      console.error('Unauthorized - please login again');
    }
    return Promise.reject(error);
  }
);

export const API_ROUTES = {
  AUTH: `${BaseURL}/api/auth`,
  PRODUCTS: `${BaseURL}/api/products`,
  COUPONS: `${BaseURL}/api/coupons`,
  SETTINGS: `${BaseURL}/api/settings`,
  CART: `${BaseURL}/api/cart`,
  ADDRESS: `${BaseURL}/api/address`,
  ORDERS: `${BaseURL}/api/orders`
};