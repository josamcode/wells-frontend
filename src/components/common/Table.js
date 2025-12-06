import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';

const Table = memo(({ columns, data, onRowClick, loading = false, emptyMessage }) => {
  const { t } = useTranslation();
  const defaultEmptyMessage = emptyMessage || t('common.noData');
  if (loading) {
    return (
      <div className="overflow-hidden rounded-xl border border-secondary-200">
        <div className="bg-secondary-50/80 px-6 py-4">
          <div className="flex gap-4">
            {columns.map((_, idx) => (
              <div key={idx} className="h-4 w-24 skeleton rounded" />
            ))}
          </div>
        </div>
        <div className="divide-y divide-secondary-100">
          {[1, 2, 3, 4, 5].map((row) => (
            <div key={row} className="px-6 py-4 flex gap-4">
              {columns.map((_, idx) => (
                <div key={idx} className="h-4 w-32 skeleton rounded" style={{ width: `${Math.random() * 50 + 50}%` }} />
              ))}
            </div>
          ))}
        </div>
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
    <div className="overflow-hidden rounded-xl border border-secondary-200">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-secondary-50/80">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className="px-4 py-3 ltr:text-left rtl:text-right text-xs font-semibold text-secondary-500 uppercase tracking-wider whitespace-nowrap"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-secondary-100">
            {data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                onClick={() => onRowClick && onRowClick(row)}
                className={`
                  transition-colors duration-150
                  ${onRowClick ? 'hover:bg-primary-50/50 cursor-pointer' : 'hover:bg-secondary-50/50'}
                `}
              >
                {columns.map((column, colIndex) => (
                  <td key={colIndex} className="px-4 py-3 text-sm text-secondary-700 whitespace-nowrap">
                    {column.render ? column.render(row) : row[column.accessor]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});

Table.displayName = 'Table';

export default Table;
