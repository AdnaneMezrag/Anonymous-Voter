import { useState, useEffect } from 'react';

interface StarRatingProps {
  initialRating?: number;
  totalStars?: number;
  onRatingChange: (rating: number) => void;
  disabled?: boolean;
}

export const StarRating = ({
  initialRating = 0,
  totalStars = 5,
  onRatingChange,
  disabled = false
}: StarRatingProps) => {
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedRating, setSelectedRating] = useState(initialRating);

  // Ensure selected rating updates when initialRating changes (after voting)
  useEffect(() => {
    setSelectedRating(initialRating);
  }, [initialRating]);

  const handleMouseOver = (rating: number) => {
    if (disabled) return;
    setHoverRating(rating);
  };

  const handleMouseLeave = () => {
    setHoverRating(0);
  };

  const handleClick = (rating: number) => {
    if (disabled) return;
    setSelectedRating(rating);
    onRatingChange(rating);
  };

  return (
    <div className="flex gap-2 justify-center">
      {[...Array(totalStars)].map((_, i) => {
        const ratingValue = i + 1;
        const filled = ratingValue <= (hoverRating || selectedRating);
        
        return (
          <button
            type="button"
            key={`star-${i}`}
            className={`text-3xl transition-all duration-300 ${
              filled ? 'gold-star transform scale-110' : 'text-white/40'
            } ${disabled ? 'opacity-100 cursor-not-allowed' : 'cursor-pointer hover:transform hover:scale-125'}`}
            onMouseOver={() => handleMouseOver(ratingValue)}
            onMouseLeave={handleMouseLeave}
            onClick={() => handleClick(ratingValue)}
            disabled={disabled}
            aria-label={`Rate ${ratingValue} out of ${totalStars} stars`}
          >
            ★
          </button>
        );
      })}
    </div>
  );
};