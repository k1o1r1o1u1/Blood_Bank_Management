import React from 'react';
import { Search, Filter, X } from 'lucide-react';

export default function InventoryFilters({
  searchTerm,
  onSearchChange,
  bloodGroupFilter,
  onBloodGroupChange,
  expirySort,
  onExpirySortChange,
  bloodGroups = [],
  totalUnitsCount = 0,
  filteredCount = 0,
  onClearFilters,
}) {
  const isFiltered = Boolean(searchTerm.trim()) || bloodGroupFilter !== 'ALL' || expirySort !== 'ASC';

  return (
    <div className="bg-surface-white rounded-2xl border border-border-card p-4 shadow-card-clean space-y-3">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Left: Unit ID Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by unit ID (e.g. 501)..."
            className="w-full pl-10 pr-4 py-2 bg-workspace-bg border border-border-card rounded-xl text-xs sm:text-sm text-text-main placeholder-text-muted/70 focus:outline-none focus:ring-2 focus:ring-brand-blood/20 focus:border-brand-blood transition-colors"
          />
        </div>

        {/* Right: Dropdowns and Clear button */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Blood Group dropdown */}
          <div className="flex items-center gap-1.5 bg-workspace-bg border border-border-card rounded-xl px-3 py-1.5">
            <Filter className="w-3.5 h-3.5 text-text-muted" />
            <select
              aria-label="Filter by Blood Group"
              value={bloodGroupFilter}
              onChange={(e) => onBloodGroupChange(e.target.value)}
              className="bg-transparent text-xs font-semibold text-text-main focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Blood Groups</option>
              {bloodGroups.map((bg) => (
                <option key={bg.blood_group_id || bg.blood_group} value={bg.blood_group}>
                  {bg.blood_group}
                </option>
              ))}
            </select>
          </div>

          {/* Expiry sort */}
          <div className="bg-workspace-bg border border-border-card rounded-xl px-3 py-1.5">
            <select
              aria-label="Sort by Expiration Date"
              value={expirySort}
              onChange={(e) => onExpirySortChange(e.target.value)}
              className="bg-transparent text-xs font-semibold text-text-main focus:outline-none cursor-pointer"
            >
              <option value="ASC">Expiry: Soonest First</option>
              <option value="DESC">Expiry: Furthest First</option>
            </select>
          </div>

          {/* Clear Filters Button */}
          {isFiltered && (
            <button
              type="button"
              onClick={onClearFilters}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-border-card text-xs font-medium text-text-muted hover:text-text-main hover:bg-workspace-bg transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Counter bar */}
      <div className="flex items-center justify-between text-xs text-text-muted pt-2 border-t border-border-card/60">
        <span>
          Showing <strong className="text-text-main font-bold">{filteredCount}</strong> of {totalUnitsCount} available units
        </span>
        {isFiltered && (
          <span className="text-[11px] text-brand-blood font-medium">
            Active filters applied
          </span>
        )}
      </div>
    </div>
  );
}
