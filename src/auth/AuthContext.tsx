import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { setAccessToken, clearAuth } from '@/api/axios';
import { authApi } from '@/api/client';
import type { User, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Restore access token from localStorage if it exists
        const storedToken = localStorage.getItem('accessToken');
        const storedUser = localStorage.getItem('user');
        
        if (storedToken && storedUser) {
          // Set the token in axios client
          setAccessToken(storedToken);
          
          // Try to get fresh profile to verify token is still valid
          try {
            const profile = await authApi.getProfile();
            // Verify profile has required fields
            if (profile && profile.id && profile.role) {
              setUser(profile);
              localStorage.setItem('user', JSON.stringify(profile));
              localStorage.setItem('userRole', profile.role);
            } else {
              // Invalid profile data
              console.error('Invalid profile data received:', profile);
              setUser(null);
              clearAuth();
            }
          } catch (profileError: any) {
            // Token expired or invalid
            console.log('Token validation failed:', profileError);
            
            // Clear auth state immediately - set user to null FIRST
            setUser(null);
            clearAuth();
            
            // If it's a 401 error, the axios interceptor might try to refresh
            // But during initialization, we'll just clear and let ProtectedRoute handle redirect
            // If refresh fails, the interceptor will redirect to /login
          }
        } else {
          // No stored token or user, clear everything
          clearAuth();
          setUser(null);
        }
      } catch (error) {
        // Any error during initialization, clear stored data
        console.error('Auth initialization error:', error);
        clearAuth();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await authApi.login({ username, password });
      
      // Store access token in memory
      setAccessToken(response.accessToken);
      
      // Store user info (minimal data, no sensitive tokens)
      setUser(response.user);
      localStorage.setItem('user', JSON.stringify(response.user));
      localStorage.setItem('userRole', response.user.role);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuth();
      setUser(null);
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Helper hook to check user role
export const useRequireRole = (requiredRole: UserRole): boolean => {
  const { user } = useAuth();
  return user?.role === requiredRole;
};

// Helper hook to check if user has any of the specified roles
export const useHasRole = (roles: UserRole[]): boolean => {
  const { user } = useAuth();
  return user ? roles.includes(user.role) : false;
};

