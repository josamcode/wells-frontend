import React, { memo } from 'react';

const Badge = memo(({
  children,
  status,
  variant,
  size = 'md',
  dot = false,
  className = ''
}) => {
  // Status-based colors
  const statusColors = {
    // Project statuses
    planning: 'bg-info-100 text-info-700 ring-info-600/20',
    in_progress: 'bg-warning-100 text-warning-700 ring-warning-600/20',
    on_hold: 'bg-secondary-100 text-secondary-700 ring-secondary-600/20',
    completed: 'bg-success-100 text-success-700 ring-success-600/20',
    cancelled: 'bg-danger-100 text-danger-700 ring-danger-600/20',
    delayed: 'bg-danger-100 text-danger-700 ring-danger-600/20',

    // Report statuses
    draft: 'bg-secondary-100 text-secondary-700 ring-secondary-600/20',
    submitted: 'bg-info-100 text-info-700 ring-info-600/20',
    under_review: 'bg-warning-100 text-warning-700 ring-warning-600/20',
    approved: 'bg-success-100 text-success-700 ring-success-600/20',
    rejected: 'bg-danger-100 text-danger-700 ring-danger-600/20',

    // User status
    active: 'bg-success-100 text-success-700 ring-success-600/20',
    inactive: 'bg-secondary-100 text-secondary-700 ring-secondary-600/20',

    // General
    success: 'bg-success-100 text-success-700 ring-success-600/20',
    warning: 'bg-warning-100 text-warning-700 ring-warning-600/20',
    danger: 'bg-danger-100 text-danger-700 ring-danger-600/20',
    info: 'bg-info-100 text-info-700 ring-info-600/20',
    default: 'bg-secondary-100 text-secondary-700 ring-secondary-600/20',
  };

  // Dot colors
  const dotColors = {
    planning: 'bg-info-500',
    in_progress: 'bg-warning-500',
    on_hold: 'bg-secondary-400',
    completed: 'bg-success-500',
    cancelled: 'bg-danger-500',
    delayed: 'bg-danger-500',
    draft: 'bg-secondary-400',
    submitted: 'bg-info-500',
    under_review: 'bg-warning-500',
    approved: 'bg-success-500',
    rejected: 'bg-danger-500',
    active: 'bg-success-500',
    inactive: 'bg-secondary-400',
    success: 'bg-success-500',
    warning: 'bg-warning-500',
    danger: 'bg-danger-500',
    info: 'bg-info-500',
    default: 'bg-secondary-400',
  };

  // Variant-based colors (alternative to status)
  const variantColors = {
    primary: 'bg-primary-100 text-primary-700 ring-primary-600/20',
    secondary: 'bg-secondary-100 text-secondary-700 ring-secondary-600/20',
    success: 'bg-success-100 text-success-700 ring-success-600/20',
    warning: 'bg-warning-100 text-warning-700 ring-warning-600/20',
    danger: 'bg-danger-100 text-danger-700 ring-danger-600/20',
    info: 'bg-info-100 text-info-700 ring-info-600/20',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  };

  const colorClass = variant
    ? variantColors[variant]
    : (status && statusColors[status]) || statusColors.default;

  const dotColor = status ? dotColors[status] : dotColors.default;

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 
        font-semibold rounded-full 
        ring-1 ring-inset
        ${sizes[size]}
        ${colorClass}
        ${className}
      `}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      )}
      {children}
    </span>
  );
});

Badge.displayName = 'Badge';

// Status Badge with built-in dot
export const StatusBadge = memo(({ status, label, size = 'md' }) => {
  return (
    <Badge status={status} size={size} dot>
      {label}
    </Badge>
  );
});

StatusBadge.displayName = 'StatusBadge';

export default Badge;
