import React from 'react';

export const VegIndicator = ({ isVeg = true, size = 14, className = '' }) => {
  const borderColor = isVeg ? '#16a34a' : '#dc2626';
  const dotColor = isVeg ? '#16a34a' : '#dc2626';

  return (
    <span
      className={`inline-flex items-center justify-center flex-shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius: 2,
        border: `1.5px solid ${borderColor}`,
      }}
      title={isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
    >
      <span
        style={{
          width: Math.round(size * 0.45),
          height: Math.round(size * 0.45),
          borderRadius: '50%',
          backgroundColor: dotColor,
        }}
      />
    </span>
  );
};

export default VegIndicator;
