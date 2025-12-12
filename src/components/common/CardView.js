import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../contexts/LanguageContext';
import { CardSkeleton } from './Loading';
import Badge from './Badge';
import { FolderIcon, DocumentTextIcon, UserIcon, CalendarIcon, MapPinIcon } from '@heroicons/react/24/outline';

const CardView = memo(({
  data,
  columns,
  loading,
  onItemClick,
  emptyMessage,
  type = 'default' // 'project', 'report', 'user', 'default'
}) => {
  const { t } = useTranslation();
  const defaultEmptyMessage = emptyMessage || t('common.noItemsFound');

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <CardSkeleton key={i} lines={3} />
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="empty-state py-16">
        <svg className="empty-state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <p className="empty-state-title">{defaultEmptyMessage}</p>
        <p className="empty-state-description">
          {t('common.noItemsToDisplay')}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {data.map((item, index) => (
        <ItemCard
          key={index}
          item={item}
          columns={columns}
          onItemClick={onItemClick}
          type={type}
        />
      ))}
    </div>
  );
});

// Enhanced Item Card Component
const ItemCard = memo(({ item, columns, onItemClick, type }) => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  // Get status column (if columns provided)
  const statusColumn = columns?.find(col => col.header?.toLowerCase().includes('status'));
  const status = statusColumn?.render ? statusColumn.render(item) : item.status;

  // Get title (first column if columns provided, otherwise use item properties)
  const titleColumn = columns?.[0];
  const title = titleColumn?.render ? titleColumn.render(item) : (titleColumn?.accessor ? item[titleColumn.accessor] : null);

  // Get subtitle (second column if columns provided, otherwise use item properties)
  const subtitleColumn = columns?.[1];
  const subtitle = subtitleColumn?.render ? subtitleColumn.render(item) : (subtitleColumn?.accessor ? item[subtitleColumn.accessor] : null);

  // Determine card icon based on type or data
  const getCardIcon = () => {
    if (item.projectName || item.projectNumber) return FolderIcon;
    if (item.reportNumber || item.title) return DocumentTextIcon;
    if (item.email || item.fullName) return UserIcon;
    return FolderIcon;
  };

  const CardIcon = getCardIcon();

  // Get gradient based on status or type
  const getGradient = () => {
    if (item.status === 'completed' || item.status === 'approved') {
      return 'from-success-500 to-success-600';
    }
    if (item.status === 'in_progress' || item.status === 'under_review') {
      return 'from-warning-500 to-warning-600';
    }
    if (item.status === 'delayed' || item.status === 'rejected') {
      return 'from-danger-500 to-danger-600';
    }
    return 'from-primary-500 to-primary-600';
  };

  return (
    <div
      onClick={() => onItemClick && onItemClick(item)}
      className={`
        group relative bg-white rounded-2xl border border-secondary-100 overflow-hidden
        transition-all duration-300 hover:shadow-soft-lg hover:border-secondary-200
        ${onItemClick ? 'cursor-pointer hover:-translate-y-1' : ''}
      `}
    >
      {/* Top gradient bar */}
      {/* <div className={`h-1.5 bg-gradient-to-r ${getGradient()}`} /> */}
      <div className={`h-1.5 bg-secondary-100`} />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          {/* <div className={`
            w-12 h-12 rounded-xl bg-gradient-to-br ${getGradient()} 
            flex items-center justify-center flex-shrink-0
            shadow-soft group-hover:shadow-lg transition-shadow
          `}> */}
          <div className={`
            w-12 h-12 rounded-xl bg-gradient-to-br ${getGradient()} 
            flex items-center justify-center flex-shrink-0
            shadow-soft group-hover:shadow-lg transition-shadow
          `}>
            <CardIcon className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-secondary-900 line-clamp-2 leading-tight">
              {title !== null && title !== undefined ? title : (language === 'ar' && item.projectNameAr ? item.projectNameAr : item.projectName) || item.title || item.fullName || t('common.untitled')}
            </h3>
            <p className="text-sm text-secondary-500 mt-1 truncate">
              {subtitle !== null && subtitle !== undefined ? subtitle : item.projectNumber || item.reportNumber || item.email || ''}
            </p>
          </div>
        </div>

        {/* Meta info */}
        <div className="space-y-2.5">
          {/* Country/Location */}
          {(item.country || item.project?.country) && (
            <div className="flex items-center gap-2 text-sm">
              <MapPinIcon className="w-4 h-4 text-secondary-400 flex-shrink-0" />
              <span className="text-secondary-600 truncate">{item.country || item.project?.country}</span>
            </div>
          )}

          {/* Progress bar for projects */}
          {item.progress !== undefined && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-secondary-500">{t('common.progress')}</span>
                <span className="font-semibold text-secondary-900">{item.progress}%</span>
              </div>
              <div className="h-2 bg-secondary-100 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${getGradient()} rounded-full transition-all duration-500`}
                  style={{ width: `${item.progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Date */}
          {(item.createdAt || item.submittedAt) && (
            <div className="flex items-center gap-2 text-sm">
              <CalendarIcon className="w-4 h-4 text-secondary-400 flex-shrink-0" />
              <span className="text-secondary-500">
                {new Date(item.submittedAt || item.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            </div>
          )}

          {/* Contractor/Submitted by */}
          {(item.contractor?.fullName || item.submittedBy?.fullName) && (
            <div className="flex items-center gap-2 text-sm">
              <UserIcon className="w-4 h-4 text-secondary-400 flex-shrink-0" />
              <span className="text-secondary-600 truncate">
                {item.contractor?.fullName || item.submittedBy?.fullName}
              </span>
            </div>
          )}
        </div>

        {/* Footer with status */}
        {item.status && (
          <div className="mt-4 pt-4 border-t border-secondary-100 flex items-center justify-between">
            <Badge status={item.status} dot>
              {item.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Badge>
            <span className="text-xs text-secondary-400 group-hover:text-primary-600 transition-colors">
              {t('common.viewDetailsArrow')}
            </span>
          </div>
        )}

        {/* For users - role badge */}
        {item.role && !item.status && (
          <div className="mt-4 pt-4 border-t border-secondary-100 flex items-center justify-between">
            <Badge variant="primary">
              {item.role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Badge>
            <Badge status={item.isActive ? 'active' : 'inactive'} dot>
              {item.isActive ? t('common.active') : t('common.inactive')}
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
});

ItemCard.displayName = 'ItemCard';
CardView.displayName = 'CardView';

export default CardView;
