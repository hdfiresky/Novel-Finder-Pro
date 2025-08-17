
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { User } from '../types';
// STEP 1: Uncomment this line to use Supabase
import { supabase } from '../supabase/client';

// Mock user storage keys
const USERS_STORAGE_KEY = 'novel_finder_users';
const SESSION_STORAGE_KEY = 'novel_finder_session';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // --- LOCAL STORAGE IMPLEMENTATION (Current) ---
  /*
  useEffect(() => {
    try {
      // Give a slight delay to show loading state, mimics real-world app loading
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

  const register = async (username: string, email: string, password: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => { // Simulate API delay
        const storedUsers = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]');
        if (storedUsers.some((u: User) => u.email === email)) {
          return reject(new Error('An account with this email already exists.'));
        }
        if (storedUsers.some((u: User) => u.username === username)) {
          return reject(new Error('This username is already taken.'));
        }

        const newUser = {
          id: `user-${Date.now()}`,
          username,
          email,
          // NOTE: btoa is not a secure way to store passwords. This is for demonstration purposes only.
          // In a real application, use a proper hashing algorithm on the backend.
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

  const logout = () => {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    setUser(null);
  };
  */
  // --- END OF LOCAL STORAGE IMPLEMENTATION ---


  // --- SUPABASE IMPLEMENTATION (Commented Out) ---
  // STEP 2: Comment out the entire "LOCAL STORAGE IMPLEMENTATION" block above.
  // STEP 3: Uncomment the "SUPABASE IMPLEMENTATION" block below.

  useEffect(() => {
    // Fetch initial session
    const getSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('username')
                .eq('id', session.user.id)
                .single();
            
            setUser({
                id: session.user.id,
                email: session.user.email!,
                username: profile?.username || 'No Username'
            });
        }
        setLoading(false);
    };
    
    getSession();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('username')
                .eq('id', session.user.id)
                .single();
            
             setUser({
                id: session.user.id,
                email: session.user.email!,
                username: profile?.username || 'No Username'
            });
        } else {
            setUser(null);
        }
        setLoading(false);
    });

    return () => {
        authListener?.subscription.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
  };

  const register = async (username, email, password) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // This data is passed to the trigger that creates the profile row
        data: {
          username: username,
        },
      },
    });
    if (error) throw new Error(error.message);
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
  };
  // --- END OF SUPABASE IMPLEMENTATION ---


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