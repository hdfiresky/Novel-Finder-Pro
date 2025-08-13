
import React, { useState } from 'react';
import Icon from '../Icon';

interface StarRatingInputProps {
  rating: number;
  setRating: (rating: number) => void;
  maxRating?: number;
  size?: number;
}

const StarRatingInput: React.FC<StarRatingInputProps> = ({ rating, setRating, maxRating = 10, size = 20 }) => {
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
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-600'
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
