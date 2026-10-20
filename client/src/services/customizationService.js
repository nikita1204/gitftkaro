import { apiClient } from './apiClient.js';

export const customizationService = {
  /**
   * Fetch active pricing rules and configuration.
   */
  async getPricingRules() {
    const res = await apiClient.get('/v1/customizations/pricing-rules');
    return res.data;
  },

  /**
   * Calculate verified price quote for a customization draft.
   * @param {Object} payload - { productId, sizeBreakdown, printLocations, selectedColor }
   */
  async calculateQuote(payload) {
    const res = await apiClient.post('/v1/customizations/calculate-quote', payload);
    return res.data;
  },

  /**
   * Upload customer artwork or reference design file.
   * @param {FormData} formData
   */
  async uploadArtwork(formData) {
    const res = await apiClient.post('/v1/customizations/upload-artwork', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  /**
   * Persist full customization specification to database.
   * @param {Object} payload
   */
  async createCustomization(payload) {
    const res = await apiClient.post('/v1/customizations', payload);
    return res.data;
  },

  /**
   * Retrieve saved customization details by reference code or ID.
   * @param {string} codeOrId
   */
  async getCustomizationByCode(codeOrId) {
    const res = await apiClient.get(`/v1/customizations/${codeOrId}`);
    return res.data;
  },
};
