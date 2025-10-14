


import React from 'react';
import { Novel } from '../types';
import Badge from './ui/Badge';
import Icon from './Icon';
import ImageWithLoader from './ui/ImageWithLoader';
import { useAuth } from '../contexts/AuthContext';
import { useUserData } from '../contexts/UserDataContext';

interface NovelCardProps {
  /** The novel object containing the data to display. */
  novel: Novel;
  /** Callback function when the card is clicked. */
  onSelect: (novel: Novel) => void;
  /** Callback function to add a genre or tag to the main filters. */
  onAddFilter: (key: 'genres' | 'tags', value: string) => void;
}

/**
 * A card component that displays a summary of a novel.
 * It includes the cover image, title, author, rating, and genres.
 * Provides actions for selecting the novel, filtering by genre, and
 * (if logged in) adding to favorites or wishlist.
 * @param {NovelCardProps} props The props for the NovelCard component.
 * @returns {JSX.Element} A styled card for a single novel.
 */
const NovelCard: React.FC<NovelCardProps> = ({ novel, onSelect, onAddFilter }) => {
  const { user } = useAuth();
  const { isFavorite, toggleFavorite, isWished, toggleWishlist, settings } = useUserData();
  const favorited = isFavorite(novel.id);
  const wished = isWished(novel.id);

  /**
   * Handles clicks on genre badges.
   * Prevents the click from propagating to the parent card element,
   * which would trigger the `onSelect` handler.
   * @param e The mouse event.
   * @param genre The genre string to add as a filter.
   */
  const handleGenreClick = (e: React.MouseEvent, genre: string) => {
    e.stopPropagation(); // Prevent opening the modal when a genre is clicked
    onAddFilter('genres', genre);
  };

  /**
   * Handles clicks on the favorite button.
   * @param e The mouse event.
   */
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent modal opening
    if (user) {
      toggleFavorite(novel);
    }
  };

  /**
   * Handles clicks on the wishlist button.
   * @param e The mouse event.
   */
  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent modal opening
    if (user) {
      toggleWishlist(novel);
    }
  };
  
  return (
    <div 
      className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 ease-in-out transform hover:-translate-y-1 cursor-pointer group flex flex-col"
      onClick={() => onSelect(novel)}
      role="button"
      tabIndex={0}
      aria-label={`View details for ${novel.title}`}
    >
      <div className="relative">
        <ImageWithLoader
          src={novel.cover_image || `https://picsum.photos/seed/${novel.id}/400/600`}
          alt={`Cover for ${novel.title}`}
          className="w-full h-64"
        />
        <div className="absolute top-2 right-2 bg-black bg-opacity-70 rounded-full px-3 py-1 text-sm font-bold flex items-center text-yellow-400">
          <Icon name="Star" className="w-4 h-4 mr-1 fill-current" />
          {novel.rating.toFixed(1)}
        </div>
        
        {/* User-specific actions are only shown if a user is logged in and settings allow */}
        {user && (settings.showFavoriteButton || settings.showWishlistButton) && (
          <div className="absolute top-2 left-2 flex gap-1.5">
            {settings.showFavoriteButton && (
              <button 
                onClick={handleFavoriteClick}
                className="bg-black bg-opacity-70 rounded-full p-2 transition-all duration-200 hover:bg-red-500/20 group/fav"
                aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
                title={favorited ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Icon 
                  name="Heart" 
                  className={`w-4 h-4 transition-all duration-200 ${favorited ? 'text-red-500 fill-current' : 'text-white group-hover/fav:text-red-400'}`} 
                />
              </button>
            )}
            {settings.showWishlistButton && (
              <button 
                onClick={handleWishlistClick}
                className="bg-black bg-opacity-70 rounded-full p-2 transition-all duration-200 hover:bg-blue-500/20 group/wish"
                aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
                title={wished ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <Icon 
                  name="Bookmark" 
                  className={`w-4 h-4 transition-all duration-200 ${wished ? 'text-blue-400 fill-current' : 'text-white group-hover/wish:text-blue-300'}`} 
                />
              </button>
            )}
          </div>
        )}

      </div>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-bold text-gray-100 truncate group-hover:text-indigo-400 transition-colors">{novel.title}</h3>
        <div className="flex justify-between items-center text-sm text-gray-400 mb-2">
          <p className="truncate pr-2">{novel.author}</p>
          <div className="flex items-center gap-1 shrink-0">
            <Icon name="BookOpen" className="w-4 h-4 text-indigo-400" />
            <span>{novel.chapter_count}</span>
          </div>
        </div>
        <p className="text-sm text-gray-300 line-clamp-3 flex-grow">
          {novel.description}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {novel.genres.slice(0, 3).map(genre => (
            <button
              key={genre}
              onClick={(e) => handleGenreClick(e, genre)}
              className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-400 rounded-full transition-transform transform hover:scale-105"
              aria-label={`Filter by genre: ${genre}`}
            >
              <Badge>{genre}</Badge>
            </button>
          ))}
          {novel.genres.length > 3 && <Badge>+ {novel.genres.length - 3}</Badge>}
        </div>
      </div>
    </div>
  );
};

export default React.memo(NovelCard);
