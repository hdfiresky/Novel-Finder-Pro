

import React, { useState } from 'react';
import Icon from '../Icon';

interface StarRatingInputProps {
  /** The current selected rating value. */
  rating: number;
  /** Callback function to update the rating. */
  setRating: (rating: number) => void;
  /** The maximum rating value (e.g., 5 or 10 stars). Defaults to 10. */
  maxRating?: number;
  /** The size of the star icons in pixels. Defaults to 20. */
  size?: number;
}

/**
 * An interactive star rating input component.
 * Allows users to select a rating by clicking on stars.
 * Provides visual feedback on hover.
 * @param {StarRatingInputProps} props The props for the component.
 * @returns {JSX.Element} A row of clickable star icons.
 */
const StarRatingInput: React.FC<StarRatingInputProps> = ({ rating, setRating, maxRating = 10, size = 20 }) => {
  // State to track the rating value when the user hovers over the stars.
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="flex items-center" onMouseLeave={() => setHoverRating(0)}>
      {[...Array(maxRating)].map((_, index) => {
        const ratingValue = index + 1;
        return (
          <button
            type="button"
            key={ratingValue}
            className={`transition-transform duration-100 ease-in-out ${hoverRating >= ratingValue ? 'transform scale-110' : ''}`}
            onClick={() => setRating(ratingValue)}
            onMouseEnter={() => setHoverRating(ratingValue)}
            aria-label={`Rate ${ratingValue} out of ${maxRating}`}
          >
            <Icon
              name="Star"
              size={size}
              className={`cursor-pointer transition-colors ${
                ratingValue <= (hoverRating || rating)
                  ? 'text-yellow-400 fill-current' // Filled star for selected or hovered
                  : 'text-gray-600' // Empty star otherwise
              }`}
            />
          </button>
        );
      })}
       <span className="ml-3 text-sm font-semibold text-gray-300 w-12 text-left">
        {rating > 0 ? `${rating.toFixed(0)} / ${maxRating}` : ''}
      </span>
    </div>
  );
};

export default StarRatingInput;
