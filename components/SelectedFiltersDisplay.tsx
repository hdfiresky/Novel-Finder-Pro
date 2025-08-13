
import React from 'react';
import { FilterState } from '../types';
import Icon from './Icon';

interface SelectedFiltersDisplayProps {
  filters: FilterState;
  onRemoveFilter: (key: 'genres' | 'tags', value: string, type: 'include' | 'exclude') => void;
  onClearAll: () => void;
}

const SelectedFiltersDisplay: React.FC<SelectedFiltersDisplayProps> = ({ filters, onRemoveFilter, onClearAll }) => {
  const { genres, tags } = filters;
  const hasFilters = genres.include.length > 0 || genres.exclude.length > 0 || tags.include.length > 0 || tags.exclude.length > 0;

  return (
    <div
      className={`
        bg-gray-800/50 border-b 
        transition-[max-height,padding,opacity] duration-300 ease-in-out overflow-y-auto
        ${hasFilters ? 'max-h-40 px-6 pt-4 pb-2 opacity-100 border-gray-700' : 'max-h-0 p-0 opacity-0 border-transparent'}
      `}
    >
      <div className="flex items-center flex-wrap gap-2">
        <h4 className="text-sm font-semibold text-gray-400 mr-2 shrink-0">Active Filters:</h4>
        <div className="flex items-center flex-wrap gap-2 flex-1">
          {/* Included Genres */}
          {genres.include.map(genre => (
            <span key={`genre-inc-${genre}`} className="animate-badge-in flex items-center bg-indigo-600/50 text-indigo-200 text-xs font-medium pl-2.5 pr-1 py-1 rounded-full">
              {genre}
              <button 
                onClick={() => onRemoveFilter('genres', genre, 'include')}
                className="ml-1.5 flex-shrink-0 bg-indigo-400/30 hover:bg-indigo-400/60 rounded-full p-0.5 focus:outline-none focus:ring-2 focus:ring-white"
                aria-label={`Remove genre filter: ${genre}`}
              >
                <Icon name="X" size={12} />
              </button>
            </span>
          ))}
          {/* Excluded Genres */}
          {genres.exclude.map(genre => (
            <span key={`genre-exc-${genre}`} className="animate-badge-in flex items-center bg-red-600/50 text-red-200 text-xs font-medium pl-2.5 pr-1 py-1 rounded-full">
              <Icon name="Ban" size={12} className="mr-1.5"/>
              {genre}
              <button 
                onClick={() => onRemoveFilter('genres', genre, 'exclude')}
                className="ml-1.5 flex-shrink-0 bg-red-400/30 hover:bg-red-400/60 rounded-full p-0.5 focus:outline-none focus:ring-2 focus:ring-white"
                aria-label={`Remove excluded genre filter: ${genre}`}
              >
                <Icon name="X" size={12} />
              </button>
            </span>
          ))}
          {/* Included Tags */}
          {tags.include.map(tag => (
            <span key={`tag-inc-${tag}`} className="animate-badge-in flex items-center bg-teal-600/50 text-teal-200 text-xs font-medium pl-2.5 pr-1 py-1 rounded-full">
              {tag}
              <button 
                onClick={() => onRemoveFilter('tags', tag, 'include')}
                className="ml-1.5 flex-shrink-0 bg-teal-400/30 hover:bg-teal-400/60 rounded-full p-0.5 focus:outline-none focus:ring-2 focus:ring-white"
                aria-label={`Remove tag filter: ${tag}`}
              >
                <Icon name="X" size={12} />
              </button>
            </span>
          ))}
          {/* Excluded Tags */}
          {tags.exclude.map(tag => (
            <span key={`tag-exc-${tag}`} className="animate-badge-in flex items-center bg-red-600/50 text-red-200 text-xs font-medium pl-2.5 pr-1 py-1 rounded-full">
              <Icon name="Ban" size={12} className="mr-1.5"/>
              {tag}
              <button 
                onClick={() => onRemoveFilter('tags', tag, 'exclude')}
                className="ml-1.5 flex-shrink-0 bg-red-400/30 hover:bg-red-400/60 rounded-full p-0.5 focus:outline-none focus:ring-2 focus:ring-white"
                aria-label={`Remove excluded tag filter: ${tag}`}
              >
                <Icon name="X" size={12} />
              </button>
            </span>
          ))}
        </div>
        {hasFilters && (
          <button 
            onClick={onClearAll} 
            className="text-sm text-gray-400 hover:text-red-400 underline ml-2 shrink-0"
          >
            Clear All
          </button>
        )}
      </div>
    </div>
  );
};

export default SelectedFiltersDisplay;