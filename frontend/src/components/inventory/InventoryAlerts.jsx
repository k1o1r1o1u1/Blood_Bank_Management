import React from 'react';
import { AlertCircle, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';
import { getStockStatus } from '../../pages/inventory/inventoryHelpers';

export default function InventoryAlerts({ inventory = [], onSelectGroup }) {
  // Categorize based strictly on neutral UI presentation thresholds
  const depletedGroups = inventory.filter(
    (item) => getStockStatus(item.available_units) === 'Depleted'
  );
  const limitedGroups = inventory.filter(
    (item) => getStockStatus(item.available_units) === 'Limited'
  );
  const expiredGroups = inventory.filter((item) => (item.expired_units || 0) > 0);

  // If no depleted, limited, or expired items
  if (depletedGroups.length === 0 && limitedGroups.length === 0 && expiredGroups.length === 0) {
    return (
      <div className="bg-surface-white rounded-2xl border border-emerald-200/80 p-5 flex items-center justify-between shadow-card-clean">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 flex-shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-text-main">
              All Blood Groups Have Active Stock
            </h3>
            <p className="text-xs text-text-muted mt-0.5">
              Available units recorded across all tracked groups with zero expired units in active view.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-text-main flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-brand-blood" />
        <span>Inventory Attention Notice</span>
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Depleted Groups (0 available) */}
        {depletedGroups.map((item) => (
          <div
            key={`depleted-${item.blood_group}`}
            className="bg-rose-50/70 border border-rose-200/90 rounded-2xl p-4 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-900 uppercase tracking-wide flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  No Units Available
                </span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-200 text-rose-900">
                  0 units
                </span>
              </div>
              <h4 className="text-base font-extrabold text-rose-950 mt-2">
                Blood Group {item.blood_group}
              </h4>
              <p className="text-xs text-rose-800 mt-1 leading-relaxed">
                Currently 0 available units recorded in storage for this blood group.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onSelectGroup(item)}
              className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-rose-900 hover:text-rose-950 underline underline-offset-2"
            >
              <span>Inspect {item.blood_group} status</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}

        {/* Limited Stock Notice */}
        {limitedGroups.map((item) => (
          <div
            key={`limited-${item.blood_group}`}
            className="bg-amber-50/70 border border-amber-200/90 rounded-2xl p-4 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900 uppercase tracking-wide flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Limited Stock
                </span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-200 text-amber-900">
                  {item.available_units} units
                </span>
              </div>
              <h4 className="text-base font-extrabold text-amber-950 mt-2">
                Blood Group {item.blood_group}
              </h4>
              <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                Unit count is below UI presentation benchmark (&lt;15 units).
              </p>
            </div>
            <button
              type="button"
              onClick={() => onSelectGroup(item)}
              className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-amber-900 hover:text-amber-950 underline underline-offset-2"
            >
              <span>Inspect {item.blood_group} units</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}

        {/* Expired Stock Disposal Alert */}
        {expiredGroups.length > 0 && (
          <div className="bg-[#FFF6F0] border border-orange-200/80 rounded-2xl p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-orange-900 uppercase tracking-wide flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-orange-600" />
                  Expired Stock
                </span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-orange-200 text-orange-900">
                  {expiredGroups.reduce((acc, g) => acc + (g.expired_units || 0), 0)} units
                </span>
              </div>
              <h4 className="text-base font-extrabold text-orange-950 mt-2">
                Expired Stock Recorded
              </h4>
              <p className="text-xs text-orange-800 mt-1 leading-relaxed">
                Units past standard 42-day expiration in {expiredGroups.map(g => g.blood_group).join(', ')}.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
