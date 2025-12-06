import React, { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { TableCellsIcon, Squares2X2Icon } from '@heroicons/react/24/outline';

const ViewToggle = memo(({ view, onViewChange }) => {
  const { t } = useTranslation();
  const handleTableView = useCallback(() => onViewChange('table'), [onViewChange]);
  const handleCardsView = useCallback(() => onViewChange('cards'), [onViewChange]);

  return (
    <div className="inline-flex rounded-xl bg-secondary-100 p-1">
      <button
        onClick={handleTableView}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
          transition-all duration-200
          ${view === 'table'
            ? 'bg-white text-secondary-900 shadow-soft'
            : 'text-secondary-500 hover:text-secondary-700'
          }
        `}
        title={t('common.tableView')}
      >
        <TableCellsIcon className="w-4 h-4" />
        <span className="hidden sm:inline">{t('common.table')}</span>
      </button>
      <button
        onClick={handleCardsView}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
          transition-all duration-200
          ${view === 'cards'
            ? 'bg-white text-secondary-900 shadow-soft'
            : 'text-secondary-500 hover:text-secondary-700'
          }
        `}
        title={t('common.cardView')}
      >
        <Squares2X2Icon className="w-4 h-4" />
        <span className="hidden sm:inline">{t('common.cards')}</span>
      </button>
    </div>
  );
});

ViewToggle.displayName = 'ViewToggle';

export default ViewToggle;
