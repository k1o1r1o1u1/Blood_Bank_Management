import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, FileText, Activity } from 'lucide-react';
import Button from '../ui/Button';

export default function DashboardHero({ stats }) {
  const navigate = useNavigate();

  // Try to read the logged-in user name from localStorage (set on login)
  const stored = localStorage.getItem('user');
  let userName = 'Admin';
  try {
    if (stored) userName = JSON.parse(stored)?.name?.split(' ')[0] || 'Admin';
  } catch (_) {/* ignore */}

  return (
    <div className="bg-surface-white rounded-[22px] p-6 lg:p-7 border border-border-card shadow-card-clean flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
      {/* Subtle background ambient graphic */}
      <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-brand-blood-light/40 to-transparent pointer-events-none" />

      <div className="space-y-1.5 max-w-xl z-10">
        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-brand-blood-light border border-brand-blood/20 text-brand-blood text-[11px] font-semibold tracking-wide">
          <Activity className="w-3.5 h-3.5" />
          <span>Live Operations Active</span>
        </div>
        <h1 className="text-2xl lg:text-3xl font-bold text-text-main tracking-tight">
          Welcome back, {userName}
        </h1>
        {stats ? (
          <p className="text-xs sm:text-sm text-text-muted">
            <span className="font-semibold text-brand-blood">{(stats.available_units ?? 0).toLocaleString()} units</span> available across{' '}
            <span className="font-semibold text-text-main">{stats.total_hospitals ?? 0} hospitals</span>.{' '}
            {stats.pending_requests > 0
              ? `${stats.pending_requests} request${stats.pending_requests !== 1 ? 's' : ''} awaiting review.`
              : 'All requests resolved.'}
          </p>
        ) : (
          <p className="text-xs sm:text-sm text-text-muted">
            Monitor blood bank operations, crossmatch reserves, and hospital demand at a glance.
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3 z-10 w-full sm:w-auto">
        <Button
          variant="secondary"
          size="md"
          icon={FileText}
          onClick={() => navigate('/requests')}
          className="w-full sm:w-auto hover:border-brand-blood/40"
        >
          Create Request
        </Button>
        <Button
          variant="primary"
          size="md"
          icon={PlusCircle}
          onClick={() => navigate('/donations/add')}
          className="w-full sm:w-auto bg-brand-blood hover:bg-brand-blood-dark shadow-active-nav"
        >
          Record Donation
        </Button>
      </div>
    </div>
  );
}
