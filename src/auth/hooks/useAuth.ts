/**
 * Authentication Hook
 * Manages authentication state and provides auth-related operations
 */

import { useCallback } from 'react';
import { useAPI } from '../../hooks/useAPI';
import { useMutation } from '../../hooks/useMutation';
import { AuthAPI, AuthResponse, LoginRequest, RegisterRequest } from '../services/authAPI';
import { ApiError } from '../../services/apiClient';

export interface UseAuthOptions {
  onLoginSuccess?: (user: AuthResponse['user']) => void;
  onLogoutSuccess?: () => void;
  onAuthError?: (error: ApiError) => void;
}

export interface UseAuthResult {
  // State
  user: AuthResponse['user'] | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: ApiError | null;
  
  // Actions
  login: (credentials: LoginRequest) => Promise<AuthResponse>;
  register: (userData: RegisterRequest) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  
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
}

export function useAuth(options: UseAuthOptions = {}): UseAuthResult {
  const { onLoginSuccess, onLogoutSuccess, onAuthError } = options;

  // Get current user info
  const {
    data: user,
    isLoading: isCheckingAuth,
    error: authError,
    refetch: refreshAuth,
  } = useAPI(
    () => AuthAPI.getCurrentUser(),
    'current-user',
    {
      enabled: true,
      refetchOnMount: true,
      refetchOnWindowFocus: true,
      staleTime: 10 * 60 * 1000, // 10 minutes
      onError: onAuthError,
    }
  );

  // Login mutation
  const loginMutation = useMutation(
    (credentials: LoginRequest) => AuthAPI.login(credentials),
    {
      onSuccess: async (data: AuthResponse) => {
        // Store token
        localStorage.setItem('firebase_token', data.token);
        if (data.refreshToken) {
          localStorage.setItem('refresh_token', data.refreshToken);
        }
        
        // Refresh user data
        await refreshAuth();
        
        onLoginSuccess?.(data.user);
      },
      onError: onAuthError,
    }
  );

  // Register mutation
  const registerMutation = useMutation(
    (userData: RegisterRequest) => AuthAPI.register(userData),
    {
      onSuccess: async (data: AuthResponse) => {
        // Store token
        localStorage.setItem('firebase_token', data.token);
        if (data.refreshToken) {
          localStorage.setItem('refresh_token', data.refreshToken);
        }
        
        // Refresh user data
        await refreshAuth();
        
        onLoginSuccess?.(data.user);
      },
      onError: onAuthError,
    }
  );

  // Logout mutation
  const logoutMutation = useMutation(
    () => AuthAPI.logout(),
    {
      onSuccess: () => {
        // Clear stored tokens
        localStorage.removeItem('firebase_token');
        localStorage.removeItem('refresh_token');
        sessionStorage.removeItem('firebase_token');
        
        onLogoutSuccess?.();
      },
      onSettled: () => {
        // Always refresh auth state after logout attempt
        refreshAuth();
      },
      onError: onAuthError,
    }
  );

  // Action functions
  const login = useCallback(async (credentials: LoginRequest): Promise<AuthResponse> => {
    return loginMutation.mutate(credentials);
  }, [loginMutation.mutate]);

  const register = useCallback(async (userData: RegisterRequest): Promise<AuthResponse> => {
    return registerMutation.mutate(userData);
  }, [registerMutation.mutate]);

  const logout = useCallback(async (): Promise<void> => {
    return logoutMutation.mutate(undefined);
  }, [logoutMutation.mutate]);

  const isAuthenticated = Boolean(user && !authError);
  const isLoading = isCheckingAuth || loginMutation.isLoading || registerMutation.isLoading || logoutMutation.isLoading;
  const error = authError || loginMutation.error || registerMutation.error || logoutMutation.error;

  return {
    // State
    user,
    isAuthenticated,
    isLoading,
    error,
    
    // Actions
    login,
    register,
    logout,
    refreshAuth,
    
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
  };
}

export default useAuth;
