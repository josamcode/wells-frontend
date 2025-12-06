import React, { useState, useRef, useEffect, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { XMarkIcon, ChevronDownIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const MultiSelect = memo(({
  label,
  options = [],
  value = [],
  onChange,
  placeholder,
  required = false,
  error,
  className = '',
  containerClassName = '',
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Focus search input when opened
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 100);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Filter options based on search term
  const filteredOptions = options.filter((option) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      option.label.toLowerCase().includes(searchLower) ||
      option.value.toLowerCase().includes(searchLower)
    );
  });

  // Get selected options
  const selectedOptions = options.filter((opt) => value.includes(opt.value));

  const handleToggle = (optionValue) => {
    const newValue = value.includes(optionValue)
      ? value.filter((v) => v !== optionValue)
      : [...value, optionValue];
    onChange(newValue);
  };

  const handleRemove = (optionValue, e) => {
    e.stopPropagation();
    const newValue = value.filter((v) => v !== optionValue);
    onChange(newValue);
  };

  const handleSelectAll = () => {
    if (value.length === filteredOptions.length) {
      onChange([]);
    } else {
      onChange(filteredOptions.map((opt) => opt.value));
    }
  };

  return (
    <div className={containerClassName} ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-secondary-700 mb-2">
          {label}
          {required && <span className="text-danger-500 ltr:ml-1 rtl:mr-1">*</span>}
        </label>
      )}

      <div className="relative">
        {/* Selected chips */}
        <div
          onClick={() => setIsOpen(!isOpen)}
          className={`
            w-full min-h-[48px] px-4 py-2
            bg-white border rounded-xl
            cursor-pointer
            transition-all duration-200
            hover:border-secondary-300
            focus-within:ring-2 focus-within:border-primary-500 focus-within:ring-primary-500/20
            ${error
              ? 'border-danger-500 focus-within:border-danger-500 focus-within:ring-danger-500/20'
              : 'border-secondary-200'
            }
            ${className}
          `}
        >
          <div className="flex flex-wrap items-center gap-2">
            {selectedOptions.length > 0 ? (
              selectedOptions.map((option) => (
                <span
                  key={option.value}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-100 text-primary-700 text-sm font-medium rounded-lg"
                >
                  <span className="truncate max-w-[200px]">{option.label}</span>
                  <button
                    type="button"
                    onClick={(e) => handleRemove(option.value, e)}
                    className="flex-shrink-0 text-primary-600 hover:text-primary-800 hover:bg-primary-200 rounded-full p-0.5 transition-colors"
                  >
                    <XMarkIcon className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))
            ) : (
              <span className="text-secondary-400 text-sm py-1">
                {placeholder || t('common.selectOption')}
              </span>
            )}
            <div className="ltr:ml-auto rtl:mr-auto flex-shrink-0">
              <ChevronDownIcon
                className={`w-5 h-5 text-secondary-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              />
            </div>
          </div>
        </div>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-2 bg-white border border-secondary-200 rounded-xl shadow-lg max-h-[300px] flex flex-col">
            {/* Search input */}
            <div className="p-3 border-b border-secondary-100">
              <div className="relative">
                <div className="absolute inset-y-0 ltr:left-0 rtl:right-0 ltr:pl-3 rtl:pr-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="w-4 h-4 text-secondary-400" />
                </div>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={t('common.search') || 'Search...'}
                  className="w-full ltr:pl-10 rtl:pr-10 pr-3 py-2 text-sm border border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:border-primary-500 focus:ring-primary-500/20"
                />
              </div>
            </div>

            {/* Options list */}
            <div className="overflow-y-auto max-h-[240px]">
              {filteredOptions.length > 0 ? (
                <>
                  {filteredOptions.length > 1 && (
                    <button
                      type="button"
                      onClick={handleSelectAll}
                      className="w-full px-4 py-2 text-left text-sm font-medium text-primary-600 hover:bg-primary-50 border-b border-secondary-100"
                    >
                      {value.length === filteredOptions.length
                        ? t('common.deselectAll') || 'Deselect All'
                        : t('common.selectAll') || 'Select All'}
                    </button>
                  )}
                  {filteredOptions.map((option) => {
                    const isSelected = value.includes(option.value);
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleToggle(option.value)}
                        className={`
                          w-full px-4 py-2.5 text-left text-sm
                          transition-colors
                          ${isSelected
                            ? 'bg-primary-50 text-primary-700 font-medium'
                            : 'text-secondary-700 hover:bg-secondary-50'
                          }
                        `}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`
                              w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0
                              ${isSelected
                                ? 'bg-primary-600 border-primary-600'
                                : 'border-secondary-300'
                              }
                            `}
                          >
                            {isSelected && (
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
                          </div>
                          <span className="flex-1 truncate">{option.label}</span>
                        </div>
                      </button>
                    );
                  })}
                </>
              ) : (
                <div className="px-4 py-8 text-center text-sm text-secondary-500">
                  {t('common.noItemsFound') || 'No options found'}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-2 text-sm text-danger-600 flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
});

MultiSelect.displayName = 'MultiSelect';

export default MultiSelect;
