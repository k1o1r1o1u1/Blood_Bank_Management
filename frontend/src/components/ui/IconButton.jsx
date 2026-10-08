import React from 'react';

export default function IconButton({
  icon: Icon,
  variant = 'ghost',
  size = 'md',
  badge = false,
  badgeContent,
  className = '',
  'aria-label': ariaLabel,
  ...props
}) {
  const baseStyles = 'relative inline-flex items-center justify-center rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 select-none active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed';

  const variants = {
    ghost: 'text-text-muted hover:text-text-main hover:bg-black/5 focus:ring-gray-300',
    secondary: 'bg-surface text-text-main border border-border-subtle hover:bg-bg-canvas hover:border-gray-300 focus:ring-gray-300 shadow-sm',
    primary: 'bg-brand-teal text-white hover:bg-brand-teal-hover focus:ring-brand-teal shadow-sm',
    dark: 'bg-brand-dark text-white hover:bg-brand-dark-hover focus:ring-brand-dark',
  };

  const sizes = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
  };

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      className={`${baseStyles} ${variants[variant] || variants.ghost} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {Icon && <Icon className="w-5 h-5 shrink-0" />}
      {badge && (
        <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blood ring-2 ring-white" />
      )}
      {badgeContent && (
        <span className="absolute -top-1 -right-1 px-1.5 py-0.2 text-[10px] font-semibold rounded-full bg-blood text-white ring-2 ring-white">
          {badgeContent}
        </span>
      )}
    </button>
  );
}
