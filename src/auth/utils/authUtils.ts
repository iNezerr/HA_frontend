/**
 * Authentication Utilities
 * Helper functions for authentication flow
 */

// Check if user has a valid session
export const hasValidSession = (): boolean => {
  try {
    const token = sessionStorage.getItem('auth_token');
    return !!token;
  } catch (error) {
    console.error('Error checking session:', error);
    return false;
  }
};

// Clear all authentication data
export const clearAuthSession = (): void => {
  try {
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('firebaseUser');
  } catch (error) {
    console.error('Error clearing auth session:', error);
  }
};

// Get session token
export const getSessionToken = (): string | null => {
  try {
    return sessionStorage.getItem('auth_token');
  } catch (error) {
    console.error('Error getting session token:', error);
    return null;
  }
};

// Set session token
export const setSessionToken = (token: string): void => {
  try {
    sessionStorage.setItem('auth_token', token);
  } catch (error) {
    console.error('Error setting session token:', error);
  }
};
