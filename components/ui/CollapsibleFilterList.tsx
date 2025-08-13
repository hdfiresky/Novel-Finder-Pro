

import React, { useState, useMemo } from 'react';
import Icon from '../Icon';

interface CollapsibleFilterListProps {
  title: string;
  options: string[];
  includedOptions: string[];
  excludedOptions: string[];
  onToggleOption: (key: 'genres' | 'tags', option: string, type: 'include' | 'exclude') => void;
  filterKey: 'genres' | 'tags';
  initialVisibleCount?: number;
}

const CollapsibleFilterList: React.FC<CollapsibleFilterListProps> = ({
  title,
  options,
  includedOptions,
  excludedOptions,
  onToggleOption,
  filterKey,
  initialVisibleCount = 7,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOptions = useMemo(() => {
    if (!searchTerm) {
      return options;
    }
    return options.filter(option =>
      option.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [options, searchTerm]);

  const visibleOptions = isExpanded ? filteredOptions : filteredOptions.slice(0, initialVisibleCount);

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-200 mb-2">{title}</h3>
      <div className="relative mb-2">
        <input
          type="text"
          placeholder={`Search ${title.toLowerCase()}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-gray-700/50 border border-gray-600 rounded-md py-1.5 pl-3 pr-8 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <Icon name="Search" className="text-gray-500" size={16} />
        </div>
      </div>
      
      <div className="space-y-1">
        {visibleOptions.length > 0 ? (
          visibleOptions.map(option => (
            <div key={option} className="flex items-center justify-between group pr-1">
                <label className="flex items-center text-gray-300 text-sm cursor-pointer hover:text-white transition-colors flex-1 truncate py-0.5">
                <input
                    type="checkbox"
                    checked={includedOptions.includes(option)}
                    onChange={() => onToggleOption(filterKey, option, 'include')}
                    className="h-4 w-4 rounded border-gray-500 bg-gray-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <span className={`ml-2 transition-colors ${excludedOptions.includes(option) ? 'line-through text-red-400/80' : ''}`}>
                    {option}
                </span>
                </label>
                 <button
                    onClick={() => onToggleOption(filterKey, option, 'exclude')}
                    className={`p-1 rounded-full transition-all duration-150 ease-in-out ${excludedOptions.includes(option) ? 'opacity-100 bg-red-500/20 text-red-400' : 'opacity-0 group-hover:opacity-100 focus:opacity-100 text-gray-400 hover:bg-gray-600 hover:text-white'}`}
                    aria-label={`Exclude ${option}`}
                >
                    <Icon name="Ban" size={14} />
                </button>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-sm text-center py-2">No {title.toLowerCase()} found.</p>
        )}
      </div>
      
      {filteredOptions.length > initialVisibleCount && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-indigo-400 hover:text-indigo-300 text-sm font-medium mt-2 flex items-center gap-1"
        >
          {isExpanded ? 'Show Less' : `Show More (${filteredOptions.length - initialVisibleCount})`}
          <Icon name={isExpanded ? 'ChevronUp' : 'ChevronDown'} size={14} />
        </button>
      )}
    </div>
  );
};

export default CollapsibleFilterList;