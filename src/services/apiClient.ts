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
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  console.error('❌ VITE_API_BASE_URL environment variable is not set');
  throw new Error('API Base URL is required');
}

console.log('🌐 API Base URL:', API_BASE_URL);

const API_CONFIG = {
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

class ApiClient {
  private instance: AxiosInstance;
  private static _instance: ApiClient;
  private currentToken: string | null = null;

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

  // Method to set token from AuthContext
  public setAuthToken(token: string | null): void {
    this.currentToken = token;
    if (token) {
      console.log('🔑 Auth token updated in ApiClient');
    } else {
      console.log('🚫 Auth token cleared from ApiClient');
    }
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
            console.log('🔐 Authorization header set with token preview:', token.substring(0, 50) + '...');
          } else {
            console.warn('⚠️ No auth token available for request to:', config.url);
          }
        } catch (error) {
          console.warn('❌ Failed to attach auth token:', error);
        }
        
        // Log request in development
        if (import.meta.env.VITE_DEBUG_MODE === 'true') {
          console.log('🌐 API Request:', {
            method: config.method?.toUpperCase(),
            url: config.url,
            hasAuth: !!config.headers.Authorization,
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
      // Method 0: Use token set directly by AuthContext
      if (this.currentToken && this.currentToken !== 'null' && this.currentToken !== 'undefined') {
        console.log('🎯 Using token set by AuthContext');
        return this.currentToken;
      }
      
      // Method 1: Check sessionStorage for stored tokens
      let token = sessionStorage.getItem('auth_token') || sessionStorage.getItem('firebase_token_temp');
      
      if (token && token !== 'null' && token !== 'undefined') {
        console.log('📱 Using stored token from sessionStorage');
        this.currentToken = token; // Cache it
        return token;
      }
      
      // Method 2: Try to get Firebase token directly
      try {
        const { firebaseAuth } = await import('../auth/config/firebase');
        const currentUser = firebaseAuth.currentUser;
        
        if (currentUser) {
          console.log('🔥 Getting fresh Firebase token for user:', currentUser.email);
          token = await currentUser.getIdToken(true); // Force refresh
          
          if (token) {
            // Store both tokens for future use
            sessionStorage.setItem('firebase_token_temp', token);
            sessionStorage.setItem('auth_token', token);
            this.currentToken = token; // Cache it
            console.log('✅ Fresh Firebase token obtained and stored');
            return token;
          }
        } else {
          console.warn('⚠️ No Firebase user found');
        }
      } catch (firebaseError) {
        console.warn('❌ Could not get Firebase token:', firebaseError);
      }
      
      // Method 3: Try to use AuthContext if available (in React components)
      try {
        // This won't work in the service layer, but let's try anyway
        if (typeof window !== 'undefined' && (window as any).__authToken) {
          token = (window as any).__authToken;
          console.log('🪟 Using token from window.__authToken');
          this.currentToken = token; // Cache it
          return token;
        }
      } catch (contextError) {
        console.warn('❌ Could not get token from context:', contextError);
      }
      
      console.warn('🚫 No authentication token found through any method');
      return null;
      
    } catch (error) {
      console.error('💥 Error getting auth token:', error);
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
    // Clear stored tokens from session storage
    sessionStorage.clear();
    
    // Sign out from Firebase
    try {
      import('../auth/config/firebase').then(({ firebaseAuth }) => {
        firebaseAuth.signOut();
      });
    } catch (error) {
      console.warn('Could not sign out from Firebase:', error);
    }
    
    // Redirect to login page (will be handled by React Router in the app)
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
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

  // File upload method with additional data
  public async uploadFileWithData<T = any>(
    url: string, 
    file: File, 
    additionalData: Record<string, any> = {},
    onUploadProgress?: (progress: number) => void
  ): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);
    
    // Append additional data to form
    Object.keys(additionalData).forEach(key => {
      formData.append(key, additionalData[key]);
    });

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

  // Debug method to get current base URL
  public getBaseURL(): string {
    return API_BASE_URL;
  }

  // Debug method to log current configuration
  public debugConfig(): void {
    console.log('🔧 ApiClient Configuration:', {
      baseURL: API_BASE_URL,
      timeout: API_CONFIG.timeout,
      headers: API_CONFIG.headers,
      currentToken: this.currentToken ? `${this.currentToken.substring(0, 20)}...` : 'No token',
    });
  }
}

// Export singleton instance
export const apiClient = ApiClient.getInstance();
export default apiClient;

// Export configuration for debugging
export const getApiBaseURL = (): string => API_BASE_URL;
export const debugApiConfig = (): void => apiClient.debugConfig();
