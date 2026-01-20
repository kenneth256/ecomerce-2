

import axios from 'axios';


const BaseURL = process.env.NEXT_PUBLIC_API_URL || '';


export const axio = axios.create({
  baseURL: BaseURL,
  withCredentials: true, 
  headers: {
    'Content-Type': 'application/json',
  }
});


axio.interceptors.request.use(
  (config) => {

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


axio.interceptors.response.use(
  (response) => {
    console.log('📥 API Response:', response.config.method?.toUpperCase(), response.config.url, response.status);
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
    }
    return Promise.reject(error);
  }
);

export const API_ROUTES = {
  AUTH: '/api/auth',
  PRODUCTS: '/api/products',
  COUPONS: '/api/coupons',
  SETTINGS: '/api/settings',
  CART: '/api/cart',
  ADDRESS: '/api/address',
  ORDERS: '/api/orders'
};