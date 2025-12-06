
import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import { Novel, Review, UserSettings } from '../types';
import { useAuth } from './AuthContext';
import { userApi } from '../services/api';

interface UserDataContextType {
  favorites: Set<string>;
  reviews: Map<string, Review>;
  wishlist: Set<string>;
  settings: UserSettings;
  isFavorite: (novelId: string) => boolean;
  toggleFavorite: (novel: Novel) => void;
  isWished: (novelId: string) => boolean;
  toggleWishlist: (novel: Novel) => void;
  getReview: (novelId: string) => Review | undefined;
  updateReview: (novelId: string, review: Review) => void;
  deleteReview: (novelId: string) => void;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
}

const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

const defaultSettings: UserSettings = {
    showFavoriteButton: false,
    showWishlistButton: true,
    showNsfw: false,
};

export const UserDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [reviews, setReviews] = useState<Map<string, Review>>(new Map());
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (user) {
      const loadData = async () => {
        try {
            const data = await userApi.getData(user.id);
            setFavorites(data.favorites);
            setWishlist(data.wishlist);
            setReviews(data.reviews);
            setSettings({ ...defaultSettings, ...data.settings });
        } catch (error) {
            console.error("Failed to load user data", error);
            setFavorites(new Set()); setReviews(new Map()); setWishlist(new Set()); setSettings(defaultSettings);
        } finally {
            setIsLoaded(true);
        }
      };
      loadData();
    } else {
      setFavorites(new Set()); setReviews(new Map()); setWishlist(new Set()); setSettings(defaultSettings);
      setIsLoaded(false);
    }
  }, [user]);

  const isFavorite = useCallback((novelId: string) => favorites.has(novelId), [favorites]);
  const toggleFavorite = (novel: Novel) => {
    if (!user) return;
    const newFavorites = new Set(favorites);
    if (newFavorites.has(novel.id)) newFavorites.delete(novel.id);
    else newFavorites.add(novel.id);
    setFavorites(newFavorites);
    userApi.syncFavorites(user.id, Array.from(newFavorites)).catch(console.error);
  };

  const isWished = useCallback((novelId: string) => wishlist.has(novelId), [wishlist]);
  const toggleWishlist = (novel: Novel) => {
    if (!user) return;
    const newWishlist = new Set(wishlist);
    if (newWishlist.has(novel.id)) newWishlist.delete(novel.id);
    else newWishlist.add(novel.id);
    setWishlist(newWishlist);
    userApi.syncWishlist(user.id, Array.from(newWishlist)).catch(console.error);
  };
  
  const getReview = useCallback((novelId: string) => reviews.get(novelId), [reviews]);
  const updateReview = (novelId: string, review: Review) => {
    if (!user) return;
    const newReviews = new Map(reviews);
    newReviews.set(novelId, review);
    setReviews(newReviews);
    userApi.updateReview(user.id, novelId, review).catch(console.error);
  };

  const deleteReview = (novelId: string) => {
    if (!user) return;
    const newReviews = new Map(reviews);
    newReviews.delete(novelId);
    setReviews(newReviews);
    userApi.deleteReview(user.id, novelId).catch(console.error);
  };

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    if (!user) return;
    setSettings(prev => {
        const updated = { ...prev, ...newSettings };
        userApi.updateSettings(user.id, newSettings).catch(console.error);
        return updated;
    });
  };

  const value = {
      favorites, reviews, wishlist, settings,
      isFavorite, toggleFavorite, isWished, toggleWishlist,
      getReview, updateReview, deleteReview, updateSettings,
  };

  return (
    <UserDataContext.Provider value={value}>
      {children}
    </UserDataContext.Provider>
  );
};

export const useUserData = () => {
  const context = useContext(UserDataContext);
  if (context === undefined) {
    throw new Error('useUserData must be used within a UserDataProvider');
  }
  return context;
};
