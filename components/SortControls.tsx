
import React, { useState } from 'react';
import { Novel, SortOption } from '../types';
import Icon from './Icon';

interface SortControlsProps {
  sortOptions: SortOption[];
  setSortOptions: (options: SortOption[]) => void;
}

const availableSortKeys: { key: keyof Novel, name: string }[] = [
  { key: 'title', name: 'Title' },
  { key: 'rating', name: 'Rating' },
  { key: 'rating_count', name: 'Rating Count' },
  { key: 'chapter_count', name: 'Chapter Count' },
  { key: 'author', name: 'Author' },
];

const SortControls: React.FC<SortControlsProps> = ({ sortOptions, setSortOptions }) => {
  const [showAdd, setShowAdd] = useState(false);

  const addSortOption = (key: keyof Novel) => {
    if (!sortOptions.some(opt => opt.key === key)) {
      setSortOptions([...sortOptions, { key, direction: 'desc' }]);
    }
    setShowAdd(false);
  };

  const removeSortOption = (key: keyof Novel) => {
    setSortOptions(sortOptions.filter(opt => opt.key !== key));
  };

  const toggleDirection = (key: keyof Novel) => {
    setSortOptions(sortOptions.map(opt => 
      opt.key === key ? { ...opt, direction: opt.direction === 'asc' ? 'desc' : 'asc' } : opt
    ));
  };

  return (
    <div className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-200 mb-2">Sort By</h3>
        <div className="space-y-2">
            {sortOptions.map(opt => (
                <div key={opt.key} className="flex items-center justify-between bg-gray-700 p-2 rounded-md">
                    <span className="text-sm text-gray-300">{availableSortKeys.find(k => k.key === opt.key)?.name}</span>
                    <div className="flex items-center gap-2">
                        <button onClick={() => toggleDirection(opt.key)} className="text-gray-400 hover:text-white">
                            <Icon name={opt.direction === 'asc' ? 'ArrowUp' : 'ArrowDown'} size={16} />
                        </button>
                        <button onClick={() => removeSortOption(opt.key)} className="text-gray-400 hover:text-red-500">
                            <Icon name="X" size={16} />
                        </button>
                    </div>
                </div>
            ))}
        </div>
        <div className="relative">
            <button 
                onClick={() => setShowAdd(!showAdd)}
                className="w-full text-left mt-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-sm text-gray-300 flex justify-between items-center"
            >
                Add sort criteria
                <Icon name={showAdd ? 'ChevronUp' : 'ChevronDown'} size={16} />
            </button>
            {showAdd && (
                <div className="absolute z-10 w-full mt-1 bg-gray-700 border border-gray-600 rounded-md shadow-lg">
                    {availableSortKeys
                        .filter(key => !sortOptions.some(opt => opt.key === key.key))
                        .map(key => (
                            <div 
                                key={key.key} 
                                onClick={() => addSortOption(key.key as keyof Novel)}
                                className="px-3 py-2 text-sm text-gray-300 hover:bg-indigo-600 hover:text-white cursor-pointer"
                            >
                                {key.name}
                            </div>
                        ))
                    }
                </div>
            )}
        </div>
    </div>
  );
};

export default SortControls;
