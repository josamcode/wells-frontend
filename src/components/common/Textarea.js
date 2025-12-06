import React, { memo, forwardRef } from 'react';

const TextareaComponent = forwardRef((props, ref) => {
  const {
    label,
    error,
    hint,
    className = '',
    containerClassName = '',
    required = false,
    rows = 4,
    ...restProps
  } = props;
  return (
    <div className={containerClassName}>
      {label && (
        <label className="block text-sm font-medium text-secondary-700 mb-2">
          {label}
          {required && <span className="text-danger-500 ltr:ml-1 rtl:mr-1">*</span>}
        </label>
      )}
      <textarea
        ref={ref}
        rows={rows}
        className={`
          w-full px-4 py-3 
          bg-white border rounded-xl
          text-secondary-900 placeholder-secondary-400
          transition-all duration-200
          hover:border-secondary-300
          focus:outline-none focus:ring-2 focus:border-primary-500 focus:ring-primary-500/20
          disabled:bg-secondary-50 disabled:text-secondary-500 disabled:cursor-not-allowed
          resize-none
          ${error
            ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500/20'
            : 'border-secondary-200'
          }
          ${className}
        `}
        {...restProps}
      />
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

TextareaComponent.displayName = 'Textarea';

const Textarea = memo(TextareaComponent);

export default Textarea;
