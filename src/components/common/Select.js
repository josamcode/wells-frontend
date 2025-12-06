import React, { memo, forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

const SelectComponent = forwardRef((props, ref) => {
  const { t } = useTranslation();
  const {
    label,
    error,
    hint,
    options = [],
    placeholder,
    className = '',
    containerClassName = '',
    required = false,
    ...restProps
  } = props;

  const defaultPlaceholder = placeholder || t('common.selectOption');
  return (
    <div className={containerClassName}>
      {label && (
        <label className="block text-sm font-medium text-secondary-700 mb-2">
          {label}
          {required && <span className="text-danger-500 ltr:ml-1 rtl:mr-1">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          className={`
            w-full px-4 py-3 ltr:pr-10 rtl:pl-10
            bg-white border rounded-xl
            text-secondary-900
            appearance-none
            transition-all duration-200
            hover:border-secondary-300
            focus:outline-none focus:ring-2 focus:border-primary-500 focus:ring-primary-500/20
            disabled:bg-secondary-50 disabled:text-secondary-500 disabled:cursor-not-allowed
            ${!restProps.value ? 'text-secondary-400' : ''}
            ${error
              ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500/20'
              : 'border-secondary-200'
            }
            ${className}
          `}
          {...restProps}
        >
          <option value="">{defaultPlaceholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 ltr:right-0 rtl:left-0 ltr:pr-3 rtl:pl-3 flex items-center pointer-events-none">
          <ChevronDownIcon className={`w-5 h-5 ${error ? 'text-danger-400' : 'text-secondary-400'}`} />
        </div>
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

SelectComponent.displayName = 'Select';

const Select = memo(SelectComponent);

export default Select;
