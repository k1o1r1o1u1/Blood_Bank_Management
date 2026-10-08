import React from 'react';
import { Droplet, Users, Clock, AlertCircle, RefreshCw, ServerCrash } from 'lucide-react';

import { useDashboardData } from '../../hooks/useDashboardData';
import {
  getCriticalLowGroups,
  aggregateInventory,
  calcHealthScore,
  healthLabel,
  buildDemandProfile,
} from '../../utils/inventoryHelpers';

// Dashboard Components
import DashboardHero    from '../../components/dashboard/DashboardHero';
import MetricCard       from '../../components/dashboard/MetricCard';
import InventoryOverview from '../../components/dashboard/InventoryOverview';
import DonationActivity from '../../components/dashboard/DonationActivity';
import ActivityPanel      from '../../components/dashboard/ActivityPanel';
import CriticalRequests   from '../../components/dashboard/CriticalRequests';
import InventoryHealth  from '../../components/dashboard/InventoryHealth';
import HospitalDemand   from '../../components/dashboard/HospitalDemand';
import ExpiringUnits    from '../../components/dashboard/ExpiringUnits';
import QuickActions     from '../../components/dashboard/QuickActions';

// ─── Skeleton Loader ──────────────────────────────────────────────────────────
function SkeletonCard({ className = '' }) {
  return (
    <div className={`bg-surface-white rounded-[22px] border border-border-card shadow-card-clean animate-pulse ${className}`}>
      <div className="p-6 space-y-4">
        <div className="h-4 w-1/3 rounded-md bg-[#F0EAE6]" />
        <div className="h-10 w-1/2 rounded-md bg-[#F0EAE6]" />
        <div className="h-3 w-2/3 rounded-md bg-[#F7F3F1]" />
      </div>
    </div>
  );
}

function SkeletonTallCard({ className = '' }) {
  return (
    <div className={`bg-surface-white rounded-[22px] border border-border-card shadow-card-clean animate-pulse ${className}`}>
      <div className="p-6 space-y-5">
        <div className="h-5 w-1/2 rounded-md bg-[#F0EAE6]" />
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-1.5">
            <div className="flex justify-between">
              <div className="h-3 w-1/4 rounded-md bg-[#F0EAE6]" />
              <div className="h-3 w-1/5 rounded-md bg-[#F7F3F1]" />
            </div>
            <div className="h-2 w-full rounded-full bg-[#F0EAE6]" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Error State ──────────────────────────────────────────────────────────────
function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
      <div className="w-16 h-16 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center">
        <ServerCrash className="w-8 h-8 text-brand-blood" />
      </div>
      <div className="space-y-2 max-w-md">
        <h2 className="text-xl font-bold text-text-main">Dashboard Unavailable</h2>
        <p className="text-sm text-text-muted leading-relaxed">{message}</p>
        <p className="text-xs text-text-muted opacity-70">
          Make sure the backend is running at <code className="font-mono text-brand-blood">http://localhost:5000</code>
        </p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-blood text-white text-sm font-semibold hover:bg-brand-blood-dark transition-colors shadow-active-nav"
      >
        <RefreshCw className="w-4 h-4" />
        Retry Connection
      </button>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const { stats, inventory, criticalRequests, allPendingRequests, loading, error, refresh } =
    useDashboardData();

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-6 pb-8">
        <SkeletonCard className="h-28" />
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <SkeletonTallCard className="lg:col-span-8 h-72" />
          <div className="lg:col-span-4 space-y-6">
            <SkeletonTallCard className="h-48" />
            <SkeletonCard className="h-40" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonTallCard className="h-52" />
          <SkeletonTallCard className="h-52" />
        </div>
      </div>
    );
  }

  // ── Error state ───────────────────────────────────────────────────────────
  if (error) {
    return <ErrorState message={error} onRetry={refresh} />;
  }

  // ── Derived values from real data ─────────────────────────────────────────
  const criticalLowGroups = getCriticalLowGroups(inventory, 10);
  const totals = aggregateInventory(inventory);
  const healthScore = calcHealthScore(totals);
  const demandProfile = buildDemandProfile(allPendingRequests);

  return (
    <div className="space-y-6 pb-8">
      {/* 1. Hero Banner */}
      <DashboardHero stats={stats} />

      {/* 2. KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {/* Available Units */}
        <MetricCard
          title="Available Blood Units"
          value={(stats?.available_units ?? 0).toLocaleString()}
          unit="Units"
          change={`of ${(stats?.total_units ?? 0).toLocaleString()} total`}
          period="in storage"
          trend="up"
          icon={Droplet}
        />

        {/* Total Donors */}
        <MetricCard
          title="Registered Donors"
          value={(stats?.total_donors ?? 0).toLocaleString()}
          unit="Donors"
          change={`${stats?.total_hospitals ?? 0} affiliated hospitals`}
          period="on record"
          trend="up"
          icon={Users}
        />

        {/* Pending Requests */}
        <MetricCard
          title="Pending Blood Requests"
          value={(stats?.pending_requests ?? 0).toLocaleString()}
          unit="Requests"
          change={criticalRequests.length > 0 ? `${criticalRequests.length} critical` : 'None critical'}
          period="requiring review"
          trend={criticalRequests.length > 0 ? 'neutral' : 'up'}
          icon={Clock}
        />

        {/* Critical Low Alerts */}
        <MetricCard
          title="Critical Low Alerts"
          value={criticalLowGroups.length}
          urgentAlertList={
            criticalLowGroups.length > 0
              ? criticalLowGroups
              : [{ group: '—', units: 'All groups OK' }]
          }
          icon={AlertCircle}
        />
      </div>

      {/* 3. Core Working Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Inventory Breakdown + Donation Activity */}
        <div className="lg:col-span-8 space-y-6">
          <InventoryOverview inventory={inventory} />
          <DonationActivity recentDonations={stats?.recent_donations ?? []} />
        </div>

        {/* Right: Critical Requests + Activity Feed + Health */}
        <div className="lg:col-span-4 space-y-6">
          <CriticalRequests requests={criticalRequests} />
          <ActivityPanel
            recentDonations={stats?.recent_donations ?? []}
            recentIssues={stats?.recent_issues ?? []}
          />
          <InventoryHealth
            inventory={inventory}
            totals={totals}
            healthScore={healthScore}
            healthStatus={healthLabel(healthScore)}
          />
        </div>
      </div>

      {/* 4. Demand & Shelf-Life Monitoring */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <HospitalDemand
          demandProfile={demandProfile}
          criticalRequests={criticalRequests}
        />
        <ExpiringUnits inventory={inventory} />
      </div>

      {/* 5. Quick Actions */}
      <QuickActions />
    </div>
  );
}
