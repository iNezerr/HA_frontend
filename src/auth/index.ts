/**
 * Authentication Module Export
 * Central export point for all authentication-related functionality
 */

// Firebase Configuration and Services
export { default as firebaseApp, firebaseConfig, firebaseAuth, googleProvider } from './config/firebase';
export { default as FirebaseAuthService } from './services/firebaseAuthService';
export type { FirebaseUser, RegisterWithEmailParams, LoginWithEmailParams } from './services/firebaseAuthService';

// API Services
export { default as AuthAPI } from './services/authAPI';
export type { 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse,
  PasswordResetRequest,
  TokenRefreshRequest,
  VerifyTokenRequest 
} from './services/authAPI';

// React Context
export { AuthProvider, useAuth as useAuthContext } from './context/AuthContext';
export type { User, UserRole } from './context/AuthContext';

// Hooks
export { default as useAuth } from './hooks/useAuth';
export type { UseAuthOptions, UseAuthResult } from './hooks/useAuth';

// Components
export { default as ProtectedRoute } from './components/ProtectedRoute';
export { default as RegisterForm } from './components/RegisterForm';

// Auth pages (if they exist)
export { default as Login } from './pages/Login';
export { default as Signup } from './pages/Signup';
