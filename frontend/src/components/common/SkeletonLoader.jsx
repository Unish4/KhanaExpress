import React from 'react';

export const SkeletonLoader = ({ type = 'card', count = 1, className = '' }) => {
  const items = Array.from({ length: count });

  if (type === 'card') {
    return (
      <div className={`grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 ${className}`}>
        {items.map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs"
          >
            <div className="shimmer h-40 w-full" />
            <div className="p-4 space-y-3">
              <div className="shimmer h-5 w-3/4 rounded-md" />
              <div className="shimmer h-3.5 w-1/2 rounded-md" />
              <div className="shimmer h-3.5 w-4/5 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'list') {
    return (
      <div className={`space-y-3 ${className}`}>
        {items.map((_, i) => (
          <div
            key={i}
            className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-4 shadow-xs"
          >
            <div className="shimmer w-12 h-12 rounded-lg flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="shimmer h-4 w-1/3 rounded-md" />
              <div className="shimmer h-3 w-2/3 rounded-md" />
            </div>
            <div className="shimmer h-8 w-20 rounded-lg flex-shrink-0" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'detail') {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="shimmer h-56 w-full rounded-2xl" />
        <div className="space-y-3">
          <div className="shimmer h-8 w-1/3 rounded-lg" />
          <div className="shimmer h-4 w-1/2 rounded-md" />
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-2.5 ${className}`}>
      {items.map((_, i) => (
        <div key={i} className="shimmer h-4 w-full rounded-md" />
      ))}
    </div>
  );
};

export default SkeletonLoader;
