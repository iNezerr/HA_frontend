// Authentication module exports
export { AuthProvider, useAuth } from './context/AuthContext';
export type { User, UserRole } from './context/AuthContext';

// Auth components
export { default as ProtectedRoute } from './components/ProtectedRoute';
export { default as RegisterForm } from './components/RegisterForm';

// Auth pages
export { default as Login } from './pages/Login';
export { default as Signup } from './pages/Signup';

// Auth services
export { default as FirebaseAuthService } from './services/authService';
export type { AuthUser, AuthError } from './services/authService';

// New API-based auth services
export { default as AuthAPI } from './services/authAPI';
export { default as useAuthAPI } from './hooks/useAuth';
export type * from './services/authAPI';
export type * from './hooks/useAuth';

// Auth config
export { default as firebaseConfig } from './config/firebase';
