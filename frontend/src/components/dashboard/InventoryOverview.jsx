import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BLOOD_GROUP_COLORS, getInventoryStatus, defaultGroupColor } from '../../utils/inventoryHelpers';
import InventoryDonut from './InventoryDonut';

const STATUS_BADGE = {
  Optimal:  'bg-emerald-50 text-emerald-700 border-emerald-200',
  Adequate: 'bg-blue-50 text-blue-700 border-blue-200',
  Low:      'bg-amber-50 text-amber-700 border-amber-200',
  Critical: 'bg-rose-50 text-brand-blood border-rose-200',
};

export default function InventoryOverview({ inventory = [] }) {
  const navigate = useNavigate();

  const maxUnits = Math.max(...inventory.map((i) => i.available_units ?? 0), 1);

  return (
    <div className="bg-surface-white rounded-[22px] p-6 lg:p-7 border border-border-card shadow-card-clean flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between pb-5 border-b border-border-card">
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-text-main">
            Blood Group Inventory
          </h2>
          <p className="text-xs text-text-muted mt-0.5">
            Current available units &amp; safety thresholds across all groups
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/inventory')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-blood hover:text-brand-blood-dark transition-colors"
        >
          <span>Full Inventory</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Grid: Bars + Donut */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mt-6 items-center">
        {/* Horizontal Progress Bars */}
        <div className="xl:col-span-7 space-y-3.5">
          {inventory.length === 0 ? (
            <p className="text-sm text-text-muted text-center py-8">No inventory data available.</p>
          ) : (
            inventory.map((item) => {
              const available = item.available_units ?? 0;
              const reserved  = item.reserved_units  ?? 0;
              const status    = getInventoryStatus(available);
              const color     = BLOOD_GROUP_COLORS[item.blood_group] ?? defaultGroupColor;
              const barPct    = Math.round((available / maxUnits) * 100);

              return (
                <div key={item.blood_group} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-7 font-bold text-text-main text-sm">
                        {item.blood_group}
                      </span>
                      <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-md border ${STATUS_BADGE[status] ?? STATUS_BADGE.Low}`}>
                        {status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-text-muted text-[11px] hidden sm:inline">
                        {reserved} reserved
                      </span>
                      <span className="font-bold text-text-main">
                        {available} units
                      </span>
                    </div>
                  </div>

                  {/* Progress track */}
                  <div className="h-2 w-full bg-[#F4EFEA] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${barPct}%`, backgroundColor: color }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Donut Chart */}
        <div className="xl:col-span-5 flex flex-col items-center justify-center pt-4 xl:pt-0 border-t xl:border-t-0 xl:border-l border-border-card">
          <InventoryDonut inventory={inventory} />
        </div>
      </div>
    </div>
  );
}
