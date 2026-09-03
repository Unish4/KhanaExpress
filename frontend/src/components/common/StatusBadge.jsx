import React from 'react';

export const StatusBadge = ({ status = 'pending', className = '' }) => {
  const normalizedStatus = status.toLowerCase();

  const statusConfig = {
    pending: {
      label: 'Pending',
      bg: '#eff6ff',
      border: '#bfdbfe',
      color: '#1d4ed8',
    },
    confirmed: {
      label: 'Confirmed',
      bg: '#fffbeb',
      border: '#fde68a',
      color: '#b45309',
    },
    preparing: {
      label: 'Preparing',
      bg: '#fffbeb',
      border: '#fde68a',
      color: '#b45309',
    },
    ready: {
      label: 'Ready for Pickup',
      bg: '#f5f3ff',
      border: '#ddd6fe',
      color: '#6d28d9',
    },
    delivering: {
      label: 'Out for Delivery',
      bg: '#eff6ff',
      border: '#bfdbfe',
      color: '#1d4ed8',
    },
    delivered: {
      label: 'Delivered',
      bg: '#f0fdf4',
      border: '#bbf7d0',
      color: '#15803d',
    },
    completed: {
      label: 'Completed',
      bg: '#f0fdf4',
      border: '#bbf7d0',
      color: '#15803d',
    },
    cancelled: {
      label: 'Cancelled',
      bg: '#fef2f2',
      border: '#fecaca',
      color: '#b91c1c',
    },
  };

  const config = statusConfig[normalizedStatus] || {
    label: status,
    bg: '#f8fafc',
    border: '#e2e8f0',
    color: '#475569',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-[6px] border ${className}`}
      style={{
        backgroundColor: config.bg,
        borderColor: config.border,
        color: config.color,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: config.color }}
      />
      {config.label}
    </span>
  );
};

export default StatusBadge;
