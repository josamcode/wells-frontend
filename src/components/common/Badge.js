import React from 'react';
import { getStatusColor } from '../../utils/helpers';

const Badge = ({ children, status, className = '' }) => {
  const colorClass = status ? getStatusColor(status) : 'bg-gray-100 text-gray-800';

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;

