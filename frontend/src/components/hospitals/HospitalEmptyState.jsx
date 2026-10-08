import React from 'react';
import { Building2, PlusCircle, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function HospitalEmptyState({ isFiltered = false, onClearFilters }) {
  const navigate = useNavigate();

  if (isFiltered) {
    return (
      <div className="bg-surface-white rounded-2xl border border-border-card p-12 text-center shadow-card-clean space-y-4">
        <div className="w-14 h-14 rounded-full bg-workspace-bg border border-border-card flex items-center justify-center mx-auto text-text-muted">
          <Search className="w-6 h-6" />
        </div>
        <div className="space-y-1 max-w-sm mx-auto">
          <h3 className="text-base font-bold text-text-main">No hospitals match your search</h3>
          <p className="text-xs text-text-muted">
            Try changing your search term or clearing the filter.
          </p>
        </div>
        <button
          type="button"
          onClick={onClearFilters}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-blood text-white text-xs font-semibold hover:bg-brand-blood-dark transition-colors shadow-active-nav"
        >
          Clear Search
        </button>
      </div>
    );
  }

  return (
    <div className="bg-surface-white rounded-2xl border border-border-card p-14 text-center shadow-card-clean space-y-5">
      <div className="w-16 h-16 rounded-full bg-workspace-bg border border-border-card flex items-center justify-center mx-auto text-text-muted">
        <Building2 className="w-7 h-7" />
      </div>
      <div className="space-y-2 max-w-md mx-auto">
        <h3 className="text-lg font-bold text-text-main">No Hospitals Registered</h3>
        <p className="text-xs text-text-muted leading-relaxed">
          There are currently no hospitals in the network. Add a hospital to begin recording blood requests and tracking partner activity.
        </p>
      </div>
      <button
        type="button"
        onClick={() => navigate('/hospitals/add')}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-blood text-white text-sm font-semibold hover:bg-brand-blood-dark transition-colors shadow-active-nav"
      >
        <PlusCircle className="w-4 h-4" />
        Add First Hospital
      </button>
    </div>
  );
}
