import React from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';
import { getStockStatus } from '../../pages/inventory/inventoryHelpers';

export default function InventoryAlerts({ inventory = [], onSelectGroup }) {
  const depletedGroups = inventory.filter(
    (item) => getStockStatus(item.available_units) === 'Depleted'
  );
  const limitedGroups = inventory.filter(
    (item) => getStockStatus(item.available_units) === 'Limited'
  );
  const expiredGroups = inventory.filter((item) => (item.expired_units || 0) > 0);

  // If no depleted, limited, or expired items, don't waste screen real estate
  if (depletedGroups.length === 0 && limitedGroups.length === 0 && expiredGroups.length === 0) {
    return null;
  }

  const expiredTotal = expiredGroups.reduce((acc, g) => acc + (g.expired_units || 0), 0);

  return (
    <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-4 h-4" />
        </div>
        <div>
          <strong className="text-amber-900 font-bold block">Reserve &amp; Cold-Chain Status</strong>
          <p className="text-amber-800 text-[11px] mt-0.5">
            {limitedGroups.length > 0 && (
              <span>
                Low stock for <strong>{limitedGroups.map((g) => g.blood_group).join(', ')}</strong> ({limitedGroups.map((g) => `${g.blood_group}: ${g.available_units} units`).join(', ')}).
              </span>
            )}
            {expiredTotal > 0 && (
              <span className="ml-1">
                {expiredTotal} unit(s) segregated past 42-day preservation limit.
              </span>
            )}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-[11px] font-semibold text-amber-900 bg-amber-100/70 border border-amber-200 px-2.5 py-1 rounded-lg">
          Cold-Chain Verified
        </span>
      </div>
    </div>
  );
}
