import axios from 'axios';
import { clientEnv } from '../validations/envValidation.js';

export const apiClient = axios.create({
  baseURL: clientEnv.NEXT_PUBLIC_API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request Interceptor: for injecting auth headers, request correlation IDs, etc.
apiClient.interceptors.request.use(
  (config) => {
    // Infrastructure ready for JWT Authorization header in future steps
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: centralized error extraction
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const errorPayload = {
      message:
        error.response?.data?.message ||
        error.message ||
        'Unable to communicate with GIFT KRO servers.',
      statusCode: error.response?.status || 500,
      errors: error.response?.data?.errors || null,
      isNetworkError: !error.response,
    };
    return Promise.reject(errorPayload);
  }
);
