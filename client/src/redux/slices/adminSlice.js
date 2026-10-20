import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { adminService } from '@/services/adminService.js';

export const fetchMetrics = createAsyncThunk(
  'admin/fetchMetrics',
  async (_, { rejectWithValue }) => {
    try {
      return await adminService.getMetrics();
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch administrator metrics');
    }
  }
);

export const fetchAuditLogs = createAsyncThunk(
  'admin/fetchAuditLogs',
  async (params, { rejectWithValue }) => {
    try {
      return await adminService.getAuditLogs(params);
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch audit logs');
    }
  }
);

const initialState = {
  metrics: null,
  auditLogs: [],
  auditPagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  },
  isLoadingMetrics: false,
  isLoadingAudit: false,
  error: null,
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearAdminError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Metrics
      .addCase(fetchMetrics.pending, (state) => {
        state.isLoadingMetrics = true;
        state.error = null;
      })
      .addCase(fetchMetrics.fulfilled, (state, action) => {
        state.isLoadingMetrics = false;
        state.metrics = action.payload;
      })
      .addCase(fetchMetrics.rejected, (state, action) => {
        state.isLoadingMetrics = false;
        state.error = action.payload;
      })

      // Fetch Audit Logs
      .addCase(fetchAuditLogs.pending, (state) => {
        state.isLoadingAudit = true;
      })
      .addCase(fetchAuditLogs.fulfilled, (state, action) => {
        state.isLoadingAudit = false;
        state.auditLogs = action.payload.logs;
        state.auditPagination = action.payload.pagination;
      })
      .addCase(fetchAuditLogs.rejected, (state, action) => {
        state.isLoadingAudit = false;
        state.error = action.payload;
      });
  },
});

export const { clearAdminError } = adminSlice.actions;
export default adminSlice.reducer;
