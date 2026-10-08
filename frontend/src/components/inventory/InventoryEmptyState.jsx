import React from 'react';
import { Package, Search, FilterX } from 'lucide-react';

export default function InventoryEmptyState({ isFiltered = false, onClearFilters }) {
  if (isFiltered) {
    return (
      <div className="bg-surface-white rounded-2xl border border-border-card p-12 text-center shadow-card-clean space-y-4">
        <div className="w-14 h-14 rounded-full bg-workspace-bg border border-border-card flex items-center justify-center mx-auto text-text-muted">
          <Search className="w-6 h-6" />
        </div>
        <div className="space-y-1 max-w-sm mx-auto">
          <h3 className="text-base font-bold text-text-main">
            No Matching Blood Units Found
          </h3>
          <p className="text-xs text-text-muted">
            No available blood units match your current unit ID search or blood group filter.
          </p>
        </div>
        <div>
          <button
            type="button"
            onClick={onClearFilters}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-blood text-white text-xs font-semibold hover:bg-brand-blood-dark transition-colors shadow-active-nav"
          >
            <FilterX className="w-4 h-4" />
            <span>Reset Search &amp; Filters</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface-white rounded-2xl border border-border-card p-12 text-center shadow-card-clean space-y-4">
      <div className="w-16 h-16 rounded-full bg-workspace-bg border border-border-card flex items-center justify-center mx-auto text-text-muted">
        <Package className="w-7 h-7" />
      </div>
      <div className="space-y-1.5 max-w-md mx-auto">
        <h3 className="text-lg font-bold text-text-main">
          No Inventory Recorded
        </h3>
        <p className="text-xs text-text-muted leading-relaxed">
          There are currently no active blood units in storage. Blood units are created automatically whenever donation screening is Approved.
        </p>
      </div>
    </div>
  );
}
