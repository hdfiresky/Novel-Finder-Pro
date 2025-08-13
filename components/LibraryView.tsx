
import React, { useState, useMemo } from 'react';
import { useUserData } from '../contexts/UserDataContext';
import { Novel } from '../types';
import NovelCard from './NovelCard';
import Icon from './Icon';
import ImageWithLoader from './ui/ImageWithLoader';
import StarRatingInput from './ui/StarRatingInput';

interface LibraryViewProps {
  allNovels: Novel[];
  onSelectNovel: (novel: Novel) => void;
  onAddFilter: (key: 'genres' | 'tags', value: string) => void;
}

const LibraryView: React.FC<LibraryViewProps> = ({ allNovels, onSelectNovel, onAddFilter }) => {
  const [activeTab, setActiveTab] = useState<'favorites' | 'reviews' | 'wishlist'>('favorites');
  const { favorites, reviews, wishlist } = useUserData();

  const favoriteNovels = useMemo(() => {
    return allNovels.filter(novel => favorites.has(novel.id));
  }, [allNovels, favorites]);

  const reviewedNovels = useMemo(() => {
    return Array.from(reviews.entries()).map(([novelId, review]) => {
      const novel = allNovels.find(n => n.id === novelId);
      return novel ? { ...novel, review } : null;
    }).filter(Boolean).sort((a,b) => b!.review.rating - a!.review.rating);
  }, [allNovels, reviews]);
  
  const wishlistedNovels = useMemo(() => {
    return allNovels.filter(novel => wishlist.has(novel.id));
  }, [allNovels, wishlist]);

  const TabButton: React.FC<{ tabName: 'favorites' | 'reviews' | 'wishlist'; children: React.ReactNode; count: number }> = ({ tabName, children, count }) => (
    <button
      onClick={() => setActiveTab(tabName)}
      className={`flex items-center gap-2 px-4 py-2 font-semibold border-b-2 transition-colors ${
        activeTab === tabName ? 'text-white border-indigo-500' : 'text-gray-400 border-transparent hover:text-white hover:border-gray-500'
      }`}
    >
      {children}
      <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === tabName ? 'bg-indigo-500 text-white' : 'bg-gray-600 text-gray-300'}`}>{count}</span>
    </button>
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex-shrink-0 bg-gray-800/50 backdrop-blur-sm p-4 border-b border-gray-700">
            <h1 className="text-2xl font-bold text-white">My Library</h1>
        </header>

        <div className="border-b border-gray-700 px-4">
            <div className="flex">
                <TabButton tabName="favorites" count={favoriteNovels.length}>
                    <Icon name="Heart" size={16} /> Favorites
                </TabButton>
                <TabButton tabName="reviews" count={reviewedNovels.length}>
                    <Icon name="MessageSquare" size={16} /> My Reviews
                </TabButton>
                 <TabButton tabName="wishlist" count={wishlistedNovels.length}>
                    <Icon name="Bookmark" size={16} /> Wishlist
                </TabButton>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'favorites' && (
                favoriteNovels.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                        {favoriteNovels.map(novel => (
                            <NovelCard key={novel.id} novel={novel} onSelect={onSelectNovel} onAddFilter={onAddFilter} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                        <Icon name="HeartOff" size={64} className="mb-4"/>
                        <h3 className="text-xl font-semibold">No Favorites Yet</h3>
                        <p className="mt-2">Click the heart icon on a novel to add it to your library.</p>
                    </div>
                )
            )}

            {activeTab === 'reviews' && (
                reviewedNovels.length > 0 ? (
                    <div className="space-y-6">
                        {reviewedNovels.map(item => (
                            <div key={item!.id} className="bg-gray-800 p-4 rounded-lg flex gap-4 hover:bg-gray-700/50 transition-colors cursor-pointer" onClick={() => onSelectNovel(item!)}>
                                <ImageWithLoader src={item!.cover_image!} alt={item!.title} className="w-24 h-36 rounded-md flex-shrink-0"/>
                                <div className="flex-grow">
                                    <h4 className="font-bold text-lg text-white mb-1">{item!.title}</h4>
                                    <div className="mb-2">
                                        <StarRatingInput rating={item!.review.rating} setRating={() => {}} size={18} />
                                    </div>
                                    {item!.review.text && (
                                        <p className="text-sm text-gray-300 bg-gray-900/50 p-3 rounded-md italic">"{item!.review.text}"</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                        <Icon name="FileText" size={64} className="mb-4"/>
                        <h3 className="text-xl font-semibold">No Reviews Yet</h3>
                        <p className="mt-2">You can add a review from any novel's detail page.</p>
                    </div>
                )
            )}

            {activeTab === 'wishlist' && (
                wishlistedNovels.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                        {wishlistedNovels.map(novel => (
                            <NovelCard key={novel.id} novel={novel} onSelect={onSelectNovel} onAddFilter={onAddFilter} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                        <Icon name="BookmarkX" size={64} className="mb-4"/>
                        <h3 className="text-xl font-semibold">Your Wishlist is Empty</h3>
                        <p className="mt-2">Click the bookmark icon on a novel to add it to your wishlist.</p>
                    </div>
                )
            )}
        </div>
    </div>
  );
};

export default LibraryView;