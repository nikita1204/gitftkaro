import { configureStore } from '@reduxjs/toolkit';
import healthReducer from './slices/healthSlice.js';
import uiReducer from './slices/uiSlice.js';
import authReducer from './slices/authSlice.js';
import productReducer from './slices/productSlice.js';
import customizationReducer from './slices/customizationSlice.js';
import cartReducer from './slices/cartSlice.js';
import deliveryReducer from './slices/deliverySlice.js';
import orderReducer from './slices/orderSlice.js';
import adminReducer from './slices/adminSlice.js';

export const makeStore = () => {
  return configureStore({
    reducer: {
      health: healthReducer,
      ui: uiReducer,
      auth: authReducer,
      products: productReducer,
      customization: customizationReducer,
      cart: cartReducer,
      delivery: deliveryReducer,
      orders: orderReducer,
      admin: adminReducer,
    },
    devTools: process.env.NODE_ENV !== 'production',
  });
};

// Singleton store instance for direct client usage
export const store = makeStore();

export default store;
