import { apiClient } from './apiClient.js';

export const authService = {
  /**
   * Register a new customer
   * @param {Object} data - { name, email, password, phone, city }
   */
  async register(data) {
    const response = await apiClient.post('/v1/auth/register', data);
    return response.data;
  },

  /**
   * Login customer or administrator
   * @param {Object} credentials - { email, password }
   */
  async login(credentials) {
    const response = await apiClient.post('/v1/auth/login', credentials);
    return response.data;
  },

  /**
   * Logout current session and clear HTTP-only cookie
   */
  async logout() {
    const response = await apiClient.post('/v1/auth/logout');
    return response.data;
  },

  /**
   * Get current authenticated user profile
   */
  async getCurrentUser() {
    const response = await apiClient.get('/v1/auth/me');
    return response.data?.user || null;
  },

  /**
   * Fetch admin console metrics (admin role required)
   */
  async getAdminMetrics() {
    const response = await apiClient.get('/v1/auth/admin-metrics');
    return response.data;
  },
};
