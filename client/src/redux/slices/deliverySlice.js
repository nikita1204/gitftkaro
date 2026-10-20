import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { deliveryService } from '@/services/deliveryService.js';

export const checkDeliveryEligibility = createAsyncThunk(
  'delivery/checkEligibility',
  async (params, { rejectWithValue }) => {
    try {
      const res = await deliveryService.checkEligibility(params);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to check delivery eligibility');
    }
  }
);

export const fetchServiceablePincodes = createAsyncThunk(
  'delivery/fetchServiceablePincodes',
  async (_, { rejectWithValue }) => {
    try {
      const res = await deliveryService.getServiceablePincodes();
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch serviceable PIN codes');
    }
  }
);

export const fetchDeliveryConfig = createAsyncThunk(
  'delivery/fetchDeliveryConfig',
  async (_, { rejectWithValue }) => {
    try {
      const res = await deliveryService.getConfig();
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch delivery settings');
    }
  }
);

export const updateDeliveryConfig = createAsyncThunk(
  'delivery/updateDeliveryConfig',
  async (configData, { rejectWithValue }) => {
    try {
      const res = await deliveryService.updateConfig(configData);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to update delivery settings');
    }
  }
);

export const fetchAllZones = createAsyncThunk(
  'delivery/fetchAllZones',
  async (_, { rejectWithValue }) => {
    try {
      const res = await deliveryService.getAllZones();
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch delivery zones');
    }
  }
);

export const createDeliveryZone = createAsyncThunk(
  'delivery/createDeliveryZone',
  async (zoneData, { rejectWithValue }) => {
    try {
      const res = await deliveryService.createZone(zoneData);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to create delivery zone');
    }
  }
);

export const toggleDeliveryZone = createAsyncThunk(
  'delivery/toggleDeliveryZone',
  async (id, { rejectWithValue }) => {
    try {
      const res = await deliveryService.toggleZoneStatus(id);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to toggle zone status');
    }
  }
);

export const deleteDeliveryZone = createAsyncThunk(
  'delivery/deleteDeliveryZone',
  async (id, { rejectWithValue }) => {
    try {
      await deliveryService.deleteZone(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to delete delivery zone');
    }
  }
);

const initialState = {
  currentEstimate: null,
  isChecking: false,
  checkError: null,

  serviceablePincodes: [],
  isLoadingPincodes: false,

  config: null,
  isLoadingConfig: false,

  zones: [],
  isLoadingZones: false,
  isMutatingZone: false,
  adminError: null,
};

const deliverySlice = createSlice({
  name: 'delivery',
  initialState,
  reducers: {
    clearDeliveryEstimate: (state) => {
      state.currentEstimate = null;
      state.checkError = null;
    },
    resetDeliveryErrors: (state) => {
      state.checkError = null;
      state.adminError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Check Eligibility
      .addCase(checkDeliveryEligibility.pending, (state) => {
        state.isChecking = true;
        state.checkError = null;
      })
      .addCase(checkDeliveryEligibility.fulfilled, (state, action) => {
        state.isChecking = false;
        state.currentEstimate = action.payload;
      })
      .addCase(checkDeliveryEligibility.rejected, (state, action) => {
        state.isChecking = false;
        state.checkError = action.payload;
      })

      // Fetch Serviceable Pincodes
      .addCase(fetchServiceablePincodes.pending, (state) => {
        state.isLoadingPincodes = true;
      })
      .addCase(fetchServiceablePincodes.fulfilled, (state, action) => {
        state.isLoadingPincodes = false;
        state.serviceablePincodes = action.payload;
      })
      .addCase(fetchServiceablePincodes.rejected, (state) => {
        state.isLoadingPincodes = false;
      })

      // Fetch Config
      .addCase(fetchDeliveryConfig.pending, (state) => {
        state.isLoadingConfig = true;
      })
      .addCase(fetchDeliveryConfig.fulfilled, (state, action) => {
        state.isLoadingConfig = false;
        state.config = action.payload;
      })
      .addCase(fetchDeliveryConfig.rejected, (state, action) => {
        state.isLoadingConfig = false;
        state.adminError = action.payload;
      })

      // Update Config
      .addCase(updateDeliveryConfig.fulfilled, (state, action) => {
        state.config = action.payload;
      })

      // Fetch All Zones
      .addCase(fetchAllZones.pending, (state) => {
        state.isLoadingZones = true;
      })
      .addCase(fetchAllZones.fulfilled, (state, action) => {
        state.isLoadingZones = false;
        state.zones = action.payload;
      })
      .addCase(fetchAllZones.rejected, (state, action) => {
        state.isLoadingZones = false;
        state.adminError = action.payload;
      })

      // Create Zone
      .addCase(createDeliveryZone.fulfilled, (state, action) => {
        state.zones.push(action.payload);
      })

      // Toggle Zone
      .addCase(toggleDeliveryZone.fulfilled, (state, action) => {
        const index = state.zones.findIndex((z) => z._id === action.payload._id);
        if (index !== -1) {
          state.zones[index] = action.payload;
        }
      })

      // Delete Zone
      .addCase(deleteDeliveryZone.fulfilled, (state, action) => {
        state.zones = state.zones.filter((z) => z._id !== action.payload);
      });
  },
});

export const { clearDeliveryEstimate, resetDeliveryErrors } = deliverySlice.actions;
export default deliverySlice.reducer;
