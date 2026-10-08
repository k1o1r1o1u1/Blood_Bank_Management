import React, { useState } from 'react';

export default function Tooltip({
  content,
  children,
  position = 'right',
  className = '',
}) {
  const [isVisible, setIsVisible] = useState(false);

  if (!content) return children;

  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div
      className={`relative inline-flex items-center ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          role="tooltip"
          className={`absolute z-50 whitespace-nowrap bg-brand-dark text-white text-[11px] font-medium px-2.5 py-1 rounded-md shadow-lg pointer-events-none transition-opacity duration-150 border border-white/10 ${positions[position] || positions.right}`}
        >
          {content}
        </div>
      )}
    </div>
  );
}
