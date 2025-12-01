import React from 'react';
import { Link } from 'react-router-dom';
import Badge from './Badge';
import { formatDate } from '../../utils/helpers';

const CardView = ({ data, columns, onItemClick, loading, emptyMessage = 'No data available' }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">{emptyMessage}</div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {data.map((row, index) => {
        const firstColumn = columns[0];
        const mainTitle = firstColumn?.render ? firstColumn.render(row) : (firstColumn?.accessor ? row[firstColumn.accessor] : '');
        const otherColumns = columns.slice(1);

        return (
          <div
            key={index}
            onClick={() => onItemClick && onItemClick(row)}
            className={`bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow ${onItemClick ? 'cursor-pointer' : ''
              }`}
          >
            {/* Main title - first column */}
            <div className="mb-3 pb-3 border-b border-gray-200">
              <div className="text-base font-semibold text-gray-900 line-clamp-2">
                {mainTitle}
              </div>
            </div>

            {/* Other columns */}
            <div className="space-y-2">
              {otherColumns.map((column, colIndex) => {
                const value = column.render ? column.render(row) : (column.accessor ? row[column.accessor] : '');

                // Skip if no value
                if (!value && value !== 0) return null;

                return (
                  <div key={colIndex} className="flex items-start justify-between">
                    <span className="text-xs text-gray-500 ltr:mr-2 rtl:ml-2 flex-shrink-0">
                      {column.header}:
                    </span>
                    <span className="text-sm text-gray-700 text-right flex-1">
                      {value}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CardView;

