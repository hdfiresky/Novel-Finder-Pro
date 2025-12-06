
import { CONFIG } from '../config';
import { User, Review, UserSettings } from '../types';

// Storage Keys for Frontend Only Mode
const STORAGE_KEYS = {
  USERS: 'novel_finder_users',
  SESSION: 'novel_finder_session',
  PREFIX: 'novel_finder_'
};

// --- Helper for Backend Requests ---
const request = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('auth_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  } as HeadersInit;

  const response = await fetch(`${CONFIG.API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'API Request Failed');
  }
  return data;
};

// ==========================================
// AUTH SERVICE
// ==========================================

export const authApi = {
  login: async (email: string, password: string): Promise<User> => {
    if (CONFIG.USE_BACKEND) {
      const data = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      localStorage.setItem('auth_token', data.token);
      return data.user;
    } else {
      // Mock Implementation
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const storedUsers = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
          // In a real app, password should be hashed. Here we compare simple strings or base64.
          const foundUser = storedUsers.find(
            (u: any) => u.email === email && atob(u.passwordHash) === password
          );
          if (foundUser) {
            const userToSave = { id: foundUser.id, username: foundUser.username, email: foundUser.email };
            localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(userToSave));
            resolve(userToSave);
          } else {
            reject(new Error('Invalid email or password.'));
          }
        }, 500);
      });
    }
  },

  register: async (username: string, email: string, password: string): Promise<User> => {
    if (CONFIG.USE_BACKEND) {
      const data = await request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, email, password }),
      });
      localStorage.setItem('auth_token', data.token);
      return data.user;
    } else {
      // Mock Implementation
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const storedUsers = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
          if (storedUsers.some((u: any) => u.email === email)) return reject(new Error('An account with this email already exists.'));
          if (storedUsers.some((u: any) => u.username === username)) return reject(new Error('This username is already taken.'));

          const newUser = {
            id: `user-${Date.now()}`, username, email,
            passwordHash: btoa(password), 
          };
          storedUsers.push(newUser);
          localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(storedUsers));
          
          const userToSave = { id: newUser.id, username: newUser.username, email: newUser.email };
          localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(userToSave));
          resolve(userToSave);
        }, 500);
      });
    }
  },

  logout: () => {
    if (CONFIG.USE_BACKEND) {
      localStorage.removeItem('auth_token');
    } else {
      localStorage.removeItem(STORAGE_KEYS.SESSION);
    }
  },

  getSession: async (): Promise<User | null> => {
    if (CONFIG.USE_BACKEND) {
      const token = localStorage.getItem('auth_token');
      if (!token) return null;
      try {
        const data = await request('/auth/me');
        return data.user;
      } catch (e) {
        localStorage.removeItem('auth_token');
        return null;
      }
    } else {
      return new Promise((resolve) => {
        setTimeout(() => {
          const session = localStorage.getItem(STORAGE_KEYS.SESSION);
          resolve(session ? JSON.parse(session) : null);
        }, 250);
      });
    }
  }
};

// ==========================================
// USER DATA SERVICE
// ==========================================

export const userApi = {
  getData: async (userId: string) => {
    if (CONFIG.USE_BACKEND) {
      const [favorites, wishlist, reviews, settings] = await Promise.all([
        request('/user/favorites'),
        request('/user/wishlist'),
        request('/user/reviews'),
        request('/user/settings')
      ]);
      
      const reviewsMap = new Map<string, Review>();
      reviews.forEach((r: any) => reviewsMap.set(r.novel_id, { rating: r.rating, text: r.text }));

      return {
        favorites: new Set<string>(favorites),
        wishlist: new Set<string>(wishlist),
        reviews: reviewsMap,
        settings: settings
      };
    } else {
      // Mock Implementation
      const favsKey = `${STORAGE_KEYS.PREFIX}favorites_${userId}`;
      const reviewsKey = `${STORAGE_KEYS.PREFIX}reviews_${userId}`;
      const wishlistKey = `${STORAGE_KEYS.PREFIX}wishlist_${userId}`;
      const settingsKey = `${STORAGE_KEYS.PREFIX}settings_${userId}`;

      const reviewsMap = new Map<string, Review>(Object.entries(JSON.parse(localStorage.getItem(reviewsKey) || '{}')));
      
      return {
        favorites: new Set<string>(JSON.parse(localStorage.getItem(favsKey) || '[]')),
        wishlist: new Set<string>(JSON.parse(localStorage.getItem(wishlistKey) || '[]')),
        reviews: reviewsMap,
        settings: JSON.parse(localStorage.getItem(settingsKey) || '{}')
      };
    }
  },

  syncFavorites: async (userId: string, favorites: string[]) => {
    if (CONFIG.USE_BACKEND) {
      await request('/user/favorites', {
        method: 'POST',
        body: JSON.stringify({ favorites })
      });
    } else {
      localStorage.setItem(`${STORAGE_KEYS.PREFIX}favorites_${userId}`, JSON.stringify(favorites));
    }
  },

  syncWishlist: async (userId: string, wishlist: string[]) => {
    if (CONFIG.USE_BACKEND) {
        await request('/user/wishlist', {
            method: 'POST',
            body: JSON.stringify({ wishlist })
          });
    } else {
      localStorage.setItem(`${STORAGE_KEYS.PREFIX}wishlist_${userId}`, JSON.stringify(wishlist));
    }
  },

  updateReview: async (userId: string, novelId: string, review: Review) => {
    if (CONFIG.USE_BACKEND) {
      await request(`/user/reviews/${novelId}`, {
        method: 'POST',
        body: JSON.stringify(review)
      });
    } else {
       // We need to read, update, then write because localStorage is simple key-value
       const key = `${STORAGE_KEYS.PREFIX}reviews_${userId}`;
       const current = JSON.parse(localStorage.getItem(key) || '{}');
       current[novelId] = review;
       localStorage.setItem(key, JSON.stringify(current));
    }
  },

  deleteReview: async (userId: string, novelId: string) => {
    if (CONFIG.USE_BACKEND) {
      await request(`/user/reviews/${novelId}`, {
        method: 'DELETE'
      });
    } else {
        const key = `${STORAGE_KEYS.PREFIX}reviews_${userId}`;
        const current = JSON.parse(localStorage.getItem(key) || '{}');
        delete current[novelId];
        localStorage.setItem(key, JSON.stringify(current));
    }
  },

  updateSettings: async (userId: string, settings: Partial<UserSettings>) => {
    if (CONFIG.USE_BACKEND) {
      await request('/user/settings', {
        method: 'PATCH',
        body: JSON.stringify(settings)
      });
    } else {
       const key = `${STORAGE_KEYS.PREFIX}settings_${userId}`;
       const current = JSON.parse(localStorage.getItem(key) || '{}');
       const updated = { ...current, ...settings };
       localStorage.setItem(key, JSON.stringify(updated));
    }
  }
};
