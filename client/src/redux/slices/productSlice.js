import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { productService } from '@/services/productService.js';

// Thunk: Fetch paginated and filtered products
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (params, { rejectWithValue }) => {
    try {
      const data = await productService.getProducts(params);
      return data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to load products');
    }
  }
);

// Thunk: Fetch featured products for homepage
export const fetchFeaturedProducts = createAsyncThunk(
  'products/fetchFeaturedProducts',
  async (_, { rejectWithValue }) => {
    try {
      const data = await productService.getFeaturedProducts();
      return data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to load featured products');
    }
  }
);

// Thunk: Fetch single product details
export const fetchProductBySlug = createAsyncThunk(
  'products/fetchProductBySlug',
  async (slug, { rejectWithValue }) => {
    try {
      const data = await productService.getProductBySlug(slug);
      return data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to load product details');
    }
  }
);

// Thunk: Fetch all categories
export const fetchCategories = createAsyncThunk(
  'products/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const data = await productService.getCategories();
      return data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to load categories');
    }
  }
);

const initialState = {
  products: [],
  featuredProducts: [],
  categories: [],
  selectedProduct: null,
  relatedProducts: [],
  pagination: {
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  },
  filters: {
    category: '',
    search: '',
    sort: 'newest',
    size: '',
    page: 1,
  },
  isLoading: false,
  isDetailsLoading: false,
  isCategoriesLoading: false,
  error: null,
};

export const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setCategoryFilter: (state, action) => {
      state.filters.category = action.payload;
      state.filters.page = 1;
    },
    setSearchFilter: (state, action) => {
      state.filters.search = action.payload;
      state.filters.page = 1;
    },
    setSortFilter: (state, action) => {
      state.filters.sort = action.payload;
      state.filters.page = 1;
    },
    setSizeFilter: (state, action) => {
      state.filters.size = action.payload;
      state.filters.page = 1;
    },
    setPage: (state, action) => {
      state.filters.page = action.payload;
    },
    resetFilters: (state) => {
      state.filters = {
        category: '',
        search: '',
        sort: 'newest',
        size: '',
        page: 1,
      };
    },
    clearSelectedProduct: (state) => {
      state.selectedProduct = null;
      state.relatedProducts = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchProducts
      .addCase(fetchProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = action.payload.products || [];
        state.pagination = action.payload.pagination || initialState.pagination;
        state.error = null;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // fetchFeaturedProducts
      .addCase(fetchFeaturedProducts.fulfilled, (state, action) => {
        state.featuredProducts = action.payload || [];
      })

      // fetchProductBySlug
      .addCase(fetchProductBySlug.pending, (state) => {
        state.isDetailsLoading = true;
        state.error = null;
      })
      .addCase(fetchProductBySlug.fulfilled, (state, action) => {
        state.isDetailsLoading = false;
        state.selectedProduct = action.payload.product || null;
        state.relatedProducts = action.payload.relatedProducts || [];
        state.error = null;
      })
      .addCase(fetchProductBySlug.rejected, (state, action) => {
        state.isDetailsLoading = false;
        state.error = action.payload;
      })

      // fetchCategories
      .addCase(fetchCategories.pending, (state) => {
        state.isCategoriesLoading = true;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.isCategoriesLoading = false;
        state.categories = action.payload || [];
      })
      .addCase(fetchCategories.rejected, (state) => {
        state.isCategoriesLoading = false;
      });
  },
});

export const {
  setCategoryFilter,
  setSearchFilter,
  setSortFilter,
  setSizeFilter,
  setPage,
  resetFilters,
  clearSelectedProduct,
} = productSlice.actions;

export default productSlice.reducer;
