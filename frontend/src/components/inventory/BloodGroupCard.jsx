import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { BLOOD_GROUP_COLORS, defaultGroupColor } from '../../utils/inventoryHelpers';
import { getStockStatus, STOCK_STATUS_CONFIG } from '../../pages/inventory/inventoryHelpers';

export default function BloodGroupCard({ item, isSelected = false, onSelect }) {
  const group = item.blood_group || '—';
  const available = item.available_units ?? 0;
  const reserved = item.reserved_units ?? 0;
  const expired = item.expired_units ?? 0;

  const statusKey = getStockStatus(available);
  const statusConfig = STOCK_STATUS_CONFIG[statusKey] || STOCK_STATUS_CONFIG.Available;
  const bloodColor = BLOOD_GROUP_COLORS[group] || defaultGroupColor;

  return (
    <button
      type="button"
      onClick={() => onSelect(item)}
      className={`text-left w-full rounded-2xl p-4 border transition-all duration-150 bg-surface-white relative group cursor-pointer ${
        isSelected
          ? 'border-brand-blood ring-2 ring-brand-blood/20 shadow-sm bg-rose-50/20'
          : 'border-border-card shadow-xs hover:border-brand-blood/40 hover:shadow-sm'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <span
            className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white text-xs shadow-2xs"
            style={{ backgroundColor: bloodColor }}
          >
            {group}
          </span>
          <div>
            <span className="text-xs font-bold text-text-main">{group} Reserve</span>
            <span className="text-[10px] text-text-muted block">Blood Group</span>
          </div>
        </div>
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusConfig.badge}`}>
          {statusConfig.label}
        </span>
      </div>

      <div className="flex items-baseline justify-between mb-2">
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-extrabold text-text-main tracking-tight">
            {available}
          </span>
          <span className="text-[11px] font-medium text-text-muted">units</span>
        </div>
        <span className="text-[10px] text-text-muted font-medium">
          {reserved > 0 ? `${reserved} reserved` : expired > 0 ? `${expired} expired` : '100% active'}
        </span>
      </div>

      {/* Mini Progress Bar (relative to baseline 8 units) */}
      <div className="w-full bg-workspace-bg rounded-full h-1.5 overflow-hidden border border-border-card/40">
        <div
          className={`h-full rounded-full transition-all duration-300 ${statusConfig.barColor}`}
          style={{ width: `${Math.min(100, Math.max(10, (available / 8) * 100))}%` }}
        />
      </div>
    </button>
  );
}
