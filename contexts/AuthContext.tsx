

import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { User } from '../types';
// STEP 1: Uncomment this line to use Supabase
// import { supabase } from '../supabase/client';

// Mock user storage keys for the localStorage implementation.
const USERS_STORAGE_KEY = 'novel_finder_users';
const SESSION_STORAGE_KEY = 'novel_finder_session';

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

/**
 * The provider component for the authentication context.
 * It manages the user's authentication state and provides functions for login,
 * registration, and logout. This component should wrap any part of the app
 * that needs access to authentication data.
 *
 * NOTE: This file contains two implementations:
 * 1. A mock implementation using `localStorage` (currently active).
 * 2. A real implementation using Supabase (currently commented out).
 * To switch, follow the steps outlined in `MIGRATE_TO_SUPABASE.md`.
 * @param {object} props The component props.
 * @param {ReactNode} props.children The child components to be rendered within the provider.
 */
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // --- LOCAL STORAGE IMPLEMENTATION (Current) ---
  /**
   * This effect runs on initial mount to check for an active session in localStorage.
   * It simulates an asynchronous check to mimic real-world API latency.
   */
  useEffect(() => {
    try {
      setTimeout(() => {
        const session = localStorage.getItem(SESSION_STORAGE_KEY);
        if (session) {
          setUser(JSON.parse(session));
        }
        setLoading(false);
      }, 250);
    } catch (error) {
      console.error("Failed to parse user session from localStorage", error);
      setUser(null);
      setLoading(false);
    }
  }, []);

  /** Mock login function. */
  const login = async (email: string, password: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => { // Simulate API delay
        const storedUsers = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]');
        const foundUser = storedUsers.find(
          (u: User & { passwordHash: string }) => u.email === email && atob(u.passwordHash) === password
        );
        if (foundUser) {
          const userToSave = { id: foundUser.id, username: foundUser.username, email: foundUser.email };
          localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(userToSave));
          setUser(userToSave);
          resolve();
        } else {
          reject(new Error('Invalid email or password.'));
        }
      }, 500);
    });
  };

  /** Mock registration function. */
  const register = async (username: string, email: string, password: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => { // Simulate API delay
        const storedUsers = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]');
        if (storedUsers.some((u: User) => u.email === email)) return reject(new Error('An account with this email already exists.'));
        if (storedUsers.some((u: User) => u.username === username)) return reject(new Error('This username is already taken.'));

        const newUser = {
          id: `user-${Date.now()}`, username, email,
          // NOTE: btoa is not a secure way to store passwords. This is for demonstration purposes only.
          passwordHash: btoa(password), 
        };
        storedUsers.push(newUser);
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(storedUsers));
        
        const userToSave = { id: newUser.id, username: newUser.username, email: newUser.email };
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(userToSave));
        setUser(userToSave);
        resolve();
      }, 500);
    });
  };

  /** Mock logout function. */
  const logout = () => {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    setUser(null);
  };
  // --- END OF LOCAL STORAGE IMPLEMENTATION ---


  // --- SUPABASE IMPLEMENTATION (Commented Out) ---
  /*
  // STEP 2: Comment out the entire "LOCAL STORAGE IMPLEMENTATION" block above.
  // STEP 3: Uncomment the "SUPABASE IMPLEMENTATION" block below.

  useEffect(() => {
    const getSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
            const { data: profile } = await supabase.from('profiles').select('username').eq('id', session.user.id).single();
            setUser({ id: session.user.id, email: session.user.email!, username: profile?.username || 'No Username' });
        }
        setLoading(false);
    };
    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
            const { data: profile } = await supabase.from('profiles').select('username').eq('id', session.user.id).single();
             setUser({ id: session.user.id, email: session.user.email!, username: profile?.username || 'No Username' });
        } else {
            setUser(null);
        }
        setLoading(false);
    });

    return () => { authListener?.subscription.unsubscribe(); };
  }, []);

  const login = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
  };

  const register = async (username, email, password) => {
    const { error } = await supabase.auth.signUp({
      email, password, options: { data: { username: username } },
    });
    if (error) throw new Error(error.message);
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
  };
  */
  // --- END OF SUPABASE IMPLEMENTATION ---


  const value = { user, loading, login, register, logout };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * A custom hook to easily access the authentication context.
 * Provides access to the current user, loading state, and auth functions.
 * This hook must be used within a component wrapped by `AuthProvider`.
 * @returns {AuthContextType} The authentication context value.
 * @throws {Error} If used outside of an `AuthProvider`.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
