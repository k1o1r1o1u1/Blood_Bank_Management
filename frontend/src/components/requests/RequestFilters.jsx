import React from 'react';
import { Search, X, Filter } from 'lucide-react';

export default function RequestFilters({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  urgencyFilter,
  onUrgencyChange,
  hospitalFilter,
  onHospitalChange,
  hospitals = [],
  totalCount,
  filteredCount,
  onClearFilters,
}) {
  const isFiltered = Boolean(
    searchTerm.trim() ||
    statusFilter !== 'ALL' ||
    urgencyFilter !== 'ALL' ||
    hospitalFilter !== 'ALL'
  );

  return (
    <div className="bg-surface-white rounded-2xl border border-border-card shadow-card-clean p-4 space-y-3">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by request #ID, hospital, or blood group…"
            className="w-full pl-10 pr-4 py-2 bg-workspace-bg border border-border-card rounded-xl text-xs text-text-main placeholder-text-muted/70 focus:outline-none focus:ring-2 focus:ring-brand-blood/20 focus:border-brand-blood transition-colors"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            aria-label="Filter by Status"
            className="px-3 py-2 bg-workspace-bg border border-border-card rounded-xl text-xs text-text-main font-medium focus:outline-none focus:ring-2 focus:ring-brand-blood/20 focus:border-brand-blood transition-colors"
          >
            <option value="ALL">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Completed">Completed</option>
          </select>

          {/* Urgency Filter */}
          <select
            value={urgencyFilter}
            onChange={(e) => onUrgencyChange(e.target.value)}
            aria-label="Filter by Urgency"
            className="px-3 py-2 bg-workspace-bg border border-border-card rounded-xl text-xs text-text-main font-medium focus:outline-none focus:ring-2 focus:ring-brand-blood/20 focus:border-brand-blood transition-colors"
          >
            <option value="ALL">All Urgencies</option>
            <option value="Critical">Critical</option>
            <option value="Urgent">Urgent</option>
            <option value="Normal">Normal</option>
          </select>

          {/* Hospital Filter */}
          <select
            value={hospitalFilter}
            onChange={(e) => onHospitalChange(e.target.value)}
            aria-label="Filter by Hospital"
            className="px-3 py-2 bg-workspace-bg border border-border-card rounded-xl text-xs text-text-main font-medium focus:outline-none focus:ring-2 focus:ring-brand-blood/20 focus:border-brand-blood transition-colors max-w-[180px] truncate"
          >
            <option value="ALL">All Hospitals</option>
            {hospitals.map((h) => (
              <option key={h.hospital_id} value={String(h.hospital_id)}>
                {h.name}
              </option>
            ))}
          </select>

          {/* Active Results Counter & Clear */}
          <div className="flex items-center gap-2 pl-2 text-xs text-text-muted border-l border-border-card">
            <span>
              <strong className="text-text-main">{filteredCount}</strong> of {totalCount}
            </span>
            {isFiltered && (
              <button
                type="button"
                onClick={onClearFilters}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-border-card hover:bg-workspace-bg text-text-muted hover:text-text-main transition-colors font-medium text-xs"
              >
                <X className="w-3.5 h-3.5" />
                Reset
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
