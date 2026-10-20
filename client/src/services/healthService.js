import { apiClient } from './apiClient.js';

export const healthService = {
  checkHealth: async () => {
    return await apiClient.get('/health');
  },
};
