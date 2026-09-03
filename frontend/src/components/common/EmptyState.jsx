import React from 'react';
import { UtensilsCrossed } from 'lucide-react';
import Button from './Button';

export const EmptyState = ({
  icon: Icon = UtensilsCrossed,
  title = 'No items found',
  description = 'We could not find anything matching your request.',
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 min-h-[260px] bg-white rounded-2xl border border-slate-200 shadow-xs ${className}`}
    >
      <div className="w-16 h-16 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#f97316] mb-4">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-base font-semibold text-slate-900 mb-1">{title}</h3>
      <p className="text-xs text-slate-500 max-w-sm mb-5 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
