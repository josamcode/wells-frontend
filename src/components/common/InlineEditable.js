import React, { useState, useRef, useEffect, isValidElement } from 'react';
import { PencilIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

const InlineEditable = ({
  value,
  onSave,
  type = 'text',
  options = [],
  canEdit = true,
  className = '',
  displayValue,
  placeholder = '',
  validation,
  fieldName = '',
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value || '');
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      if (type === 'text' || type === 'number') {
        inputRef.current.select();
      }
    }
  }, [isEditing, type]);

  useEffect(() => {
    setEditValue(value || '');
  }, [value]);

  const handleEdit = (e) => {
    e.stopPropagation();
    if (!canEdit) return;
    setIsEditing(true);
    setEditValue(value || '');
  };

  const handleCancel = (e) => {
    e.stopPropagation();
    setIsEditing(false);
    setEditValue(value || '');
  };

  const handleSave = async (e) => {
    e.stopPropagation();
    
    // Validation
    if (validation && !validation(editValue)) {
      return;
    }

    if (editValue === value) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      await onSave(editValue);
      setIsEditing(false);
      toast.success(`${fieldName || 'Field'} updated successfully`);
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to update ${fieldName || 'field'}`);
      setEditValue(value || '');
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSave(e);
    } else if (e.key === 'Escape') {
      handleCancel(e);
    }
  };

  if (!canEdit) {
    const display = displayValue || value || '-';
    const isReactElement = isValidElement(display);
    return (
      <span className={className}>
        {isReactElement ? display : display}
      </span>
    );
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
        {type === 'select' ? (
          <select
            ref={inputRef}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 px-2 py-1 text-sm border border-primary-500 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
            disabled={isSaving}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
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
            className="flex-1 px-2 py-1 text-sm border border-primary-500 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
            disabled={isSaving}
          />
        )}
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="p-1 text-green-600 hover:text-green-700 hover:bg-green-50 rounded transition-colors disabled:opacity-50"
          title="Save"
        >
          <CheckIcon className="w-4 h-4" />
        </button>
        <button
          onClick={handleCancel}
          disabled={isSaving}
          className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
          title="Cancel"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      </div>
    );
  }

  const display = displayValue || value || '-';
  const isReactElement = isValidElement(display);
  
  return (
    <div className="flex items-center gap-2 group">
      <div className={className}>
        {isReactElement ? display : display}
      </div>
      <button
        onClick={handleEdit}
        className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded transition-all duration-200 flex-shrink-0"
        title="Edit"
      >
        <PencilIcon className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

export default InlineEditable;

