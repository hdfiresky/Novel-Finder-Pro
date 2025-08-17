
import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import { Novel, Review, UserSettings } from '../types';
import { useAuth } from './AuthContext';
// STEP 1: Uncomment this line to use Supabase
import { supabase } from '../supabase/client';


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
};

export const UserDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [reviews, setReviews] = useState<Map<string, Review>>(new Map());
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);

  // --- LOCAL STORAGE IMPLEMENTATION (Current) ---
  /*
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    if (user) {
      try {
        const favsKey = `novel_finder_favorites_${user.id}`;
        const storedFavs = JSON.parse(localStorage.getItem(favsKey) || '[]');
        setFavorites(new Set(storedFavs));
        
        const reviewsKey = `novel_finder_reviews_${user.id}`;
        const storedReviews = JSON.parse(localStorage.getItem(reviewsKey) || '{}');
        setReviews(new Map(Object.entries(storedReviews)));

        const wishlistKey = `novel_finder_wishlist_${user.id}`;
        const storedWishlist = JSON.parse(localStorage.getItem(wishlistKey) || '[]');
        setWishlist(new Set(storedWishlist));

        const settingsKey = `novel_finder_settings_${user.id}`;
        const storedSettings = JSON.parse(localStorage.getItem(settingsKey) || '{}');
        setSettings({ ...defaultSettings, ...storedSettings });

      } catch (error) {
        console.error("Failed to load user data from localStorage", error);
        setFavorites(new Set());
        setReviews(new Map());
        setWishlist(new Set());
        setSettings(defaultSettings);
      } finally {
        setIsLoaded(true);
      }
    } else {
      // Clear data when user logs out
      setFavorites(new Set());
      setReviews(new Map());
      setWishlist(new Set());
      setSettings(defaultSettings);
      setIsLoaded(false);
    }
  }, [user]);
  
  const persistData = (key: string, data: any) => {
    if (user) {
      localStorage.setItem(`novel_finder_${key}_${user.id}`, JSON.stringify(data));
    }
  };
  
  const isFavorite = useCallback((novelId: string) => favorites.has(novelId), [favorites]);
  const toggleFavorite = (novel: Novel) => {
    if (!user) return;
    const newFavorites = new Set(favorites);
    if (newFavorites.has(novel.id)) newFavorites.delete(novel.id);
    else newFavorites.add(novel.id);
    setFavorites(newFavorites);
    persistData('favorites', Array.from(newFavorites));
  };

  const isWished = useCallback((novelId: string) => wishlist.has(novelId), [wishlist]);
  const toggleWishlist = (novel: Novel) => {
    if (!user) return;
    const newWishlist = new Set(wishlist);
    if (newWishlist.has(novel.id)) newWishlist.delete(novel.id);
    else newWishlist.add(novel.id);
    setWishlist(newWishlist);
    persistData('wishlist', Array.from(newWishlist));
  };
  
  const getReview = useCallback((novelId: string) => reviews.get(novelId), [reviews]);
  const updateReview = (novelId: string, review: Review) => {
    if (!user) return;
    const newReviews = new Map(reviews);
    newReviews.set(novelId, review);
    setReviews(newReviews);
    persistData('reviews', Object.fromEntries(newReviews));
  };

  const deleteReview = (novelId: string) => {
    if (!user) return;
    const newReviews = new Map(reviews);
    newReviews.delete(novelId);
    setReviews(newReviews);
    persistData('reviews', Object.fromEntries(newReviews));
  };

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    if (!user) return;
    setSettings(prev => {
        const updated = { ...prev, ...newSettings };
        persistData('settings', updated);
        return updated;
    });
  };
  */
  // --- END OF LOCAL STORAGE IMPLEMENTATION ---


  // --- SUPABASE IMPLEMENTATION (Commented Out) ---
  // STEP 2: Comment out the entire "LOCAL STORAGE IMPLEMENTATION" block above.
  // STEP 3: Uncomment this "SUPABASE IMPLEMENTATION" block below.

  useEffect(() => {
    if (user) {
        const loadUserData = async () => {
            try {
                // Fetch all data in parallel
                const [favRes, wishRes, revRes, settingsRes] = await Promise.all([
                    supabase.from('favorites').select('novel_id').eq('user_id', user.id),
                    supabase.from('wishlist').select('novel_id').eq('user_id', user.id),
                    supabase.from('reviews').select('*').eq('user_id', user.id),
                    supabase.from('profiles').select('show_favorite_button, show_wishlist_button').eq('id', user.id).single()
                ]);

                if (favRes.error) throw favRes.error;
                setFavorites(new Set(favRes.data.map(f => f.novel_id)));
                
                if (wishRes.error) throw wishRes.error;
                setWishlist(new Set(wishRes.data.map(w => w.novel_id)));

                if (revRes.error) throw revRes.error;
                const reviewsMap = new Map<string, Review>();
                revRes.data.forEach(r => reviewsMap.set(r.novel_id, { rating: r.rating, text: r.text }));
                setReviews(reviewsMap);

                if (settingsRes.error) throw settingsRes.error;
                if (settingsRes.data) {
                    setSettings({
                        showFavoriteButton: settingsRes.data.show_favorite_button,
                        showWishlistButton: settingsRes.data.show_wishlist_button
                    });
                }
            } catch (error) {
                console.error("Error loading user data from Supabase:", error);
            }
        };
        loadUserData();

        // Real-time subscriptions
        const favoritesSubscription = supabase.channel(`public:favorites:user_id=eq.${user.id}`)
          .on('postgres_changes', { event: '*', schema: 'public', table: 'favorites', filter: `user_id=eq.${user.id}` }, payload => {
            const { eventType, new: newRecord, old: oldRecord } = payload;
            if (eventType === 'INSERT') {
              setFavorites(prev => new Set(prev).add(newRecord.novel_id));
            } else if (eventType === 'DELETE') {
              setFavorites(prev => {
                const newFavs = new Set(prev);
                newFavs.delete(oldRecord.novel_id);
                return newFavs;
              });
            }
          })
          .subscribe();

        const wishlistSubscription = supabase.channel(`public:wishlist:user_id=eq.${user.id}`)
          .on('postgres_changes', { event: '*', schema: 'public', table: 'wishlist', filter: `user_id=eq.${user.id}` }, payload => {
            const { eventType, new: newRecord, old: oldRecord } = payload;
            if (eventType === 'INSERT') {
              setWishlist(prev => new Set(prev).add(newRecord.novel_id));
            } else if (eventType === 'DELETE') {
              setWishlist(prev => {
                const newWish = new Set(prev);
                newWish.delete(oldRecord.novel_id);
                return newWish;
              });
            }
          })
          .subscribe();
        
        const reviewsSubscription = supabase.channel(`public:reviews:user_id=eq.${user.id}`)
          .on('postgres_changes', { event: '*', schema: 'public', table: 'reviews', filter: `user_id=eq.${user.id}` }, payload => {
            const { eventType, new: newRecord, old: oldRecord } = payload;
            setReviews(currentReviews => {
              const newReviews = new Map(currentReviews);
              if (eventType === 'INSERT' || eventType === 'UPDATE') {
                  newReviews.set(newRecord.novel_id, { rating: newRecord.rating, text: newRecord.text });
              } else if (eventType === 'DELETE') {
                  newReviews.delete(oldRecord.novel_id);
              }
              return newReviews;
            });
          })
          .subscribe();

        return () => {
          supabase.removeChannel(favoritesSubscription);
          supabase.removeChannel(wishlistSubscription);
          supabase.removeChannel(reviewsSubscription);
        }
    } else if (!user) {
        // Clear data on logout
        setFavorites(new Set());
        setWishlist(new Set());
        setReviews(new Map());
        setSettings(defaultSettings);
    }
  }, [user]);

  const isFavorite = useCallback((novelId: string) => favorites.has(novelId), [favorites]);
  const toggleFavorite = async (novel: Novel) => {
    if (!user) return;
    const isCurrentlyFavorite = favorites.has(novel.id);
    
    // Optimistic UI update
    const newFavorites = new Set(favorites);
    if (isCurrentlyFavorite) {
        newFavorites.delete(novel.id);
    } else {
        newFavorites.add(novel.id);
    }
    setFavorites(newFavorites);
    
    try {
        if (isCurrentlyFavorite) {
            const { error } = await supabase.from('favorites').delete().match({ user_id: user.id, novel_id: novel.id });
            if (error) throw error;
        } else {
            const { error } = await supabase.from('favorites').insert({ user_id: user.id, novel_id: novel.id });
            if (error) throw error;
        }
    } catch (error) {
        console.error("Error toggling favorite:", error);
        // Revert UI on error
        setFavorites(favorites);
    }
  };

  const isWished = useCallback((novelId: string) => wishlist.has(novelId), [wishlist]);
  const toggleWishlist = async (novel: Novel) => {
    if (!user) return;
    const isCurrentlyWished = wishlist.has(novel.id);

    const newWishlist = new Set(wishlist);
    if (isCurrentlyWished) {
        newWishlist.delete(novel.id);
    } else {
        newWishlist.add(novel.id);
    }
    setWishlist(newWishlist);

    try {
        if (isCurrentlyWished) {
            const { error } = await supabase.from('wishlist').delete().match({ user_id: user.id, novel_id: novel.id });
            if (error) throw error;
        } else {
            const { error } = await supabase.from('wishlist').insert({ user_id: user.id, novel_id: novel.id });
            if (error) throw error;
        }
    } catch (error) {
        console.error("Error toggling wishlist:", error);
        setWishlist(wishlist);
    }
  };

  const getReview = useCallback((novelId: string) => reviews.get(novelId), [reviews]);
  const updateReview = async (novelId: string, review: Review) => {
    if (!user) return;
    const oldReviews = new Map(reviews);
    const newReviews = new Map(reviews);
    newReviews.set(novelId, review);
    setReviews(newReviews);

    try {
        const { error } = await supabase.from('reviews').upsert({
            user_id: user.id,
            novel_id: novelId,
            rating: review.rating,
            text: review.text
        }, { onConflict: 'user_id,novel_id' });
        if (error) throw error;
    } catch (error) {
        console.error("Error updating review:", error);
        setReviews(oldReviews);
    }
  };

  const deleteReview = async (novelId: string) => {
    if (!user) return;
    const oldReviews = new Map(reviews);
    const newReviews = new Map(reviews);
    newReviews.delete(novelId);
    setReviews(newReviews);
    
    try {
        const { error } = await supabase.from('reviews').delete().match({ user_id: user.id, novel_id: novelId });
        if (error) throw error;
    } catch (error) {
        console.error("Error deleting review:", error);
        setReviews(oldReviews);
    }
  };

  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    if (!user) return;
    const oldSettings = { ...settings };
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    
    try {
        const { error } = await supabase
            .from('profiles')
            .update({
                show_favorite_button: updated.showFavoriteButton,
                show_wishlist_button: updated.showWishlistButton
            })
            .eq('id', user.id);
        if (error) throw error;
    } catch (error) {
        console.error("Error updating settings:", error);
        setSettings(oldSettings);
    }
  };
  // --- END OF SUPABASE IMPLEMENTATION ---


  const value = {
      favorites,
      reviews,
      wishlist,
      settings,
      isFavorite,
      toggleFavorite,
      isWished,
      toggleWishlist,
      getReview,
      updateReview,
      deleteReview,
      updateSettings,
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