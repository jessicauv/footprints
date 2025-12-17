import React from 'react';

interface YelpStarsProps {
  rating: number;
  size?: 'small_16' | 'medium_20' | 'large_32';
  className?: string;
}

const YelpStars: React.FC<YelpStarsProps> = ({ rating, size = 'large_32', className = '' }) => {
  // Custom rounding logic: X.0-X.4 shows X stars, X.5-X.9 shows X.5 stars
  const getRatingFilename = (rating: number): string => {
    if (rating === 0) return '0';
    if (rating === 0.5) return 'half';

    const whole = Math.floor(rating);
    const decimal = rating % 1;

    // Special case for 0.5
    if (rating >= 0.5 && rating < 1) return 'half';

    // For ratings 1-5
    if (whole >= 1 && whole <= 5) {
      if (decimal >= 0.5) {
        // X.5-X.9 shows as X.5 stars
        return `${whole}_half`;
      } else {
        // X.0-X.4 shows as X stars
        return `${whole}_2`;
      }
    }

    return '0';
  };

  const filename = `Review_Ribbon_${size}_${getRatingFilename(rating)}@2x.png`;
  const imagePath = `/ReviewRibbon_v2/Desktop/${size}/${filename}`;

  return (
    <img
      src={imagePath}
      alt={`${rating} star rating`}
      className={`yelp-stars ${className}`}
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
    />
  );
};

// Helper function to get Yelp star image URL (for use in sidebar items)
export const getYelpStarsImageUrl = (rating: number, size: 'small_16' | 'medium_20' | 'large_32' = 'medium_20'): string => {
  // Custom rounding logic: X.0-X.4 shows X stars, X.5-X.9 shows X.5 stars
  const getRatingFilename = (rating: number): string => {
    if (rating === 0) return '0';
    if (rating === 0.5) return 'half';

    const whole = Math.floor(rating);
    const decimal = rating % 1;

    // Special case for 0.5
    if (rating >= 0.5 && rating < 1) return 'half';

    // For ratings 1-5
    if (whole >= 1 && whole <= 5) {
      if (decimal >= 0.5) {
        // X.5-X.9 shows as X.5 stars
        return `${whole}_half`;
      } else {
        // X.0-X.4 shows as X stars
        return `${whole}_2`;
      }
    }

    return '0';
  };

  const filename = `Review_Ribbon_${size}_${getRatingFilename(rating)}@2x.png`;
  return `/ReviewRibbon_v2/Desktop/${size}/${filename}`;
};

export default YelpStars;
