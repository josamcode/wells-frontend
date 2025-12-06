import React, { memo } from 'react';

const Loading = memo(({ size = 'md', text, fullScreen = false }) => {
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  const Container = ({ children }) => {
    if (fullScreen) {
      return (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
          {children}
        </div>
      );
    }
    return (
      <div className="flex flex-col items-center justify-center py-16">
        {children}
      </div>
    );
  };

  return (
    <Container>
      <div className="flex flex-col items-center gap-4">
        {/* Modern Spinner */}
        <div className="relative">
          <div className={`${sizes[size]} rounded-full border-4 border-secondary-200`} />
          <div
            className={`absolute top-0 left-0 ${sizes[size]} rounded-full border-4 border-transparent border-t-primary-600 animate-spin`}
          />
        </div>
        {text && (
          <p className="text-secondary-600 font-medium animate-pulse-soft">{text}</p>
        )}
      </div>
    </Container>
  );
});

Loading.displayName = 'Loading';

// Skeleton Loader Components
export const Skeleton = memo(({ className = '', variant = 'text' }) => {
  const variants = {
    text: 'h-4 w-full',
    title: 'h-6 w-3/4',
    avatar: 'w-12 h-12 rounded-full',
    button: 'h-10 w-24',
    card: 'h-48 w-full',
    image: 'aspect-video w-full',
  };

  return (
    <div
      className={`shimmer rounded-lg ${variants[variant]} ${className}`}
    />
  );
});

Skeleton.displayName = 'Skeleton';

// Card Skeleton
export const CardSkeleton = memo(({ lines = 3 }) => (
  <div className="card p-6 space-y-4">
    <div className="flex items-center gap-4">
      <Skeleton variant="avatar" />
      <div className="flex-1 space-y-2">
        <Skeleton variant="title" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
    <div className="space-y-3">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={`h-4 ${i === lines - 1 ? 'w-2/3' : 'w-full'}`}
        />
      ))}
    </div>
  </div>
));

CardSkeleton.displayName = 'CardSkeleton';

// Table Skeleton
export const TableSkeleton = memo(({ rows = 5, columns = 4 }) => (
  <div className="overflow-hidden rounded-xl border border-secondary-200">
    <div className="bg-secondary-50 px-6 py-4 flex gap-4">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} className="h-4 w-24" />
      ))}
    </div>
    <div className="divide-y divide-secondary-100">
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div key={rowIdx} className="px-6 py-4 flex gap-4">
          {Array.from({ length: columns }).map((_, colIdx) => (
            <Skeleton
              key={colIdx}
              className="h-4"
              style={{ width: `${Math.random() * 40 + 40}%` }}
            />
          ))}
        </div>
      ))}
    </div>
  </div>
));

TableSkeleton.displayName = 'TableSkeleton';

// Stats Grid Skeleton
export const StatsGridSkeleton = memo(({ count = 4 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="card p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-3">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-16" />
          </div>
          <Skeleton className="w-14 h-14 rounded-2xl" />
        </div>
      </div>
    ))}
  </div>
));

StatsGridSkeleton.displayName = 'StatsGridSkeleton';

export default Loading;
