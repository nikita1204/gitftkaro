import { apiClient } from './apiClient.js';

export const productService = {
  /**
   * Fetch paginated and filtered products list
   * @param {Object} [params] - Query params: page, limit, category, search, minPrice, maxPrice, size, color, sort
   */
  async getProducts(params = {}) {
    const response = await apiClient.get('/v1/products', { params });
    return {
      products: response.data || [],
      pagination: response.meta || { total: 0, page: 1, limit: 12, totalPages: 1 },
    };
  },

  /**
   * Fetch featured products for homepage spotlight
   */
  async getFeaturedProducts() {
    const response = await apiClient.get('/v1/products/featured');
    return response.data || [];
  },

  /**
   * Fetch product details and related products by slug or ID
   * @param {string} slugOrId
   */
  async getProductBySlug(slugOrId) {
    const response = await apiClient.get(`/v1/products/${slugOrId}`);
    return response.data; // { product, relatedProducts }
  },

  /**
   * Fetch all active product categories with count metadata
   */
  async getCategories() {
    const response = await apiClient.get('/v1/categories');
    return response.data || [];
  },

  /**
   * Fetch single category by slug
   * @param {string} slug
   */
  async getCategoryBySlug(slug) {
    const response = await apiClient.get(`/v1/categories/${slug}`);
    return response.data;
  },

  /**
   * Admin: Create new product
   */
  async createProduct(productData) {
    const response = await apiClient.post('/v1/products', productData);
    return response.data;
  },

  /**
   * Admin: Update product
   */
  async updateProduct(id, updateData) {
    const response = await apiClient.put(`/v1/products/${id}`, updateData);
    return response.data;
  },

  /**
   * Admin: Toggle product active status
   */
  async toggleProductStatus(id) {
    const response = await apiClient.patch(`/v1/products/${id}/status`);
    return response.data;
  },

  /**
   * Admin: Archive product
   */
  async deleteProduct(id) {
    const response = await apiClient.delete(`/v1/products/${id}`);
    return response.data;
  },
};
