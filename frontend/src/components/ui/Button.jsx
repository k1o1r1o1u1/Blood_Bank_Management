import React from 'react';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  className = '',
  onClick,
  type = 'button',
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const variants = {
    primary: 'bg-brand-teal text-white hover:bg-brand-teal-hover focus:ring-brand-teal shadow-sm active:scale-[0.98]',
    secondary: 'bg-surface text-text-main border border-border-subtle hover:bg-bg-canvas hover:border-gray-300 focus:ring-gray-300 shadow-sm active:scale-[0.98]',
    outline: 'bg-transparent text-brand-teal border border-brand-teal hover:bg-brand-teal-light focus:ring-brand-teal active:scale-[0.98]',
    ghost: 'bg-transparent text-text-main hover:bg-black/5 focus:ring-gray-300',
    danger: 'bg-blood text-white hover:bg-red-700 focus:ring-blood shadow-sm active:scale-[0.98]',
    dark: 'bg-brand-dark text-white hover:bg-brand-dark-hover focus:ring-brand-dark shadow-sm active:scale-[0.98]',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 rounded-lg gap-1.5',
    md: 'text-sm px-4 py-2 rounded-xl gap-2',
    lg: 'text-base px-5 py-2.5 rounded-xl gap-2.5',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon className="w-4 h-4 shrink-0" />}
          {children}
          {Icon && iconPosition === 'right' && <Icon className="w-4 h-4 shrink-0" />}
        </>
      )}
    </button>
  );
}
