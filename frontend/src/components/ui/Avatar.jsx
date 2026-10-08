import React from 'react';

export default function Avatar({
  src,
  alt = '',
  name = '',
  size = 'md',
  status, // 'online' | 'busy' | 'offline'
  className = '',
}) {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  };

  const statusColors = {
    online: 'bg-success ring-white',
    busy: 'bg-blood ring-white',
    offline: 'bg-text-muted ring-white',
  };

  const getInitials = (nameStr) => {
    if (!nameStr) return 'A';
    return nameStr
      .split(' ')
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 rounded-full font-medium select-none overflow-visible ${sizes[size] || sizes.md} ${className}`}>
      {src ? (
        <img
          src={src}
          alt={alt || name}
          className="w-full h-full object-cover rounded-full"
        />
      ) : (
        <div className="w-full h-full rounded-full bg-brand-dark text-white flex items-center justify-center border border-border-subtle">
          {getInitials(name)}
        </div>
      )}

      {status && (
        <span
          className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ${statusColors[status] || 'bg-success'}`}
        />
      )}
    </div>
  );
}
