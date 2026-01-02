import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { User } from '../types';
import { login as apiLogin, logout as apiLogout, me as apiMe, getToken, clearToken, requestPasswordReset } from '../lib/apiClient';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  initiatePasswordReset: (email: string) => Promise<boolean>;
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing token on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = getToken();
      if (token) {
        try {
          const response = await apiMe();
          // Map the API response to our User type
          const userData = response.data?.attributes || response.data || response;
          const mappedUser: User = {
            id: String(response.data?.id || userData.id),
            email: userData.email,
            name: userData.name,
            role: (userData.roles?.[0] as User['role']) || 'employee',
            verified: true,
          };
          setUser(mappedUser);
        } catch (error) {
          console.error('Failed to restore session:', error);
          clearToken();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    try {
      await apiLogin(email, password);

      // Fetch user profile after login
      const response = await apiMe();
      const userData = response.data?.attributes || response.data || response;
      const mappedUser: User = {
        id: String(response.data?.id || userData.id),
        email: userData.email,
        name: userData.name,
        role: (userData.roles?.[0] as User['role']) || 'employee',
        verified: true,
      };
      setUser(mappedUser);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiLogout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
  };

  const initiatePasswordReset = async (email: string): Promise<boolean> => {
    try {
      const response = await requestPasswordReset(email);
      // Store email for reset page
      sessionStorage.setItem('resetEmail', email);
      return response.exists !== false;
    } catch (error) {
      console.error('Password reset error:', error);
      // Still return true for security - don't reveal if email exists
      sessionStorage.setItem('resetEmail', email);
      return true;
    }
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, login, logout, initiatePasswordReset, loading, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { AuthContext };