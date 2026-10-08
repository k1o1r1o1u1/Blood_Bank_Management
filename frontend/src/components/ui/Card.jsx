import React from 'react';

export default function Card({
  children,
  variant = 'surface',
  radius = 'lg',
  hover = false,
  className = '',
  onClick,
  ...props
}) {
  const radii = {
    sm: 'rounded-[12px]',
    md: 'rounded-[18px]',
    lg: 'rounded-[24px]',
  };

  const variants = {
    surface: 'bg-surface text-text-main border border-border-subtle shadow-card-subtle',
    warm: 'bg-surface-warm text-text-main border border-[#EBE6DB] shadow-card-subtle',
    dark: 'bg-brand-dark text-white border border-[#232F2C]',
    flat: 'bg-bg-canvas text-text-main border border-border-subtle',
  };

  const hoverClass = hover ? 'transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover cursor-pointer' : '';

  return (
    <div
      onClick={onClick}
      className={`${variants[variant] || variants.surface} ${radii[radius] || radii.lg} ${hoverClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
