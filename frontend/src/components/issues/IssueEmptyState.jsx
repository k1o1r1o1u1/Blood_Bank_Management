import React from 'react';
import { PackageCheck, SearchX, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function IssueEmptyState({ isFiltered = false, onClearFilters }) {
  if (isFiltered) {
    return (
      <div className="bg-surface-white rounded-3xl border border-border-card shadow-card-clean p-12 text-center max-w-md mx-auto my-6">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mx-auto mb-4">
          <SearchX className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold text-text-main mb-1.5">No Matching Records</h3>
        <p className="text-xs text-text-muted mb-6 leading-relaxed">
          No blood issuance logs match your current search criteria or filters.
        </p>
        <button
          type="button"
          onClick={onClearFilters}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-white border border-border-card text-xs font-semibold text-text-main hover:bg-workspace-bg transition-colors shadow-sm"
        >
          Reset All Filters
        </button>
      </div>
    );
  }

  return (
    <div className="bg-surface-white rounded-3xl border border-border-card shadow-card-clean p-12 text-center max-w-md mx-auto my-6">
      <div className="w-14 h-14 rounded-2xl bg-brand-blood/10 border border-brand-blood/20 flex items-center justify-center text-brand-blood mx-auto mb-4">
        <PackageCheck className="w-7 h-7" />
      </div>
      <h3 className="text-base font-bold text-text-main mb-1.5">No Blood Issuance Records</h3>
      <p className="text-xs text-text-muted mb-6 leading-relaxed">
        No blood units have been formally issued to partner hospitals yet. Issuance records are generated when approved blood requests are fulfilled via atomic unit allocation.
      </p>
      <Link
        to="/requests"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-blood text-white text-xs font-semibold hover:bg-brand-blood-dark transition-colors shadow-active-nav"
      >
        View Blood Requests Queue
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
