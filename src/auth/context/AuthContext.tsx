import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { UserType } from '../../types/user';

// Mock types for UI-only interface
interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  date_joined: string;
  last_login: string;
  user_type?: UserType;
  is_onboarding_complete?: boolean;
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
  setUser: (user: User | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  userRole: null,
  loading: true,
  setUser: () => { },
  logout: () => { },
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
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  // Mock user for UI demo purposes
  const mockUser: User = {
    id: 1,
    email: 'demo@huesapply.com',
    first_name: 'Demo',
    last_name: 'User',
    is_active: true,
    is_staff: false,
    is_superuser: false,
    date_joined: new Date().toISOString(),
    last_login: new Date().toISOString(),
    user_type: undefined,
    is_onboarding_complete: false,
  };

  const mockUserRole: UserRole = {
    role: 'user',
    permissions: ['read'],
  };

  // Initialize user from storage if exists
  useEffect(() => {
    const loadUser = () => {
      try {
        const storedUser = secureStorage.getItem('user');
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            if (parsedUser && typeof parsedUser === 'object' && parsedUser.email) {
              setUser(parsedUser);
              setUserRole(mockUserRole);
            } else {
              // Invalid stored user data, remove it
              secureStorage.removeItem('user');
              setUser(null);
              setUserRole(null);
            }
          } catch (error) {
            console.error("Failed to parse stored user data:", error);
            // Invalid stored user data, remove it
            secureStorage.removeItem('user');
            setUser(null);
            setUserRole(null);
          }
        } else {
          // No stored user, remain logged out
          setUser(null);
          setUserRole(null);
        }
      } catch (error) {
        console.error("Authentication error:", error);
        setUser(null);
        setUserRole(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Logout function
  const logout = () => {
    secureStorage.clear();
    setUser(null);
    setUserRole(null);
    window.location.href = '/';
  };

  // Update user data
  const handleSetUser = (newUser: User | null) => {
    setUser(newUser);
    if (newUser) {
      try {
        if (newUser.email && typeof newUser.email === 'string') {
          secureStorage.setItem('user', JSON.stringify(newUser));
        } else {
          console.error('Invalid user data provided');
        }
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
        isAuthenticated: !!user,
        user,
        userRole,
        loading,
        setUser: handleSetUser,
        logout,
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
