
import React from 'react';
import { RecommendationCriteria } from '../types';

interface RecommendationTunerProps {
  criteria: RecommendationCriteria;
  onCriteriaChange: (key: keyof RecommendationCriteria) => void;
  title?: string;
  layout?: 'vertical' | 'horizontal';
}

const criteriaOptions: { key: keyof RecommendationCriteria; label: string }[] = [
  { key: 'genres', label: 'Genres' },
  { key: 'tags', label: 'Tags' },
  { key: 'description', label: 'Description' },
  { key: 'author', label: 'Author' },
];

const RecommendationTuner: React.FC<RecommendationTunerProps> = ({ criteria, onCriteriaChange, title, layout = 'vertical' }) => {
  const checkboxes = criteriaOptions.map(({ key, label }) => (
    <label key={key} className="flex items-center text-gray-300 text-sm cursor-pointer">
        <input
            type="checkbox"
            checked={criteria[key]}
            onChange={() => onCriteriaChange(key)}
            className="h-4 w-4 rounded border-gray-500 bg-gray-700 text-indigo-600 focus:ring-indigo-500"
        />
        <span className="ml-2">{label}</span>
    </label>
  ));

  if (layout === 'horizontal') {
    return (
      <div className="flex items-center flex-wrap gap-x-4 gap-y-2">
        <p className="text-sm text-gray-400 font-medium shrink-0">Tune by:</p>
        {checkboxes}
      </div>
    );
  }

  // Vertical layout (default)
  return (
    <div>
      {title && <h3 className="text-lg font-semibold text-gray-200 mb-2">{title}</h3>}
       <p className="text-sm text-gray-400 mb-2">Tune recommendations by:</p>
       <div className="flex flex-col space-y-1">
        {checkboxes}
      </div>
    </div>
  );
};

export default RecommendationTuner;
