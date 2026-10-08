import React from 'react';
import { Search } from 'lucide-react';

export default function SearchInput({
  placeholder = 'Search donors, hospitals, requests...',
  value,
  onChange,
  onKeyDown,
  shortcut = '⌘ K',
  className = '',
  ...props
}) {
  return (
    <div className={`relative flex items-center w-full max-w-md ${className}`}>
      <div className="absolute left-3.5 pointer-events-none text-text-muted">
        <Search className="w-4 h-4" />
      </div>

      <input
        type="text"
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className="w-full bg-surface text-text-main placeholder-text-muted/70 text-sm rounded-xl border border-border-subtle pl-10 pr-14 py-2 transition-all duration-150 focus:outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal shadow-xs"
        {...props}
      />

      {shortcut && (
        <div className="absolute right-2.5 pointer-events-none hidden sm:flex items-center">
          <kbd className="px-1.5 py-0.5 text-[10px] font-semibold text-text-muted bg-bg-canvas border border-border-subtle rounded-md shadow-2xs">
            {shortcut}
          </kbd>
        </div>
      )}
    </div>
  );
}
