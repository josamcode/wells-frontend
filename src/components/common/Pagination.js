import React, { memo, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const Pagination = memo(({ currentPage, totalPages, onPageChange, className = '' }) => {
  const { t } = useTranslation();
  const getPageNumbers = useMemo(() => {
    const pages = [];
    const showPages = 5;

    if (totalPages <= showPages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  }, [currentPage, totalPages]);

  const handlePrevious = useCallback(() => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  }, [currentPage, onPageChange]);

  const handleNext = useCallback(() => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  }, [currentPage, totalPages, onPageChange]);

  if (totalPages <= 1) return null;

  return (
    <div className={`flex items-center justify-between pt-6 ${className}`}>
      {/* Page info - Mobile */}
      <div className="sm:hidden text-sm text-secondary-600">
        {t('common.page')} {currentPage} {t('common.of')} {totalPages}
      </div>

      {/* Desktop pagination */}
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-secondary-600">
            {t('common.page')} <span className="font-semibold text-secondary-900">{currentPage}</span> {t('common.of')}{' '}
            <span className="font-semibold text-secondary-900">{totalPages}</span>
          </p>
        </div>
        <nav className="flex items-center gap-1" aria-label="Pagination">
          {/* Previous Button */}
          <button
            onClick={handlePrevious}
            disabled={currentPage === 1}
            className="
              p-2 rounded-xl text-secondary-500 
              hover:bg-secondary-100 hover:text-secondary-700
              disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent
              transition-all
            "
          >
            <ChevronLeftIcon className="w-5 h-5 rtl:rotate-180" />
          </button>

          {/* Page Numbers */}
          <div className="flex items-center gap-1">
            {getPageNumbers.map((page, index) => (
              page === '...' ? (
                <span key={`ellipsis-${index}`} className="px-2 text-secondary-400">
                  •••
                </span>
              ) : (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={`
                    min-w-[40px] h-10 px-3 rounded-xl text-sm font-semibold
                    transition-all duration-200
                    ${currentPage === page
                      ? 'bg-primary-600 text-white shadow-glow'
                      : 'text-secondary-600 hover:bg-secondary-100'
                    }
                  `}
                >
                  {page}
                </button>
              )
            ))}
          </div>

          {/* Next Button */}
          <button
            onClick={handleNext}
            disabled={currentPage === totalPages}
            className="
              p-2 rounded-xl text-secondary-500 
              hover:bg-secondary-100 hover:text-secondary-700
              disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent
              transition-all
            "
          >
            <ChevronRightIcon className="w-5 h-5 rtl:rotate-180" />
          </button>
        </nav>
      </div>

      {/* Mobile Navigation */}
      <div className="flex gap-2 sm:hidden">
        <button
          onClick={handlePrevious}
          disabled={currentPage === 1}
          className="
            px-4 py-2 text-sm font-medium rounded-xl
            bg-secondary-100 text-secondary-700
            disabled:opacity-40 disabled:cursor-not-allowed
          "
        >
          {t('common.previous')}
        </button>
        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className="
            px-4 py-2 text-sm font-medium rounded-xl
            bg-primary-600 text-white
            disabled:opacity-40 disabled:cursor-not-allowed
          "
        >
          {t('common.next')}
        </button>
      </div>
    </div>
  );
});

Pagination.displayName = 'Pagination';

export default Pagination;
