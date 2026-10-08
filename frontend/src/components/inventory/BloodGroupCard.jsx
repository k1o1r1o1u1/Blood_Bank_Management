import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { BLOOD_GROUP_COLORS, defaultGroupColor } from '../../utils/inventoryHelpers';
import { getStockStatus, STOCK_STATUS_CONFIG } from '../../pages/inventory/inventoryHelpers';

export default function BloodGroupCard({ item, isSelected = false, onSelect }) {
  const group = item.blood_group || '—';
  const available = item.available_units ?? 0;
  const reserved = item.reserved_units ?? 0;
  const issued = item.issued_units ?? 0;
  const expired = item.expired_units ?? 0;
  const total = item.total_units ?? 0;

  const statusKey = getStockStatus(available);
  const statusConfig = STOCK_STATUS_CONFIG[statusKey] || STOCK_STATUS_CONFIG.Adequate;
  const bloodColor = BLOOD_GROUP_COLORS[group] || defaultGroupColor;

  return (
    <button
      type="button"
      onClick={() => onSelect(item)}
      aria-label={`Inspect ${group} inventory details. Status is ${statusConfig.label}. ${available} units available.`}
      className={`text-left w-full rounded-2xl p-5 border transition-all duration-200 bg-surface-white relative overflow-hidden group flex flex-col justify-between ${
        isSelected
          ? 'border-brand-blood ring-2 ring-brand-blood/20 shadow-md -translate-y-0.5'
          : 'border-border-card shadow-card-clean hover:border-brand-blood/40 hover:shadow-md hover:-translate-y-0.5'
      }`}
    >
      {/* Top row: Blood Group badge and Stock Status indicator */}
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {/* Blood Group Icon badge */}
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-sm"
              style={{ backgroundColor: bloodColor }}
            >
              <span className="text-sm tracking-tight">{group}</span>
            </div>
            <div>
              <span className="text-xs text-text-muted font-medium block">Blood Group</span>
              <span className="text-sm font-bold text-text-main">{group}</span>
            </div>
          </div>

          {/* Status Badge */}
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${statusConfig.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
            {statusConfig.label}
          </span>
        </div>

        {/* Available Units big number */}
        <div className="mt-4 pb-3 border-b border-border-card/60">
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-text-main tracking-tight">
              {available.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-text-muted">units</span>
          </div>
          <span className="text-[11px] text-emerald-700 font-medium block mt-0.5">
            In stock — status: Available
          </span>
        </div>
      </div>

      {/* Secondary stock metrics if available */}
      <div className="mt-3.5 space-y-2">
        <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
          <div className="bg-workspace-bg rounded-lg py-1.5 px-1 border border-border-card/40">
            <span className="text-[10px] text-text-muted block font-medium">Reserved</span>
            <span className="text-xs font-bold text-text-main block">{reserved}</span>
          </div>
          <div className="bg-workspace-bg rounded-lg py-1.5 px-1 border border-border-card/40">
            <span className="text-[10px] text-text-muted block font-medium">Issued</span>
            <span className="text-xs font-bold text-text-main block">{issued}</span>
          </div>
          <div className={`rounded-lg py-1.5 px-1 border ${expired > 0 ? 'bg-rose-50 border-rose-200/60' : 'bg-workspace-bg border-border-card/40'}`}>
            <span className={`text-[10px] block font-medium ${expired > 0 ? 'text-rose-800' : 'text-text-muted'}`}>Expired</span>
            <span className={`text-xs font-bold block ${expired > 0 ? 'text-rose-900' : 'text-text-main'}`}>{expired}</span>
          </div>
        </div>

        {/* Drilldown call to action link */}
        <div className="pt-2 flex items-center justify-between text-xs font-semibold text-brand-blood group-hover:text-brand-blood-dark">
          <span className="text-[11px]">Inspect Group Units</span>
          <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
      </div>
    </button>
  );
}
