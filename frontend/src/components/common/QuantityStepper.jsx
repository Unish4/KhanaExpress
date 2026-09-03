import React from 'react';

export const QuantityStepper = ({
  quantity = 1,
  onChange,
  min = 0,
  max = 20,
  size = 'md',
  className = '',
}) => {
  const handleDecrement = (e) => {
    e.stopPropagation();
    if (quantity > min) {
      onChange(quantity - 1);
    }
  };

  const handleIncrement = (e) => {
    e.stopPropagation();
    if (quantity < max) {
      onChange(quantity + 1);
    }
  };

  const heights = {
    sm: 'h-7 text-xs',
    md: 'h-8 text-sm',
    lg: 'h-9 text-base',
  };

  const btnWidths = {
    sm: 'w-6',
    md: 'w-8',
    lg: 'w-9',
  };

  return (
    <div
      className={`inline-flex items-center border-1.5 border-[#f97316] bg-white rounded-lg overflow-hidden select-none shadow-xs ${heights[size]} ${className}`}
    >
      <button
        type="button"
        onClick={handleDecrement}
        disabled={quantity <= min}
        className={`${btnWidths[size]} h-full flex items-center justify-center text-[#f97316] font-bold hover:bg-orange-50 active:bg-orange-100 transition-colors disabled:opacity-40 disabled:hover:bg-transparent`}
        aria-label="Decrease quantity"
      >
        −
      </button>
      <span
        className={`${btnWidths[size]} h-full flex items-center justify-center font-semibold text-slate-800 tabular-nums border-x border-orange-200 bg-orange-50/30`}
      >
        {quantity}
      </span>
      <button
        type="button"
        onClick={handleIncrement}
        disabled={quantity >= max}
        className={`${btnWidths[size]} h-full flex items-center justify-center text-[#f97316] font-bold hover:bg-orange-50 active:bg-orange-100 transition-colors disabled:opacity-40 disabled:hover:bg-transparent`}
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
};

export default QuantityStepper;
