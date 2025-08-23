/**
 * Authentication Hook
 * Manages authentication state and provides auth-related operations using Firebase
 */

import { useCallback } from 'react';
import { useAuth as useAuthContext } from '../context/AuthContext';
import { useMutation } from '../../hooks/useMutation';
import { AuthAPI, AuthResponse, LoginRequest, RegisterRequest } from '../services/authAPI';
import FirebaseAuthService from '../services/firebaseAuthService';
import { ApiError } from '../../services/apiClient';

export interface UseAuthOptions {
  onLoginSuccess?: (user: AuthResponse['user']) => void;
  onLogoutSuccess?: () => void;
  onAuthError?: (error: ApiError) => void;
}

export interface UseAuthResult {
  // State from context
  user: AuthResponse['user'] | null;
  isAuthenticated: boolean;
  loading: boolean;
  
  // Actions
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  sendEmailVerification: () => Promise<void>;
  
  // Mutation states
  loginMutation: {
    isLoading: boolean;
    error: ApiError | null;
    isSuccess: boolean;
  };
  registerMutation: {
    isLoading: boolean;
    error: ApiError | null;
    isSuccess: boolean;
  };
  logoutMutation: {
    isLoading: boolean;
    error: ApiError | null;
    isSuccess: boolean;
  };
  passwordResetMutation: {
    isLoading: boolean;
    error: ApiError | null;
    isSuccess: boolean;
  };
  emailVerificationMutation: {
    isLoading: boolean;
    error: ApiError | null;
    isSuccess: boolean;
  };
}

export function useAuth(options: UseAuthOptions = {}): UseAuthResult {
  const { onLoginSuccess, onLogoutSuccess, onAuthError } = options;
  const authContext = useAuthContext();

  // Login mutation
  const loginMutation = useMutation(
    async (credentials: LoginRequest) => {
      const response = await AuthAPI.login(credentials);
      return response;
    },
    {
      onSuccess: (data: AuthResponse) => {
        onLoginSuccess?.(data.user);
      },
      onError: (error: ApiError) => {
        console.error('Login error:', error);
        onAuthError?.(error);
      },
    }
  );

  // Register mutation
  const registerMutation = useMutation(
    async (userData: RegisterRequest) => {
      const response = await AuthAPI.register(userData);
      return response;
    },
    {
      onSuccess: (data: AuthResponse) => {
        onLoginSuccess?.(data.user);
      },
      onError: (error: ApiError) => {
        console.error('Registration error:', error);
        onAuthError?.(error);
      },
    }
  );

  // Logout mutation
  const logoutMutation = useMutation(
    async () => {
      await authContext.logout();
    },
    {
      onSuccess: () => {
        onLogoutSuccess?.();
      },
      onError: (error: ApiError) => {
        console.error('Logout error:', error);
        onAuthError?.(error);
      },
    }
  );

  // Password reset mutation
  const passwordResetMutation = useMutation(
    async (email: string) => {
      await FirebaseAuthService.sendPasswordResetEmail(email);
    },
    {
      onError: (error: ApiError) => {
        console.error('Password reset error:', error);
        onAuthError?.(error);
      },
    }
  );

  // Email verification mutation
  const emailVerificationMutation = useMutation(
    async () => {
      await FirebaseAuthService.sendEmailVerification();
    },
    {
      onError: (error: ApiError) => {
        console.error('Email verification error:', error);
        onAuthError?.(error);
      },
    }
  );

  // Action functions
  const login = useCallback(async (credentials: LoginRequest): Promise<void> => {
    await loginMutation.mutate(credentials);
  }, [loginMutation.mutate]);

  const register = useCallback(async (userData: RegisterRequest): Promise<void> => {
    await registerMutation.mutate(userData);
  }, [registerMutation.mutate]);

  const logout = useCallback(async (): Promise<void> => {
    await logoutMutation.mutate(undefined);
  }, [logoutMutation.mutate]);

  const sendPasswordReset = useCallback(async (email: string): Promise<void> => {
    await passwordResetMutation.mutate(email);
  }, [passwordResetMutation.mutate]);

  const sendEmailVerification = useCallback(async (): Promise<void> => {
    await emailVerificationMutation.mutate(undefined);
  }, [emailVerificationMutation.mutate]);

  // Convert context user to API response format
  const user = authContext.user ? {
    uid: authContext.user.uid,
    email: authContext.user.email || '',
    displayName: authContext.user.displayName || '',
    userType: authContext.user.user_type || 'job',
    isOnboarded: authContext.user.is_onboarding_complete || false,
    emailVerified: authContext.user.emailVerified,
  } : null;

  return {
    // State
    user,
    isAuthenticated: authContext.isAuthenticated,
    loading: authContext.loading,
    
    // Actions
    login,
    register,
    logout,
    sendPasswordReset,
    sendEmailVerification,
    
    // Mutation states
    loginMutation: {
      isLoading: loginMutation.isLoading,
      error: loginMutation.error,
      isSuccess: loginMutation.isSuccess,
    },
    registerMutation: {
      isLoading: registerMutation.isLoading,
      error: registerMutation.error,
      isSuccess: registerMutation.isSuccess,
    },
    logoutMutation: {
      isLoading: logoutMutation.isLoading,
      error: logoutMutation.error,
      isSuccess: logoutMutation.isSuccess,
    },
    passwordResetMutation: {
      isLoading: passwordResetMutation.isLoading,
      error: passwordResetMutation.error,
      isSuccess: passwordResetMutation.isSuccess,
    },
    emailVerificationMutation: {
      isLoading: emailVerificationMutation.isLoading,
      error: emailVerificationMutation.error,
      isSuccess: emailVerificationMutation.isSuccess,
    },
  };
}

export default useAuth;
