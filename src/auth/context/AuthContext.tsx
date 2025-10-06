import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { UserType } from '../../types/user';
import FirebaseAuthService, { FirebaseUser } from '../services/firebaseAuthService';
import { apiClient } from '../../services/apiClient';

// User interface that combines Firebase user with app-specific data
interface User {
  // Firebase fields
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  
  // App-specific fields (to be populated from backend)
  id?: number;
  first_name?: string;
  last_name?: string;
  is_active?: boolean;
  is_staff?: boolean;
  is_superuser?: boolean;
  date_joined?: string;
  last_login?: string;
  user_type?: UserType;
  is_onboarding_complete?: boolean;
  
  // Computed field for consistency
  name?: string;
}

interface UserRole {
  role: string;
  permissions: string[];
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  userRole: UserRole | null;
  loading: boolean;
  firebaseUser: FirebaseUser | null;
  setUser: (user: User | null) => void;
  updateUserProfile: (profileData: Partial<User>) => void;
  logout: () => Promise<void>;
  getIdToken: (forceRefresh?: boolean) => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  userRole: null,
  loading: true,
  firebaseUser: null,
  setUser: () => { },
  updateUserProfile: () => { },
  logout: async () => { },
  getIdToken: async () => null,
});

// Input sanitization utility
const sanitizeInput = (input: string): string => {
  return input.replace(/[<>]/g, '').trim();
};

// Secure storage utilities
const secureStorage = {
  setItem: (key: string, value: string) => {
    try {
      const sanitizedValue = sanitizeInput(value);
      sessionStorage.setItem(key, sanitizedValue);
    } catch (error) {
      console.error('Failed to store data:', error);
    }
  },

  getItem: (key: string): string | null => {
    try {
      return sessionStorage.getItem(key);
    } catch (error) {
      console.error('Failed to retrieve data:', error);
      return null;
    }
  },

  removeItem: (key: string) => {
    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to remove data:', error);
    }
  },

  clear: () => {
    try {
      sessionStorage.clear();
    } catch (error) {
      console.error('Failed to clear storage:', error);
    }
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  // Convert Firebase user to app user
  const convertFirebaseUserToAppUser = (fbUser: FirebaseUser): User => {
    const firstName = fbUser.displayName?.split(' ')[0] || '';
    const lastName = fbUser.displayName?.split(' ').slice(1).join(' ') || '';
    
    return {
      uid: fbUser.uid,
      email: fbUser.email,
      displayName: fbUser.displayName,
      photoURL: fbUser.photoURL,
      emailVerified: fbUser.emailVerified,
      // App-specific fields will be populated from backend
      first_name: firstName,
      last_name: lastName,
      name: fbUser.displayName || `${firstName} ${lastName}`.trim(), // Computed name field
      is_active: true,
      is_staff: false,
      is_superuser: false,
    };
  };

  // Initialize Firebase auth state listener
  useEffect(() => {
    const unsubscribe = FirebaseAuthService.onAuthStateChanged(async (fbUser) => {
      setLoading(true);
      setFirebaseUser(fbUser);
      
      if (fbUser) {
        try {
          // Get Firebase ID token and set it in API client
          const idToken = await FirebaseAuthService.getIdToken();
          if (idToken) {
            apiClient.setAuthToken(idToken);
            secureStorage.setItem('auth_token', idToken);
            console.log('🔐 Firebase token set in ApiClient');
          }
          
          // Convert Firebase user to app user
          const appUser = convertFirebaseUserToAppUser(fbUser);
          
          // Store user data in session storage
          secureStorage.setItem('user', JSON.stringify(appUser));
          secureStorage.setItem('firebaseUser', JSON.stringify(fbUser));
          
          setUser(appUser);
          
          // Set default user role (can be updated from backend)
          const defaultRole: UserRole = {
            role: 'user',
            permissions: ['read'],
          };
          setUserRole(defaultRole);
          
          // TODO: Fetch additional user data from backend using the ID token
          // This is where you would call your backend API to get user profile data
          // Example:
          // const backendUserData = await fetchUserProfileFromBackend(idToken);
          // setUser({ ...appUser, ...backendUserData });
          
        } catch (error) {
          console.error('Error processing authenticated user:', error);
          await logout();
        }
      } else {
        // User is signed out
        apiClient.setAuthToken(null); // Clear token from API client
        setUser(null);
        setUserRole(null);
        secureStorage.clear();
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Get ID token
  const getIdToken = async (forceRefresh = false): Promise<string | null> => {
    try {
      if (!firebaseUser) return null;
      const token = await FirebaseAuthService.getIdToken(forceRefresh);
      if (token) {
        // Update the API client with the fresh token
        apiClient.setAuthToken(token);
        secureStorage.setItem('auth_token', token);
      }
      return token;
    } catch (error) {
      console.error('Failed to get ID token:', error);
      return null;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await FirebaseAuthService.logout();
      apiClient.setAuthToken(null); // Clear token from API client
      secureStorage.clear();
      setUser(null);
      setFirebaseUser(null);
      setUserRole(null);
    } catch (error) {
      console.error('Logout error:', error);
      // Force clear local state even if Firebase logout fails
      apiClient.setAuthToken(null); // Clear token from API client
      secureStorage.clear();
      setUser(null);
      setFirebaseUser(null);
      setUserRole(null);
    }
  };

  // Update user profile (for app-specific data)
  const updateUserProfile = (profileData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...profileData };
      setUser(updatedUser);
      secureStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  // Update user data
  const handleSetUser = (newUser: User | null) => {
    setUser(newUser);
    if (newUser) {
      try {
        secureStorage.setItem('user', JSON.stringify(newUser));
      } catch (error) {
        console.error('Failed to store user data:', error);
      }
    } else {
      secureStorage.removeItem('user');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!user && !!firebaseUser,
        user,
        userRole,
        loading,
        firebaseUser,
        setUser: handleSetUser,
        updateUserProfile,
        logout,
        getIdToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Export types for use in other components
export type { User, UserRole };
