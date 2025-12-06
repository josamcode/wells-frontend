import React, { memo } from 'react';

const Card = memo(({
  children,
  title,
  subtitle,
  actions,
  className = '',
  padding = true,
  hover = false,
  gradient = false,
  noBorder = false,
}) => {
  const hasHeader = title || (actions !== undefined && actions !== null && actions !== false);

  return (
    <div
      className={`
        bg-white rounded-2xl shadow-soft 
        ${noBorder ? '' : 'border border-secondary-100'}
        ${hover ? 'transition-all duration-300 hover:shadow-soft-lg hover:border-secondary-200' : ''}
        ${gradient ? 'bg-gradient-to-br from-white to-secondary-50/50' : ''}
        ${className}
      `}
    >
      {hasHeader && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-secondary-100">
          <div>
            {title && (
              <h3 className="text-lg font-semibold text-secondary-900">{title}</h3>
            )}
            {subtitle && (
              <p className="text-sm text-secondary-500 mt-0.5">{subtitle}</p>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-2">{actions}</div>
          )}
        </div>
      )}
      <div className={padding ? 'p-6' : ''}>{children}</div>
    </div>
  );
});

Card.displayName = 'Card';

// Stat Card Component
export const StatCard = memo(({
  icon: Icon,
  label,
  value,
  trend,
  trendUp,
  color = 'primary',
  className = ''
}) => {
  const colorClasses = {
    primary: 'from-primary-500 to-primary-600',
    success: 'from-success-500 to-success-600',
    warning: 'from-warning-500 to-warning-600',
    danger: 'from-danger-500 to-danger-600',
    info: 'from-info-500 to-info-600',
  };

  const bgClasses = {
    primary: 'bg-primary-50',
    success: 'bg-success-50',
    warning: 'bg-warning-50',
    danger: 'bg-danger-50',
    info: 'bg-info-50',
  };

  const iconColorClasses = {
    primary: 'text-primary-600',
    success: 'text-success-600',
    warning: 'text-warning-600',
    danger: 'text-danger-600',
    info: 'text-info-600',
  };

  return (
    <div className={`card p-6 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-secondary-500 mb-1">{label}</p>
          <p className="text-3xl font-bold text-secondary-900 tracking-tight">{value}</p>
          {trend !== undefined && (
            <div className={`flex items-center mt-2 text-sm font-medium ${trendUp ? 'text-success-600' : 'text-danger-600'}`}>
              <span>{trendUp ? '↑' : '↓'} {trend}</span>
              <span className="text-secondary-400 ltr:ml-1 rtl:mr-1">vs last month</span>
            </div>
          )}
        </div>
        <div className={`w-14 h-14 rounded-2xl ${bgClasses[color]} flex items-center justify-center`}>
          <Icon className={`w-7 h-7 ${iconColorClasses[color]}`} />
        </div>
      </div>
    </div>
  );
});

StatCard.displayName = 'StatCard';

export default Card;
