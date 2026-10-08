import React from 'react';

export default function Divider({
  orientation = 'horizontal',
  className = '',
}) {
  if (orientation === 'vertical') {
    return <div className={`w-[1px] h-full bg-border-subtle self-stretch ${className}`} />;
  }

  return <div className={`w-full h-[1px] bg-border-subtle my-3 ${className}`} />;
}
