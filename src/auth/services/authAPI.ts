/**
 * Authentication API Service
 * Handles authentication-related API calls between Firebase and backend
 */

import { apiClient } from '../../services/apiClient';
import FirebaseAuthService from './firebaseAuthService';

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
    emailVerified: boolean;
  };
  token: string;
  refreshToken?: string;
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

export interface BackendUserData {
  user_type: 'job' | 'scholarship' | 'grant';
  is_onboarding_complete: boolean;
  profile_data?: any;
  preferences?: any;
}

// Authentication API Service
export class AuthAPI {
  /**
   * User login - Firebase auth + backend session creation
   */
  static async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      // First authenticate with Firebase
      const firebaseUser = await FirebaseAuthService.loginWithEmail({
        email: credentials.email,
        password: credentials.password,
      });

      // Get Firebase ID token
      const idToken = await FirebaseAuthService.getIdToken();

      // Send Firebase token to backend for session creation
      const response = await apiClient.post(`/users/login/`, {
        firebase_token: idToken,
      });

      // Backend returns session token and user data
      if (response.session_token) {
        sessionStorage.setItem('auth_token', response.session_token);
      }

      return {
        user: {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || '',
          userType: response.user.user_type || 'job',
          isOnboarded: response.user.onboarded === true, // Use 'onboarded' field from backend
          emailVerified: firebaseUser.emailVerified,
        },
        token: response.session_token,
      };
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * User registration - creates Firebase user and backend profile
   */
  static async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      // First create user in Firebase
      const firebaseUser = await FirebaseAuthService.registerWithEmail({
        email: userData.email,
        password: userData.password,
        displayName: userData.displayName,
      });

      // Get Firebase ID token
      const idToken = await FirebaseAuthService.getIdToken();

      // Create user profile in backend and get session
      const response = await apiClient.post(`/users/register/`, {
        firebase_token: idToken,
        user_type: userData.userType,
        display_name: userData.displayName,
        email: userData.email,
      });

      // Backend returns session token and user data
      if (response.session_token) {
        sessionStorage.setItem('auth_token', response.session_token);
      }

      return {
        user: {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || '',
          userType: userData.userType,
          isOnboarded: false,
          emailVerified: firebaseUser.emailVerified,
        },
        token: response.session_token,
      };
    } catch (error: any) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  /**
   * User logout - clears session and signs out from Firebase
   */
  static async logout(): Promise<void> {
    try {
      // Notify backend to clear session
      const token = sessionStorage.getItem('auth_token');
      if (token) {
        try {
          await apiClient.post(`/users/logout/`, {}, {
            headers: { Authorization: `Bearer ${token}` }
          });
        } catch (error) {
          console.warn('Backend logout failed:', error);
        }
      }

      // Clear session storage
      sessionStorage.clear();

      // Sign out from Firebase
      await FirebaseAuthService.logout();
    } catch (error: any) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  /**
   * Refresh authentication session
   */
  static async refreshToken(): Promise<AuthResponse> {
    try {
      // Get fresh Firebase token
      const idToken = await FirebaseAuthService.getIdToken(true);
      
      // Send to backend for session refresh
      const response = await apiClient.post(`/users/refresh-session/`, {
        firebase_token: idToken,
      });

      // Update session token
      if (response.session_token) {
        sessionStorage.setItem('auth_token', response.session_token);
      }

      const firebaseUser = FirebaseAuthService.getCurrentUser();
      if (!firebaseUser) {
        throw new Error('No authenticated user found');
      }

      return {
        user: {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || '',
          userType: response.user.user_type || 'job',
          isOnboarded: response.user.onboarded === true, // Use 'onboarded' field from backend
          emailVerified: firebaseUser.emailVerified,
        },
        token: response.session_token,
      };
    } catch (error: any) {
      console.error('Token refresh error:', error);
      throw error;
    }
  }

  /**
   * Send password reset email via Firebase
   */
  static async sendPasswordResetEmail(resetData: PasswordResetRequest): Promise<void> {
    try {
      await FirebaseAuthService.sendPasswordResetEmail(resetData.email);
    } catch (error: any) {
      console.error('Password reset error:', error);
      throw error;
    }
  }

  /**
   * Verify Firebase token with backend
   */
  static async verifyToken(tokenData: VerifyTokenRequest): Promise<{ valid: boolean; user?: any }> {
    try {
      const response = await apiClient.post(`/users/verify-firebase-token/`, tokenData);
      return response;
    } catch (error: any) {
      console.error('Token verification error:', error);
      return { valid: false };
    }
  }

  /**
   * Send email verification via Firebase
   */
  static async sendEmailVerification(): Promise<void> {
    try {
      await FirebaseAuthService.sendEmailVerification();
    } catch (error: any) {
      console.error('Email verification error:', error);
      throw error;
    }
  }

  /**
   * Verify email address (handled by Firebase automatically)
   */
  static async verifyEmail(_verificationCode: string): Promise<void> {
    // Firebase handles email verification automatically when user clicks the link
    // This method is kept for API compatibility but may not be needed
    console.log('Email verification handled by Firebase');
  }

  /**
   * Check if user exists by email (Firebase method)
   */
  static async checkUserExists(email: string): Promise<{ exists: boolean }> {
    try {
      // This would need to be implemented via backend since Firebase doesn't
      // provide a direct way to check user existence without authentication
      const response = await apiClient.get(`/users/check-user/?email=${encodeURIComponent(email)}`);
      return response;
    } catch (error: any) {
      console.error('Check user exists error:', error);
      return { exists: false };
    }
  }

  /**
   * Get current user info from backend session
   */
  static async getCurrentUser(): Promise<AuthResponse['user']> {
    try {
      const token = sessionStorage.getItem('auth_token');
      if (!token) {
        throw new Error('No authentication session available');
      }

      const response = await apiClient.get(`/users/me/`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      return {
        uid: response.firebase_uid,
        email: response.email || '',
        displayName: response.display_name || '',
        userType: response.user_type || 'job',
        isOnboarded: response.is_onboarding_complete || false,
        emailVerified: response.email_verified || false,
      };
    } catch (error: any) {
      console.error('Get current user error:', error);
      throw error;
    }
  }

}

export default AuthAPI;
