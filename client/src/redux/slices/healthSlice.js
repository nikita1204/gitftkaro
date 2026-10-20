import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { healthService } from '../../services/healthService.js';

export const fetchHealthStatus = createAsyncThunk(
  'health/fetchStatus',
  async (_, { rejectWithValue }) => {
    try {
      const response = await healthService.checkHealth();
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const initialState = {
  data: null,
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  lastCheckedAt: null,
};

export const healthSlice = createSlice({
  name: 'health',
  initialState,
  reducers: {
    resetHealthStatus: (state) => {
      state.data = null;
      state.status = 'idle';
      state.error = null;
      state.lastCheckedAt = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHealthStatus.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchHealthStatus.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
        state.lastCheckedAt = new Date().toISOString();
      })
      .addCase(fetchHealthStatus.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || {
          message: 'Failed to fetch server health status',
        };
        state.lastCheckedAt = new Date().toISOString();
      });
  },
});

export const { resetHealthStatus } = healthSlice.actions;
export default healthSlice.reducer;
