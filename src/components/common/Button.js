import React, { memo, forwardRef } from 'react';

const ButtonComponent = forwardRef((props, ref) => {
  const {
    children,
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    loading = false,
    disabled = false,
    icon: Icon,
    iconPosition = 'left',
    className = '',
    ...restProps
  } = props;
  const baseClasses = `
    inline-flex items-center justify-center font-semibold rounded-xl
    transition-all duration-200 ease-out
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
    active:scale-[0.98]
  `;

  const variants = {
    primary: `
      bg-gradient-to-r from-primary-600 to-primary-700 text-white 
      hover:from-primary-700 hover:to-primary-800 
      focus:ring-primary-500 
      shadow-soft hover:shadow-lg
    `,
    secondary: `
      bg-secondary-100 text-secondary-700 
      hover:bg-secondary-200 
      focus:ring-secondary-500
    `,
    success: `
      bg-gradient-to-r from-success-500 to-success-600 text-white 
      hover:from-success-600 hover:to-success-700 
      focus:ring-success-500 
      shadow-soft
    `,
    danger: `
      bg-gradient-to-r from-danger-500 to-danger-600 text-white 
      hover:from-danger-600 hover:to-danger-700 
      focus:ring-danger-500 
      shadow-soft
    `,
    warning: `
      bg-gradient-to-r from-warning-500 to-warning-600 text-white 
      hover:from-warning-600 hover:to-warning-700 
      focus:ring-warning-500 
      shadow-soft
    `,
    outline: `
      border-2 border-primary-500 text-primary-600 
      hover:bg-primary-50 
      focus:ring-primary-500
    `,
    ghost: `
      text-secondary-600 
      hover:bg-secondary-100 
      focus:ring-secondary-500
    `,
    'outline-danger': `
      border-2 border-danger-500 text-danger-600 
      hover:bg-danger-50 
      focus:ring-danger-500
    `,
  };

  const sizes = {
    xs: 'px-2.5 py-1.5 text-xs gap-1.5',
    sm: 'px-3.5 py-2 text-sm gap-2',
    md: 'px-5 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2.5',
    xl: 'px-8 py-4 text-lg gap-3',
  };

  const iconSizes = {
    xs: 'w-3.5 h-3.5',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-5 h-5',
    xl: 'w-6 h-6',
  };

  const classes = `
    ${baseClasses}
    ${variants[variant]}
    ${sizes[size]}
    ${fullWidth ? 'w-full' : ''}
    ${className}
  `.replace(/\s+/g, ' ').trim();

  const LoadingSpinner = () => (
    <svg
      className={`animate-spin ${iconSizes[size]} ${iconPosition === 'right' ? 'ltr:ml-2 rtl:mr-2' : 'ltr:mr-2 rtl:ml-2'}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );

  return (
    <button
      ref={ref}
      className={classes}
      disabled={disabled || loading}
      {...restProps}
    >
      {loading && iconPosition === 'left' && <LoadingSpinner />}
      {!loading && Icon && iconPosition === 'left' && (
        <Icon className={`${iconSizes[size]} ltr:mr-1 rtl:ml-1`} />
      )}
      {children}
      {!loading && Icon && iconPosition === 'right' && (
        <Icon className={`${iconSizes[size]} ltr:ml-1 rtl:mr-1`} />
      )}
      {loading && iconPosition === 'right' && <LoadingSpinner />}
    </button>
  );
});

ButtonComponent.displayName = 'Button';

const Button = memo(ButtonComponent);

// Icon Button Component
const IconButtonComponent = forwardRef((props, ref) => {
  const {
    icon: Icon,
    variant = 'ghost',
    size = 'md',
    className = '',
    ...restProps
  } = props;
  const variants = {
    primary: 'bg-primary-100 text-primary-600 hover:bg-primary-200',
    secondary: 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200',
    success: 'bg-success-100 text-success-600 hover:bg-success-200',
    danger: 'bg-danger-100 text-danger-600 hover:bg-danger-200',
    warning: 'bg-warning-100 text-warning-600 hover:bg-warning-200',
    ghost: 'text-secondary-500 hover:bg-secondary-100 hover:text-secondary-700',
  };

  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <button
      ref={ref}
      className={`
        inline-flex items-center justify-center rounded-xl
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      {...restProps}
    >
      <Icon className={iconSizes[size]} />
    </button>
  );
});

IconButtonComponent.displayName = 'IconButton';

export const IconButton = memo(IconButtonComponent);

export default Button;
