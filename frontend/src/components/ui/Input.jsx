import React from 'react';

export default function Input({
  label,
  error,
  helperText,
  icon: Icon,
  type = 'text',
  className = '',
  id,
  ...props
}) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-text-main mb-1.5">
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3.5 pointer-events-none text-text-muted">
            <Icon className="w-4 h-4" />
          </div>
        )}

        <input
          id={inputId}
          type={type}
          className={`w-full bg-surface text-text-main placeholder-text-muted/60 text-sm rounded-xl border border-border-subtle py-2.5 transition-all duration-150 focus:outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal disabled:bg-bg-canvas disabled:text-text-muted ${Icon ? 'pl-10' : 'pl-3.5'} pr-3.5 ${error ? 'border-blood focus:border-blood focus:ring-blood' : ''} ${className}`}
          {...props}
        />
      </div>

      {error ? (
        <p className="mt-1 text-xs text-blood">{error}</p>
      ) : helperText ? (
        <p className="mt-1 text-xs text-text-muted">{helperText}</p>
      ) : null}
    </div>
  );
}
