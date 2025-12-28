import React, { useState, memo } from 'react';
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';

const StarRating = memo(({ value = 0, onChange, maxStars = 7, size = 'lg', disabled = false }) => {
  const [hoveredStar, setHoveredStar] = useState(0);

  const handleStarClick = (rating) => {
    if (!disabled && onChange) {
      onChange(rating);
    }
  };

  const handleStarHover = (rating) => {
    if (!disabled) {
      setHoveredStar(rating);
    }
  };

  const handleMouseLeave = () => {
    if (!disabled) {
      setHoveredStar(0);
    }
  };

  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-7 h-7',
    lg: 'w-10 h-10',
    xl: 'w-12 h-12',
  };

  const starSize = sizeClasses[size] || sizeClasses.lg;

  return (
    <div className="flex items-center gap-2" onMouseLeave={handleMouseLeave}>
      {Array.from({ length: maxStars }, (_, index) => {
        const starNumber = index + 1;
        const isFilled = starNumber <= (hoveredStar || value);
        const isHovered = starNumber <= hoveredStar && hoveredStar > value;

        return (
          <button
            key={starNumber}
            type="button"
            onClick={() => handleStarClick(starNumber)}
            onMouseEnter={() => handleStarHover(starNumber)}
            disabled={disabled}
            className={`
              ${starSize}
              transition-all duration-200
              ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:scale-110'}
              ${isHovered ? 'transform scale-110' : ''}
            `}
          >
            {isFilled ? (
              <StarIcon className={`${starSize} text-yellow-400 fill-yellow-400`} />
            ) : (
              <StarOutlineIcon className={`${starSize} text-secondary-300`} />
            )}
          </button>
        );
      })}
      {value > 0 && (
        <span className="text-sm font-medium text-secondary-600 ml-2">
          {value} / {maxStars}
        </span>
      )}
    </div>
  );
});

StarRating.displayName = 'StarRating';

export default StarRating;
