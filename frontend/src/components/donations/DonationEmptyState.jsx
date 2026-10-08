import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Droplet, SearchX, PlusCircle, RefreshCw } from 'lucide-react';
import Button from '../ui/Button';

export default function DonationEmptyState({ isFiltered, onResetFilters }) {
  const navigate = useNavigate();

  if (isFiltered) {
    return (
      <div className="p-16 text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-workspace-bg border border-border-card flex items-center justify-center mx-auto text-text-muted">
          <SearchX className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-text-main">
          No donations match your filters
        </h3>
        <p className="text-xs text-text-muted max-w-sm mx-auto">
          Try adjusting your search terms, blood group, or screening status filter to view donation records.
        </p>
        <div className="pt-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={onResetFilters}
            className="hover:border-brand-blood/40"
          >
            Clear Filters
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-16 text-center space-y-3">
      <div className="w-12 h-12 rounded-full bg-brand-blood-light flex items-center justify-center mx-auto text-brand-blood">
        <Droplet className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-text-main">
        No donations recorded yet
      </h3>
      <p className="text-xs text-text-muted max-w-sm mx-auto">
        There are currently no blood donation records in the system. Log your first collection session to start the screening workflow.
      </p>
      <div className="pt-2">
        <Button
          variant="primary"
          size="sm"
          icon={PlusCircle}
          onClick={() => navigate('/donations/add')}
          className="bg-brand-blood hover:bg-brand-blood-dark text-white shadow-active-nav"
        >
          Record First Donation
        </Button>
      </div>
    </div>
  );
}
