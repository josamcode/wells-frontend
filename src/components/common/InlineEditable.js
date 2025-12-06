import React, { useState, useCallback, memo, useRef, useEffect } from 'react';
import { PencilIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

const InlineEditable = memo(({
  value,
  onSave,
  canEdit = false,
  type = 'text',
  options = [],
  displayValue,
  fieldName = 'field',
  className = '',
  placeholder = '',
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleEdit = useCallback((e) => {
    e.stopPropagation();
    setEditValue(value);
    setIsEditing(true);
  }, [value]);

  const handleCancel = useCallback((e) => {
    e?.stopPropagation();
    setIsEditing(false);
    setEditValue(value);
  }, [value]);

  const handleSave = useCallback(async (e) => {
    e?.stopPropagation();
    if (editValue === value) {
      setIsEditing(false);
      return;
    }

    setLoading(true);
    try {
      await onSave(editValue);
      setIsEditing(false);
    } catch (error) {
      // Revert on error
      setEditValue(value);
    } finally {
      setLoading(false);
    }
  }, [editValue, value, onSave]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && type !== 'textarea') {
      handleSave(e);
    } else if (e.key === 'Escape') {
      handleCancel(e);
    }
  }, [type, handleSave, handleCancel]);

  if (!canEdit) {
    return <span className={className}>{displayValue || value || '—'}</span>;
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
        {type === 'select' ? (
          <select
            ref={inputRef}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="px-2 py-1 text-sm border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white"
            disabled={loading}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            ref={inputRef}
            type={type}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="px-2 py-1 text-sm border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 w-full min-w-[100px]"
            disabled={loading}
          />
        )}
        <button
          onClick={handleSave}
          disabled={loading}
          className="p-1 text-success-600 hover:bg-success-50 rounded transition-colors disabled:opacity-50"
          title="Save"
        >
          <CheckIcon className="w-4 h-4" />
        </button>
        <button
          onClick={handleCancel}
          disabled={loading}
          className="p-1 text-secondary-500 hover:bg-secondary-100 rounded transition-colors disabled:opacity-50"
          title="Cancel"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="group flex items-center gap-2">
      <span className={className}>{displayValue || value || '—'}</span>
      <button
        onClick={handleEdit}
        className="p-1 text-secondary-400 hover:text-primary-600 hover:bg-primary-50 rounded opacity-0 group-hover:opacity-100 transition-all"
        title={`Edit ${fieldName}`}
      >
        <PencilIcon className="w-3.5 h-3.5" />
      </button>
    </div>
  );
});

InlineEditable.displayName = 'InlineEditable';

export default InlineEditable;
