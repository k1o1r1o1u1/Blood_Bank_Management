import React from 'react';
import { Package, ShieldAlert, CheckCircle, Clock } from 'lucide-react';
import { getStockStatus } from '../../pages/inventory/inventoryHelpers';

export default function InventoryHero({ totals = {}, inventory = [], onSelectGroup }) {
  const available = totals.available || 0;
  const reserved = totals.reserved || 0;
  const issued = totals.issued || 0;
  const expired = totals.expired || 0;

  // Identify groups with limited volume or no units
  const limitedOrDepletedGroups = inventory.filter((item) => {
    const status = getStockStatus(item.available_units);
    return status === 'Depleted' || status === 'Limited';
  });

  return (
    <div className="bg-surface-white rounded-[22px] border border-border-card shadow-card-clean p-6 lg:p-7 relative overflow-hidden">
      {/* Decorative subtle background tint on top-right */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-blood/[0.02] rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
        {/* Left: Total Available Summary */}
        <div className="space-y-3 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-workspace-bg border border-border-card text-xs font-semibold text-text-muted">
            <Package className="w-3.5 h-3.5 text-brand-blood" />
            <span>Blood Storage Overview</span>
          </div>

          <div>
            <div className="flex items-baseline gap-3">
              <span className="text-4xl lg:text-5xl font-extrabold text-text-main tracking-tight">
                {available.toLocaleString()}
              </span>
              <span className="text-base lg:text-lg font-medium text-text-muted">
                Available Units
              </span>
            </div>
            <p className="text-xs lg:text-sm text-text-muted mt-1 leading-relaxed">
              Available blood units across all 8 tracked blood groups.
            </p>
          </div>

          {/* Attention summary pill */}
          {limitedOrDepletedGroups.length > 0 ? (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs font-medium">
              <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>
                {limitedOrDepletedGroups.length} blood group{limitedOrDepletedGroups.length !== 1 ? 's' : ''} currently have limited stock ({limitedOrDepletedGroups.map(g => g.blood_group).join(', ')}).
              </span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-900 text-xs font-medium">
              <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Active units currently recorded across all blood groups.</span>
            </div>
          )}
        </div>

        {/* Right: Operational Status Metrics (Direct from API) */}
        <div className="grid grid-cols-3 gap-3 w-full lg:w-auto min-w-[340px]">
          {/* Reserved */}
          <div className="bg-workspace-bg border border-border-card/80 rounded-xl p-3.5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[11px] text-text-muted font-medium mb-1">
              <span>Reserved</span>
              <Clock className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-text-main">
              {reserved.toLocaleString()}
            </div>
            <span className="text-[10px] text-text-muted mt-1">Status: Reserved</span>
          </div>

          {/* Issued */}
          <div className="bg-workspace-bg border border-border-card/80 rounded-xl p-3.5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[11px] text-text-muted font-medium mb-1">
              <span>Issued</span>
              <CheckCircle className="w-3.5 h-3.5 text-text-muted" />
            </div>
            <div className="text-2xl font-bold text-text-main">
              {issued.toLocaleString()}
            </div>
            <span className="text-[10px] text-text-muted mt-1">Status: Issued</span>
          </div>

          {/* Expired */}
          <div className={`rounded-xl p-3.5 border flex flex-col justify-between ${
            expired > 0 ? 'bg-rose-50/60 border-rose-200/70' : 'bg-workspace-bg border-border-card/80'
          }`}>
            <div className="flex items-center justify-between text-[11px] font-medium mb-1 text-text-muted">
              <span className={expired > 0 ? 'text-rose-900 font-semibold' : ''}>Expired</span>
              <ShieldAlert className={`w-3.5 h-3.5 ${expired > 0 ? 'text-rose-600' : 'text-text-muted'}`} />
            </div>
            <div className={`text-2xl font-bold ${expired > 0 ? 'text-rose-900' : 'text-text-main'}`}>
              {expired.toLocaleString()}
            </div>
            <span className={`text-[10px] mt-1 ${expired > 0 ? 'text-rose-700 font-medium' : 'text-text-muted'}`}>
              {expired > 0 ? 'Past 42 days' : 'Zero expired'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
