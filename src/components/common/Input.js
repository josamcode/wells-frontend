import React, { memo, forwardRef } from 'react';

const InputComponent = forwardRef((props, ref) => {
  const {
    label,
    error,
    hint,
    type = 'text',
    className = '',
    containerClassName = '',
    required = false,
    icon: Icon,
    iconPosition = 'left',
    ...restProps
  } = props;
  const hasIcon = Icon && iconPosition;

  return (
    <div className={containerClassName}>
      {label && (
        <label className="block text-sm font-medium text-secondary-700 mb-2">
          {label}
          {required && <span className="text-danger-500 ltr:ml-1 rtl:mr-1">*</span>}
        </label>
      )}
      <div className="relative">
        {hasIcon && iconPosition === 'left' && (
          <div className="absolute inset-y-0 ltr:left-0 rtl:right-0 ltr:pl-4 rtl:pr-4 flex items-center pointer-events-none">
            <Icon className={`w-5 h-5 ${error ? 'text-danger-400' : 'text-secondary-400'}`} />
          </div>
        )}
        <input
          ref={ref}
          type={type}
          className={`
            w-full px-4 py-3 
            bg-white border rounded-xl
            text-secondary-900 placeholder-secondary-400
            transition-all duration-200
            hover:border-secondary-300
            focus:outline-none focus:ring-2 focus:border-primary-500 focus:ring-primary-500/20
            disabled:bg-secondary-50 disabled:text-secondary-500 disabled:cursor-not-allowed
            ${hasIcon && iconPosition === 'left' ? 'ltr:pl-12 rtl:pr-12' : ''}
            ${hasIcon && iconPosition === 'right' ? 'ltr:pr-12 rtl:pl-12' : ''}
            ${error
              ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500/20'
              : 'border-secondary-200'
            }
            ${className}
          `}
          {...restProps}
        />
        {hasIcon && iconPosition === 'right' && (
          <div className="absolute inset-y-0 ltr:right-0 rtl:left-0 ltr:pr-4 rtl:pl-4 flex items-center pointer-events-none">
            <Icon className={`w-5 h-5 ${error ? 'text-danger-400' : 'text-secondary-400'}`} />
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

InputComponent.displayName = 'Input';

const Input = memo(InputComponent);

// Search Input Component
const SearchInputComponent = forwardRef((props, ref) => {
  const {
    value,
    onChange,
    onClear,
    placeholder = 'Search...',
    className = '',
    ...restProps
  } = props;
  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-y-0 ltr:left-0 rtl:right-0 ltr:pl-4 rtl:pr-4 flex items-center pointer-events-none">
        <svg className="w-5 h-5 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <input
        ref={ref}
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="
          w-full ltr:pl-12 rtl:pr-12 ltr:pr-10 rtl:pl-10 py-3
          bg-secondary-50 border-0 rounded-xl
          text-secondary-900 placeholder-secondary-400
          transition-all duration-200
          focus:bg-white focus:ring-2 focus:ring-primary-500/20
        "
        {...restProps}
      />
      {value && onClear && (
        <button
          onClick={onClear}
          className="absolute inset-y-0 ltr:right-0 rtl:left-0 ltr:pr-4 rtl:pl-4 flex items-center text-secondary-400 hover:text-secondary-600"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
});

SearchInputComponent.displayName = 'SearchInput';

export const SearchInput = memo(SearchInputComponent);

export default Input;
