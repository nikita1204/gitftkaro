import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { customizationService } from '../../services/customizationService.js';

export const fetchPricingRules = createAsyncThunk(
  'customization/fetchPricingRules',
  async (_, { rejectWithValue }) => {
    try {
      return await customizationService.getPricingRules();
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to load pricing configuration');
    }
  }
);

export const calculatePriceQuote = createAsyncThunk(
  'customization/calculatePriceQuote',
  async (payload, { rejectWithValue }) => {
    try {
      return await customizationService.calculateQuote(payload);
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to calculate price quote');
    }
  }
);

export const uploadArtworkFile = createAsyncThunk(
  'customization/uploadArtworkFile',
  async (formData, { rejectWithValue }) => {
    try {
      return await customizationService.uploadArtwork(formData);
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to upload artwork file');
    }
  }
);

export const submitCustomization = createAsyncThunk(
  'customization/submitCustomization',
  async (payload, { rejectWithValue }) => {
    try {
      return await customizationService.createCustomization(payload);
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to save customization order');
    }
  }
);

export const fetchCustomizationByCode = createAsyncThunk(
  'customization/fetchCustomizationByCode',
  async (codeOrId, { rejectWithValue }) => {
    try {
      return await customizationService.getCustomizationByCode(codeOrId);
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch customization details');
    }
  }
);

const initialState = {
  pricingRules: null,
  isRulesLoading: false,

  currentQuote: null,
  isCalculatingQuote: false,
  calculateError: null,

  uploadedArtworks: [],
  isUploadingArtwork: false,
  uploadError: null,

  isSubmitting: false,
  submitSuccess: false,
  savedCustomization: null,
  submitError: null,

  viewedCustomization: null,
  isViewingLoading: false,
  viewingError: null,
};

const customizationSlice = createSlice({
  name: 'customization',
  initialState,
  reducers: {
    removeUploadedArtwork: (state, action) => {
      state.uploadedArtworks = state.uploadedArtworks.filter(
        (art) => art.filename !== action.payload && art.url !== action.payload
      );
    },
    clearUploadedArtworks: (state) => {
      state.uploadedArtworks = [];
      state.uploadError = null;
    },
    resetCustomizationState: (state) => {
      state.currentQuote = null;
      state.calculateError = null;
      state.uploadedArtworks = [];
      state.uploadError = null;
      state.isSubmitting = false;
      state.submitSuccess = false;
      state.savedCustomization = null;
      state.submitError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Pricing Rules
      .addCase(fetchPricingRules.pending, (state) => {
        state.isRulesLoading = true;
      })
      .addCase(fetchPricingRules.fulfilled, (state, action) => {
        state.isRulesLoading = false;
        state.pricingRules = action.payload;
      })
      .addCase(fetchPricingRules.rejected, (state) => {
        state.isRulesLoading = false;
      })

      // Calculate Price Quote
      .addCase(calculatePriceQuote.pending, (state) => {
        state.isCalculatingQuote = true;
        state.calculateError = null;
      })
      .addCase(calculatePriceQuote.fulfilled, (state, action) => {
        state.isCalculatingQuote = false;
        state.currentQuote = action.payload;
        state.calculateError = null;
      })
      .addCase(calculatePriceQuote.rejected, (state, action) => {
        state.isCalculatingQuote = false;
        state.calculateError = action.payload;
      })

      // Upload Artwork
      .addCase(uploadArtworkFile.pending, (state) => {
        state.isUploadingArtwork = true;
        state.uploadError = null;
      })
      .addCase(uploadArtworkFile.fulfilled, (state, action) => {
        state.isUploadingArtwork = false;
        const newArtworks = action.payload.artworks || [];
        state.uploadedArtworks = [...state.uploadedArtworks, ...newArtworks];
        state.uploadError = null;
      })
      .addCase(uploadArtworkFile.rejected, (state, action) => {
        state.isUploadingArtwork = false;
        state.uploadError = action.payload;
      })

      // Submit Customization
      .addCase(submitCustomization.pending, (state) => {
        state.isSubmitting = true;
        state.submitSuccess = false;
        state.submitError = null;
      })
      .addCase(submitCustomization.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.submitSuccess = true;
        state.savedCustomization = action.payload;
        state.submitError = null;
      })
      .addCase(submitCustomization.rejected, (state, action) => {
        state.isSubmitting = false;
        state.submitSuccess = false;
        state.submitError = action.payload;
      })

      // View by Code
      .addCase(fetchCustomizationByCode.pending, (state) => {
        state.isViewingLoading = true;
        state.viewingError = null;
      })
      .addCase(fetchCustomizationByCode.fulfilled, (state, action) => {
        state.isViewingLoading = false;
        state.viewedCustomization = action.payload;
        state.viewingError = null;
      })
      .addCase(fetchCustomizationByCode.rejected, (state, action) => {
        state.isViewingLoading = false;
        state.viewingError = action.payload;
      });
  },
});

export const { removeUploadedArtwork, clearUploadedArtworks, resetCustomizationState } =
  customizationSlice.actions;

export default customizationSlice.reducer;
