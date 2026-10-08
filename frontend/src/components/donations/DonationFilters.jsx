import React from 'react';
import { Search } from 'lucide-react';
import { BLOOD_GROUPS } from '../../utils/donorHelpers';

const SCREENING_STATUSES = ['Pending', 'Approved', 'Rejected'];

export default function DonationFilters({
  searchTerm,
  onSearchChange,
  bloodGroupFilter,
  onBloodGroupChange,
  statusFilter,
  onStatusChange,
  onResetFilters,
  totalCount,
  filteredCount,
}) {
  const hasActiveFilters =
    Boolean(searchTerm.trim()) ||
    bloodGroupFilter !== 'ALL' ||
    statusFilter !== 'ALL';

  return (
    <div className="bg-surface-white rounded-[22px] p-5 border border-border-card shadow-card-clean flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by donor name, donation ID (#DON-1042)..."
          className="w-full pl-10 pr-12 py-2.5 rounded-xl bg-workspace-bg border border-border-card text-xs sm:text-sm text-text-main placeholder-text-muted/70 focus:outline-none focus:border-brand-blood focus:ring-1 focus:ring-brand-blood transition-all"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-text-muted hover:text-text-main"
          >
            Clear
          </button>
        )}
      </div>

      {/* Filter Dropdowns */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Blood Group Select */}
        <div className="relative">
          <select
            value={bloodGroupFilter}
            onChange={(e) => onBloodGroupChange(e.target.value)}
            className="appearance-none bg-workspace-bg border border-border-card text-text-main text-xs font-semibold rounded-xl px-3.5 py-2.5 pr-8 focus:outline-none focus:border-brand-blood transition-colors cursor-pointer"
          >
            <option value="ALL">All Blood Groups</option>
            {BLOOD_GROUPS.map((bg) => (
              <option key={bg} value={bg}>
                Group: {bg}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted text-[10px]">
            ▼
          </div>
        </div>

        {/* Screening Status Select */}
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            className="appearance-none bg-workspace-bg border border-border-card text-text-main text-xs font-semibold rounded-xl px-3.5 py-2.5 pr-8 focus:outline-none focus:border-brand-blood transition-colors cursor-pointer"
          >
            <option value="ALL">All Screening Statuses</option>
            {SCREENING_STATUSES.map((st) => (
              <option key={st} value={st}>
                Status: {st}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted text-[10px]">
            ▼
          </div>
        </div>

        {/* Reset button */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="px-3 py-2 text-xs font-semibold text-brand-blood hover:bg-brand-blood-light rounded-xl transition-colors"
          >
            Reset Filters
          </button>
        )}
      </div>
    </div>
  );
}
