import React from 'react';

export default function Badge({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
  className = '',
}) {
  const variants = {
    teal: 'bg-brand-teal-light text-brand-teal border border-brand-teal/20',
    blood: 'bg-blood-light text-blood border border-blood/20',
    success: 'bg-success-light text-success border border-success/20',
    warning: 'bg-warning-light text-warning border border-warning/20',
    violet: 'bg-violet-light text-violet border border-violet/20',
    neutral: 'bg-[#EAEFEA] text-text-muted border border-border-subtle',
    dark: 'bg-brand-dark text-white border border-[#232F2C]',
  };

  const dotColors = {
    teal: 'bg-brand-teal',
    blood: 'bg-blood',
    success: 'bg-success',
    warning: 'bg-warning',
    violet: 'bg-violet',
    neutral: 'bg-text-muted',
    dark: 'bg-white',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 rounded-md gap-1',
    md: 'text-xs px-2.5 py-1 rounded-lg gap-1.5 font-medium',
    lg: 'text-sm px-3 py-1.5 rounded-xl gap-2 font-medium',
  };

  return (
    <span className={`inline-flex items-center tracking-wide ${variants[variant] || variants.neutral} ${sizes[size] || sizes.md} ${className}`}>
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant] || 'bg-current'} shrink-0`} />
      )}
      {children}
    </span>
  );
}
