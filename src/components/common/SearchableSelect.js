import React, { useState, useRef, useEffect, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDownIcon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

const SearchableSelect = memo(({
  label,
  options = [],
  value,
  onChange,
  placeholder,
  required = false,
  error,
  hint,
  className = '',
  containerClassName = '',
  name,
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
      (option.value && option.value.toString().toLowerCase().includes(searchLower))
    );
  });

  // Get selected option
  const selectedOption = options.find((opt) => opt.value === value);

  const handleSelect = (optionValue) => {
    // Create a synthetic event object to match the expected onChange signature
    const syntheticEvent = {
      target: {
        name: name || '',
        value: optionValue,
      },
    };
    onChange(syntheticEvent);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = (e) => {
    e.stopPropagation();
    const syntheticEvent = {
      target: {
        name: name || '',
        value: '',
      },
    };
    onChange(syntheticEvent);
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
        {/* Selected value display */}
        <div
          onClick={() => setIsOpen(!isOpen)}
          className={`
            w-full min-h-[48px] px-4 py-3 ltr:pr-10 rtl:pl-10
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
          <div className="flex items-center justify-between">
            {selectedOption ? (
              <span className="text-secondary-900 block truncate">
                {selectedOption.label}
              </span>
            ) : (
              <span className="text-secondary-400 text-sm">
                {placeholder || t('common.selectOption')}
              </span>
            )}
            <div className="flex items-center gap-2 flex-shrink-0 ltr:ml-2 rtl:mr-2">
              {value && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-secondary-400 hover:text-secondary-600 transition-colors p-1"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              )}
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
                  className="w-full ltr:pl-9 rtl:pr-9 pr-3 py-2 text-sm border border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>

            {/* Options list */}
            <div className="overflow-y-auto max-h-[240px]">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => {
                  const isSelected = option.value === value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleSelect(option.value)}
                      className={`
                        w-full px-4 py-2.5 text-left text-sm
                        transition-colors
                        hover:bg-primary-50
                        ${isSelected
                          ? 'bg-primary-100 text-primary-700 font-medium'
                          : 'text-secondary-700'
                        }
                      `}
                    >
                      {option.label}
                    </button>
                  );
                })
              ) : (
                <div className="px-4 py-8 text-center text-sm text-secondary-500">
                  {t('common.noResults') || 'No results found'}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-2 text-sm text-danger-600 flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
      {hint && !error && (
        <p className="mt-2 text-sm text-secondary-500">{hint}</p>
      )}
    </div>
  );
});

SearchableSelect.displayName = 'SearchableSelect';

export default SearchableSelect;
