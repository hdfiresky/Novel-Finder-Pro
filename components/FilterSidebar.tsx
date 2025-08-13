

import React from 'react';
import { FilterState, SortOption, RecommendationCriteria } from '../types';
import RangeSlider from './ui/RangeSlider';
import SortControls from './SortControls';
import Button from './ui/Button';
import RecommendationTuner from './RecommendationTuner';
import CollapsibleFilterList from './ui/CollapsibleFilterList';

interface FilterSidebarProps {
  filterState: FilterState;
  onFilterChange: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  onToggleFilter: (key: 'genres' | 'tags', value: string, type: 'include' | 'exclude') => void;
  sortOptions: SortOption[];
  onSortChange: (options: SortOption[]) => void;
  onReset: () => void;
  availableGenres: string[];
  availableTags: string[];
  availableStatuses: string[];
  maxChapterCount: number;
  recommendationCriteria: RecommendationCriteria;
  onRecommendationCriteriaChange: (key: keyof RecommendationCriteria) => void;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filterState,
  onFilterChange,
  onToggleFilter,
  sortOptions,
  onSortChange,
  onReset,
  availableGenres,
  availableTags,
  availableStatuses,
  maxChapterCount,
  recommendationCriteria,
  onRecommendationCriteriaChange,
}) => {

  return (
    <aside className="w-full md:w-80 lg:w-96 bg-gray-800 p-6 flex-shrink-0 h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Filters</h2>
        <Button onClick={onReset} variant="secondary" className="text-sm px-3 py-1">Reset</Button>
      </div>

      <div className="space-y-6">
        <CollapsibleFilterList
          title="Genres"
          options={availableGenres}
          includedOptions={filterState.genres.include}
          excludedOptions={filterState.genres.exclude}
          onToggleOption={onToggleFilter}
          filterKey="genres"
        />

        <CollapsibleFilterList
          title="Tags"
          options={availableTags}
          includedOptions={filterState.tags.include}
          excludedOptions={filterState.tags.exclude}
          onToggleOption={onToggleFilter}
          filterKey="tags"
        />
        
        <div>
          <h3 className="text-lg font-semibold text-gray-200 mb-2">Status</h3>
          <select 
            value={filterState.status || ''} 
            onChange={e => onFilterChange('status', e.target.value || null)}
            className="w-full bg-gray-700 border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">All</option>
            {availableStatuses.map(status => (
                <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>

        <RangeSlider
          label="Rating"
          min={0}
          max={10}
          step={0.1}
          value={filterState.ratingRange}
          onChange={value => onFilterChange('ratingRange', value)}
        />

        <RangeSlider
          label="Chapter Count"
          min={0}
          max={maxChapterCount}
          step={10}
          value={filterState.chapterCountRange}
          onChange={value => onFilterChange('chapterCountRange', value)}
        />
        
        <SortControls sortOptions={sortOptions} setSortOptions={onSortChange} />

        <hr className="border-gray-700" />
        
        <RecommendationTuner 
          title="Default Recommendation Tuning"
          criteria={recommendationCriteria}
          onCriteriaChange={onRecommendationCriteriaChange}
        />

      </div>
    </aside>
  );
};

export default FilterSidebar;