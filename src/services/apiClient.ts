/**
 * Base API Client for HuesApply MVP
 * Handles centralized API communication with authentication, error handling, and interceptors
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// Types for API responses
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
  status: number;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  errors?: Record<string, string[]>;
}

// Environment configuration
const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://backend.huesapply.com',
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

class ApiClient {
  private instance: AxiosInstance;
  private static _instance: ApiClient;

  private constructor() {
    this.instance = axios.create(API_CONFIG);
    this.setupInterceptors();
  }

  // Singleton pattern
  public static getInstance(): ApiClient {
    if (!ApiClient._instance) {
      ApiClient._instance = new ApiClient();
    }
    return ApiClient._instance;
  }

  private setupInterceptors(): void {
    // Request interceptor - attach auth token
    this.instance.interceptors.request.use(
      async (config) => {
        try {
          // Get Firebase ID token from the auth context/service
          const token = await this.getAuthToken();
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch (error) {
          console.warn('Failed to attach auth token:', error);
        }
        
        // Log request in development
        if (import.meta.env.VITE_DEBUG_MODE === 'true') {
          console.log('API Request:', {
            method: config.method?.toUpperCase(),
            url: config.url,
            data: config.data,
          });
        }
        
        return config;
      },
      (error) => {
        return Promise.reject(this.handleError(error));
      }
    );

    // Response interceptor - handle common responses and errors
    this.instance.interceptors.response.use(
      (response: AxiosResponse): any => {
        // Log response in development
        if (import.meta.env.VITE_DEBUG_MODE === 'true') {
          console.log('API Response:', {
            status: response.status,
            url: response.config.url,
            data: response.data,
          });
        }

        // Return clean response data
        return response.data;
      },
      async (error: AxiosError) => {
        return Promise.reject(await this.handleResponseError(error));
      }
    );
  }

  private async getAuthToken(): Promise<string | null> {
    try {
      // This will be implemented when Firebase auth is fully integrated
      // For now, try to get from localStorage or sessionStorage
      const token = localStorage.getItem('firebase_token') || sessionStorage.getItem('firebase_token');
      return token;
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  private async handleResponseError(error: AxiosError): Promise<ApiError> {
    const status = error.response?.status;
    const responseData = error.response?.data as any;

    // Handle different error scenarios
    switch (status) {
      case 401:
        // Token expired or invalid - redirect to login
        this.handleAuthError();
        return {
          message: 'Your session has expired. Please log in again.',
          status: 401,
          code: 'AUTH_EXPIRED',
        };

      case 403:
        return {
          message: 'You do not have permission to access this resource.',
          status: 403,
          code: 'FORBIDDEN',
        };

      case 404:
        return {
          message: responseData?.message || 'The requested resource was not found.',
          status: 404,
          code: 'NOT_FOUND',
        };

      case 422:
        return {
          message: responseData?.message || 'Invalid data provided.',
          status: 422,
          code: 'VALIDATION_ERROR',
          errors: responseData?.errors,
        };

      case 500:
        return {
          message: 'An internal server error occurred. Please try again later.',
          status: 500,
          code: 'SERVER_ERROR',
        };

      default:
        // Network or other errors
        if (!error.response) {
          return {
            message: 'Network error. Please check your connection and try again.',
            code: 'NETWORK_ERROR',
          };
        }

        return {
          message: responseData?.message || 'An unexpected error occurred.',
          status: status,
          code: 'UNKNOWN_ERROR',
        };
    }
  }

  private handleError(error: any): ApiError {
    return {
      message: error.message || 'An unexpected error occurred.',
      code: 'REQUEST_ERROR',
    };
  }

  private handleAuthError(): void {
    // Clear stored tokens
    localStorage.removeItem('firebase_token');
    sessionStorage.removeItem('firebase_token');
    
    // Redirect to login page
    // This will be integrated with React Router
    window.location.href = '/auth/login';
  }

  // HTTP Methods
  public async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.get(url, config);
  }

  public async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.post(url, data, config);
  }

  public async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.put(url, data, config);
  }

  public async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.patch(url, data, config);
  }

  public async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.delete(url, config);
  }

  // File upload method
  public async uploadFile<T = any>(
    url: string, 
    file: File, 
    onUploadProgress?: (progress: number) => void
  ): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);

    return this.instance.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onUploadProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onUploadProgress(progress);
        }
      },
    });
  }

  // Get axios instance for custom configurations
  public getAxiosInstance(): AxiosInstance {
    return this.instance;
  }
}

// Export singleton instance
export const apiClient = ApiClient.getInstance();
export default apiClient;
