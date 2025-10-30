import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { getToken, deleteToken } from '@/services/storage/secureStorage';

// Create axios instance with base configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000/api/v1', // Adjust base URL as needed
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Callback for handling auth errors (e.g., logout)
let authErrorCallback: (() => void) | null = null;

export const setAuthErrorCallback = (callback: () => void): void => {
  authErrorCallback = callback;
};

// Request interceptor to add JWT token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    } catch (error) {
      console.error('Error in request interceptor:', error);
      return Promise.reject(error);
    }
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle responses and errors
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Return response.data directly for successful responses
    return response.data;
  },
  (error: AxiosError) => {
    if (error.response) {
      const { status, data } = error.response;

      if (status === 401) {
        // Token expired or invalid - clear token and trigger logout
        deleteToken();
        if (authErrorCallback) {
          authErrorCallback();
        }
        return Promise.reject({
          message: 'Authentication failed. Please log in again.',
          status: 401,
        });
      } else if (status === 403) {
        // Forbidden - user lacks permissions
        return Promise.reject({
          message: 'You do not have permission to perform this action.',
          status: 403,
        });
      } else {
        // Other error responses
        const message = (data as any)?.message || 'An error occurred.';
        return Promise.reject({
          message,
          status,
        });
      }
    } else if (error.code === 'ECONNABORTED' || !error.response) {
      // Network error
      return Promise.reject({
        message: 'Unable to connect to the server. Please check your internet connection.',
      });
    } else {
      // Other errors
      return Promise.reject({
        message: 'An unexpected error occurred.',
      });
    }
  }
);

export default apiClient;