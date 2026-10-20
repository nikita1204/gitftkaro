import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { orderService } from '@/services/orderService.js';

export const createOrder = createAsyncThunk(
  'orders/createOrder',
  async (orderData, { rejectWithValue }) => {
    try {
      return await orderService.createOrder(orderData);
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to initialize order');
    }
  }
);

export const verifyPayment = createAsyncThunk(
  'orders/verifyPayment',
  async (paymentData, { rejectWithValue }) => {
    try {
      return await orderService.verifyPayment(paymentData);
    } catch (err) {
      return rejectWithValue(err.message || 'Payment verification failed');
    }
  }
);

export const fetchOrderDetails = createAsyncThunk(
  'orders/fetchOrderDetails',
  async (idOrNumber, { rejectWithValue }) => {
    try {
      return await orderService.getOrderDetails(idOrNumber);
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch order details');
    }
  }
);

export const fetchMyOrders = createAsyncThunk(
  'orders/fetchMyOrders',
  async (_, { rejectWithValue }) => {
    try {
      return await orderService.getMyOrders();
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch customer orders');
    }
  }
);

export const fetchAdminOrders = createAsyncThunk(
  'orders/fetchAdminOrders',
  async (params, { rejectWithValue }) => {
    try {
      return await orderService.adminGetOrders(params);
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch orders');
    }
  }
);

export const updateOrderStatusAdmin = createAsyncThunk(
  'orders/updateOrderStatusAdmin',
  async ({ id, updateData }, { rejectWithValue }) => {
    try {
      return await orderService.adminUpdateStatus(id, updateData);
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to update order status');
    }
  }
);

export const updateArtworkStatusAdmin = createAsyncThunk(
  'orders/updateArtworkStatusAdmin',
  async ({ orderId, itemId, artworkId, reviewData }, { rejectWithValue }) => {
    try {
      return await orderService.adminUpdateArtwork(orderId, itemId, artworkId, reviewData);
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to update artwork status');
    }
  }
);

const initialState = {
  currentOrder: null,
  myOrders: [],
  adminOrders: [],
  adminPagination: {
    page: 1,
    limit: 15,
    total: 0,
    totalPages: 1,
  },
  isLoading: false,
  isMutating: false,
  isPaymentProcessing: false,
  error: null,
  successMessage: null,
};

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
      state.error = null;
    },
    clearOrderErrors: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Order
      .addCase(createOrder.pending, (state) => {
        state.isPaymentProcessing = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.isPaymentProcessing = false;
        state.currentOrder = action.payload.order;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.isPaymentProcessing = false;
        state.error = action.payload;
      })

      // Verify Payment
      .addCase(verifyPayment.pending, (state) => {
        state.isPaymentProcessing = true;
        state.error = null;
      })
      .addCase(verifyPayment.fulfilled, (state, action) => {
        state.isPaymentProcessing = false;
        state.currentOrder = action.payload;
        state.successMessage = 'Order confirmed and payment verified!';
      })
      .addCase(verifyPayment.rejected, (state, action) => {
        state.isPaymentProcessing = false;
        state.error = action.payload;
      })

      // Fetch Order Details
      .addCase(fetchOrderDetails.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrderDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentOrder = action.payload;
      })
      .addCase(fetchOrderDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Fetch My Orders
      .addCase(fetchMyOrders.fulfilled, (state, action) => {
        state.myOrders = action.payload;
      })

      // Fetch Admin Orders
      .addCase(fetchAdminOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAdminOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.adminOrders = action.payload.orders;
        state.adminPagination = action.payload.pagination;
      })
      .addCase(fetchAdminOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Update Order Status Admin
      .addCase(updateOrderStatusAdmin.pending, (state) => {
        state.isMutating = true;
      })
      .addCase(updateOrderStatusAdmin.fulfilled, (state, action) => {
        state.isMutating = false;
        const index = state.adminOrders.findIndex((o) => o._id === action.payload._id);
        if (index !== -1) {
          state.adminOrders[index] = action.payload;
        }
        if (state.currentOrder?._id === action.payload._id) {
          state.currentOrder = action.payload;
        }
        state.successMessage = `Order status updated to ${action.payload.orderStatus}`;
      })
      .addCase(updateOrderStatusAdmin.rejected, (state, action) => {
        state.isMutating = false;
        state.error = action.payload;
      })

      // Update Artwork Status Admin
      .addCase(updateArtworkStatusAdmin.fulfilled, (state, action) => {
        const index = state.adminOrders.findIndex((o) => o._id === action.payload._id);
        if (index !== -1) {
          state.adminOrders[index] = action.payload;
        }
        if (state.currentOrder?._id === action.payload._id) {
          state.currentOrder = action.payload;
        }
      });
  },
});

export const { clearCurrentOrder, clearOrderErrors } = orderSlice.actions;
export default orderSlice.reducer;
