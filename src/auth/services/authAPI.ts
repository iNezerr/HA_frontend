/**
 * Authentication API Service
 * Handles all authentication-related API calls
 */

import { apiClient } from '../../services/apiClient';

// Types for authentication
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  displayName: string;
  userType: 'job' | 'scholarship' | 'grant';
}

export interface AuthResponse {
  user: {
    uid: string;
    email: string;
    displayName: string;
    userType: string;
    isOnboarded: boolean;
  };
  token: string;
  refreshToken: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface TokenRefreshRequest {
  refreshToken: string;
}

export interface VerifyTokenRequest {
  token: string;
}

// Authentication API Service
export class AuthAPI {
  private static readonly BASE_PATH = '/auth';

  /**
   * User login
   */
  static async login(credentials: LoginRequest): Promise<AuthResponse> {
    return apiClient.post(`${this.BASE_PATH}/login`, credentials);
  }

  /**
   * User registration
   */
  static async register(userData: RegisterRequest): Promise<AuthResponse> {
    return apiClient.post(`${this.BASE_PATH}/register`, userData);
  }

  /**
   * User logout
   */
  static async logout(): Promise<void> {
    return apiClient.post(`${this.BASE_PATH}/logout`);
  }

  /**
   * Refresh authentication token
   */
  static async refreshToken(refreshData: TokenRefreshRequest): Promise<AuthResponse> {
    return apiClient.post(`${this.BASE_PATH}/refresh`, refreshData);
  }

  /**
   * Send password reset email
   */
  static async sendPasswordResetEmail(resetData: PasswordResetRequest): Promise<void> {
    return apiClient.post(`${this.BASE_PATH}/password-reset`, resetData);
  }

  /**
   * Verify authentication token
   */
  static async verifyToken(tokenData: VerifyTokenRequest): Promise<{ valid: boolean; user?: any }> {
    return apiClient.post(`${this.BASE_PATH}/verify-token`, tokenData);
  }

  /**
   * Send email verification
   */
  static async sendEmailVerification(): Promise<void> {
    return apiClient.post(`${this.BASE_PATH}/send-verification`);
  }

  /**
   * Verify email address
   */
  static async verifyEmail(verificationCode: string): Promise<void> {
    return apiClient.post(`${this.BASE_PATH}/verify-email`, { code: verificationCode });
  }

  /**
   * Check if user exists by email
   */
  static async checkUserExists(email: string): Promise<{ exists: boolean }> {
    return apiClient.get(`${this.BASE_PATH}/check-user?email=${encodeURIComponent(email)}`);
  }

  /**
   * Get current user info (requires authentication)
   */
  static async getCurrentUser(): Promise<AuthResponse['user']> {
    return apiClient.get(`${this.BASE_PATH}/me`);
  }
}

export default AuthAPI;
