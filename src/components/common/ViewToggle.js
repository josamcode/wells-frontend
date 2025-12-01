import React from 'react';
import { Squares2X2Icon, TableCellsIcon } from '@heroicons/react/24/outline';

const ViewToggle = ({ view, onViewChange }) => {
  return (
    <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-lg">
      <button
        onClick={() => onViewChange('cards')}
        className={`p-2 rounded transition-colors ${view === 'cards'
          ? 'bg-white text-primary-600 shadow-sm'
          : 'text-gray-600 hover:text-gray-900'
          }`}
        title="Card View"
      >
        <Squares2X2Icon className="w-5 h-5" />
      </button>
      <button
        onClick={() => onViewChange('table')}
        className={`p-2 rounded transition-colors ${view === 'table'
          ? 'bg-white text-primary-600 shadow-sm'
          : 'text-gray-600 hover:text-gray-900'
          }`}
        title="Table View"
      >
        <TableCellsIcon className="w-5 h-5" />
      </button>
    </div>
  );
};

export default ViewToggle;

