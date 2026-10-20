import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { cartService } from '@/services/cartService.js';

export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      return await cartService.getCart();
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to load cart');
    }
  }
);

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async (itemData, { rejectWithValue }) => {
    try {
      return await cartService.addItem(itemData);
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to add item to cart');
    }
  }
);

export const updateCartItem = createAsyncThunk(
  'cart/updateCartItem',
  async ({ itemId, updateData }, { rejectWithValue }) => {
    try {
      return await cartService.updateItem(itemId, updateData);
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to update cart item');
    }
  }
);

export const removeCartItem = createAsyncThunk(
  'cart/removeCartItem',
  async (itemId, { rejectWithValue }) => {
    try {
      return await cartService.removeItem(itemId);
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to remove cart item');
    }
  }
);

export const clearCartItems = createAsyncThunk(
  'cart/clearCartItems',
  async (_, { rejectWithValue }) => {
    try {
      return await cartService.clearCart();
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to clear cart');
    }
  }
);

export const prepareCheckoutOrder = createAsyncThunk(
  'cart/prepareCheckoutOrder',
  async (checkoutData, { rejectWithValue }) => {
    try {
      return await cartService.prepareCheckout(checkoutData);
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to prepare checkout');
    }
  }
);

const initialState = {
  cart: {
    items: [],
    summary: {
      totalItems: 0,
      totalQuantity: 0,
      garmentSubtotal: 0,
      sizeSurchargeSubtotal: 0,
      subtotal: 0,
      totalDiscount: 0,
      estimatedShipping: 0,
      estimatedDeliveryHours: 24,
      finalTotal: 0,
      currency: 'INR',
      isMoqSatisfied: true,
      canProceedToCheckout: false,
      warnings: [],
    },
  },
  isLoading: false,
  isMutating: false,
  error: null,

  checkoutPreparation: null,
  isPreparingCheckout: false,
  checkoutError: null,
  checkoutSuccess: false,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearCheckoutPreparation: (state) => {
      state.checkoutPreparation = null;
      state.checkoutError = null;
      state.checkoutSuccess = false;
    },
    resetCartErrors: (state) => {
      state.error = null;
      state.checkoutError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Cart
      .addCase(fetchCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cart = action.payload || initialState.cart;
        state.error = null;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Add to Cart
      .addCase(addToCart.pending, (state) => {
        state.isMutating = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.isMutating = false;
        state.cart = action.payload || state.cart;
        state.error = null;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.isMutating = false;
        state.error = action.payload;
      })

      // Update Item
      .addCase(updateCartItem.pending, (state) => {
        state.isMutating = true;
        state.error = null;
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.isMutating = false;
        state.cart = action.payload || state.cart;
        state.error = null;
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        state.isMutating = false;
        state.error = action.payload;
      })

      // Remove Item
      .addCase(removeCartItem.pending, (state) => {
        state.isMutating = true;
        state.error = null;
      })
      .addCase(removeCartItem.fulfilled, (state, action) => {
        state.isMutating = false;
        state.cart = action.payload || state.cart;
        state.error = null;
      })
      .addCase(removeCartItem.rejected, (state, action) => {
        state.isMutating = false;
        state.error = action.payload;
      })

      // Clear Cart
      .addCase(clearCartItems.pending, (state) => {
        state.isMutating = true;
      })
      .addCase(clearCartItems.fulfilled, (state, action) => {
        state.isMutating = false;
        state.cart = action.payload || initialState.cart;
      })
      .addCase(clearCartItems.rejected, (state, action) => {
        state.isMutating = false;
        state.error = action.payload;
      })

      // Prepare Checkout
      .addCase(prepareCheckoutOrder.pending, (state) => {
        state.isPreparingCheckout = true;
        state.checkoutError = null;
        state.checkoutSuccess = false;
      })
      .addCase(prepareCheckoutOrder.fulfilled, (state, action) => {
        state.isPreparingCheckout = false;
        state.checkoutPreparation = action.payload;
        state.checkoutSuccess = true;
        state.checkoutError = null;
      })
      .addCase(prepareCheckoutOrder.rejected, (state, action) => {
        state.isPreparingCheckout = false;
        state.checkoutError = action.payload;
        state.checkoutSuccess = false;
      });
  },
});

export const { clearCheckoutPreparation, resetCartErrors } = cartSlice.actions;

export default cartSlice.reducer;
