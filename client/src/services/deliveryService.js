import { apiClient } from './apiClient.js';

export const deliveryService = {
  /**
   * Check delivery eligibility and estimated window for a PIN code and quantity.
   * @param {Object} params - { pincode, totalQuantity, hasArtwork, orderPlacedAt }
   */
  async checkEligibility(params) {
    const res = await apiClient.post('/v1/delivery/check-eligibility', params);
    return res.data;
  },

  /**
   * Retrieve list of all active serviceable Raipur PIN codes and localities.
   */
  async getServiceablePincodes() {
    const res = await apiClient.get('/v1/delivery/pincodes');
    return res.data;
  },

  /**
   * Retrieve global delivery configuration rules.
   */
  async getConfig() {
    const res = await apiClient.get('/v1/delivery/config');
    return res.data;
  },

  /**
   * Update delivery configuration (Admin).
   * @param {Object} configData
   */
  async updateConfig(configData) {
    const res = await apiClient.put('/v1/delivery/config', configData);
    return res.data;
  },

  /**
   * List all zones for administration (Admin).
   */
  async getAllZones() {
    const res = await apiClient.get('/v1/delivery/zones');
    return res.data;
  },

  /**
   * Create a new delivery zone (Admin).
   * @param {Object} zoneData
   */
  async createZone(zoneData) {
    const res = await apiClient.post('/v1/delivery/zones', zoneData);
    return res.data;
  },

  /**
   * Update an existing delivery zone (Admin).
   * @param {string} id
   * @param {Object} zoneData
   */
  async updateZone(id, zoneData) {
    const res = await apiClient.put(`/v1/delivery/zones/${id}`, zoneData);
    return res.data;
  },

  /**
   * Toggle delivery zone active status (Admin).
   * @param {string} id
   */
  async toggleZoneStatus(id) {
    const res = await apiClient.patch(`/v1/delivery/zones/${id}/status`);
    return res.data;
  },

  /**
   * Delete a delivery zone (Admin).
   * @param {string} id
   */
  async deleteZone(id) {
    const res = await apiClient.delete(`/v1/delivery/zones/${id}`);
    return res.data;
  },
};
