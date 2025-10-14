import React, { useMemo } from 'react';
import { useUserData } from '../contexts/UserDataContext';
import { Novel } from '../types';
import NovelCard from './NovelCard';
import Icon from './Icon';
import ImageWithLoader from './ui/ImageWithLoader';
import StarRatingInput from './ui/StarRatingInput';

type LibraryTab = 'favorites' | 'reviews' | 'wishlist';

interface LibraryViewProps {
  /** The complete list of all novels, used to look up novel details by ID. */
  allNovels: Novel[];
  /** Callback to open the novel detail modal for a selected novel. */
  onSelectNovel: (novel: Novel) => void;
  /** Callback to add a genre or tag to the main filters. */
  onAddFilter: (key: 'genres' | 'tags', value: string) => void;
  /** The currently active tab, controlled by the parent component. */
  activeTab: LibraryTab;
  /** Callback to change the active tab. */
  onTabChange: (tab: LibraryTab) => void;
}

/**
 * A component that displays the authenticated user's personal library.
 * Its state (which tab is active) is controlled by URL parameters via its parent component.
 * @param {LibraryViewProps} props The props for the LibraryView component.
 * @returns {JSX.Element} The user's library view.
 */
const LibraryView: React.FC<LibraryViewProps> = ({ allNovels, onSelectNovel, onAddFilter, activeTab, onTabChange }) => {
  const { favorites, reviews, wishlist } = useUserData();

  const favoriteNovels = useMemo(() => allNovels.filter(novel => favorites.has(novel.id)), [allNovels, favorites]);
  const reviewedNovels = useMemo(() => {
    return Array.from(reviews.entries()).map(([novelId, review]) => {
      const novel = allNovels.find(n => n.id === novelId);
      return novel ? { ...novel, review } : null;
    }).filter((item): item is Novel & { review: { rating: number; text: string; } } => item !== null)
      .sort((a,b) => b!.review.rating - a!.review.rating);
  }, [allNovels, reviews]);
  const wishlistedNovels = useMemo(() => allNovels.filter(novel => wishlist.has(novel.id)), [allNovels, wishlist]);

  const TabButton: React.FC<{ tabName: LibraryTab; children: React.ReactNode; count: number }> = ({ tabName, children, count }) => (
    <button
      onClick={() => onTabChange(tabName)}
      className={`flex items-center gap-2 px-4 py-2 font-semibold border-b-2 transition-colors ${
        activeTab === tabName ? 'text-white border-indigo-500' : 'text-gray-400 border-transparent hover:text-white hover:border-gray-500'
      }`}
      role="tab" aria-selected={activeTab === tabName}
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
            <div className="flex" role="tablist">
                <TabButton tabName="favorites" count={favoriteNovels.length}><Icon name="Heart" size={16} /> Favorites</TabButton>
                <TabButton tabName="reviews" count={reviewedNovels.length}><Icon name="MessageSquare" size={16} /> My Reviews</TabButton>
                <TabButton tabName="wishlist" count={wishlistedNovels.length}><Icon name="Bookmark" size={16} /> Wishlist</TabButton>
            </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'favorites' && (
                <div role="tabpanel">
                    {favoriteNovels.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                            {favoriteNovels.map(novel => <NovelCard key={novel.id} novel={novel} onSelect={onSelectNovel} onAddFilter={onAddFilter} />)}
                        </div>
                    ) : ( <div className="flex flex-col items-center justify-center h-full text-center text-gray-500"><Icon name="HeartOff" size={64} className="mb-4"/><h3 className="text-xl font-semibold">No Favorites Yet</h3><p className="mt-2">Click the heart icon on a novel to add it to your library.</p></div> )}
                </div>
            )}
            {activeTab === 'reviews' && (
                <div role="tabpanel">
                    {reviewedNovels.length > 0 ? (
                        <div className="space-y-6">
                            {reviewedNovels.map(item => (
                                <div key={item.id} className="bg-gray-800 p-4 rounded-lg flex gap-4 hover:bg-gray-700/50 transition-colors cursor-pointer" onClick={() => onSelectNovel(item)}>
                                    <ImageWithLoader src={item.cover_image!} alt={item.title} className="w-24 h-36 rounded-md flex-shrink-0"/>
                                    <div className="flex-grow">
                                        <h4 className="font-bold text-lg text-white mb-1">{item.title}</h4>
                                        <div className="mb-2"><StarRatingInput rating={item.review.rating} setRating={() => {}} size={18} /></div>
                                        {item.review.text && <p className="text-sm text-gray-300 bg-gray-900/50 p-3 rounded-md italic">"{item.review.text}"</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : ( <div className="flex flex-col items-center justify-center h-full text-center text-gray-500"><Icon name="FileText" size={64} className="mb-4"/><h3 className="text-xl font-semibold">No Reviews Yet</h3><p className="mt-2">You can add a review from any novel's detail page.</p></div> )}
                </div>
            )}
            {activeTab === 'wishlist' && (
                <div role="tabpanel">
                    {wishlistedNovels.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                           {wishlistedNovels.map(novel => <NovelCard key={novel.id} novel={novel} onSelect={onSelectNovel} onAddFilter={onAddFilter} />)}
                        </div>
                    ) : ( <div className="flex flex-col items-center justify-center h-full text-center text-gray-500"><Icon name="BookmarkX" size={64} className="mb-4"/><h3 className="text-xl font-semibold">Your Wishlist is Empty</h3><p className="mt-2">Click the bookmark icon on a novel to add it to your wishlist.</p></div> )}
                </div>
            )}
        </div>
    </div>
  );
};

export default LibraryView;
