
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { User } from '../types';
import { authApi } from '../services/api';

interface AuthContextType {
  /** The currently authenticated user object, or null if no user is logged in. */
  user: User | null;
  /** A boolean indicating if the initial authentication state is being loaded. */
  loading: boolean;
  /** Function to log in a user. Throws an error on failure. */
  login: (email: string, password: string) => Promise<void>;
  /** Function to register a new user. Throws an error on failure. */
  register: (username: string, email: string, password: string) => Promise<void>;
  /** Function to log out the current user. */
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const sessionUser = await authApi.getSession();
        setUser(sessionUser);
      } catch (error) {
        console.error("Auth initialization failed", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    const user = await authApi.login(email, password);
    setUser(user);
  };

  const register = async (username: string, email: string, password: string): Promise<void> => {
    const user = await authApi.register(username, email, password);
    setUser(user);
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
  };

  const value = { user, loading, login, register, logout };

  return (
    <AuthContext.Provider value={value}>
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
