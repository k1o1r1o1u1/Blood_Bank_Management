import React from 'react';
import { Package, ShieldAlert, Clock, Droplet } from 'lucide-react';

export default function InventoryHero({ totals = {}, inventory = [], onSelectGroup }) {
  const available = totals.available || 0;
  const reserved = totals.reserved || 0;
  const issued = totals.issued || 0;
  const expired = totals.expired || 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Available Units */}
      <div className="bg-surface-white rounded-2xl border border-border-card p-5 shadow-card-clean flex items-center justify-between">
        <div>
          <span className="text-xs text-text-muted font-medium block">Available In Stock</span>
          <div className="text-3xl font-extrabold text-text-main mt-1 tracking-tight">
            {available.toLocaleString()}
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
            Ready for issue
          </span>
        </div>
        <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
          <Droplet className="w-6 h-6" />
        </div>
      </div>

      {/* 2. Reserved Units */}
      <div className="bg-surface-white rounded-2xl border border-border-card p-5 shadow-card-clean flex items-center justify-between">
        <div>
          <span className="text-xs text-text-muted font-medium block">Reserved Units</span>
          <div className="text-3xl font-extrabold text-text-main mt-1 tracking-tight">
            {reserved.toLocaleString()}
          </div>
          <span className="text-[11px] text-blue-600 font-semibold mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />
            Allocated for orders
          </span>
        </div>
        <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
          <Clock className="w-6 h-6" />
        </div>
      </div>

      {/* 3. Issued Units */}
      <div className="bg-surface-white rounded-2xl border border-border-card p-5 shadow-card-clean flex items-center justify-between">
        <div>
          <span className="text-xs text-text-muted font-medium block">Total Issued</span>
          <div className="text-3xl font-extrabold text-text-main mt-1 tracking-tight">
            {issued.toLocaleString()}
          </div>
          <span className="text-[11px] text-text-muted font-medium mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 inline-block" />
            Dispatched to hospitals
          </span>
        </div>
        <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
          <Package className="w-6 h-6" />
        </div>
      </div>

      {/* 4. Expired Units */}
      <div className="bg-surface-white rounded-2xl border border-border-card p-5 shadow-card-clean flex items-center justify-between">
        <div>
          <span className="text-xs text-text-muted font-medium block">Quarantined (Expired)</span>
          <div className={`text-3xl font-extrabold mt-1 tracking-tight ${expired > 0 ? 'text-rose-600' : 'text-text-main'}`}>
            {expired.toLocaleString()}
          </div>
          <span className={`text-[11px] font-semibold mt-1 flex items-center gap-1 ${expired > 0 ? 'text-rose-600' : 'text-text-muted'}`}>
            <span className={`w-1.5 h-1.5 rounded-full inline-block ${expired > 0 ? 'bg-rose-500' : 'bg-slate-300'}`} />
            {expired > 0 ? 'Past 42 days' : 'Zero expired'}
          </span>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
          expired > 0 ? 'bg-rose-50 border border-rose-200 text-rose-600' : 'bg-workspace-bg border border-border-card text-text-muted'
        }`}>
          <ShieldAlert className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
