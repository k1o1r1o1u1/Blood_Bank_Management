import React from 'react';
import { Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { BLOOD_GROUP_COLORS, defaultGroupColor } from '../../utils/inventoryHelpers';

export default function ExpiringUnits({ inventory = [] }) {
  // Show blood groups with expired units > 0 (these need disposal)
  const expiredGroups = inventory
    .filter((item) => (item.expired_units ?? 0) > 0)
    .sort((a, b) => b.expired_units - a.expired_units);

  const totalExpired = expiredGroups.reduce((s, i) => s + i.expired_units, 0);

  return (
    <div className="bg-surface-white rounded-[22px] p-6 border border-border-card shadow-card-clean flex flex-col">
      <div className="flex items-center justify-between pb-3 border-b border-border-card">
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border ${
            totalExpired > 0
              ? 'bg-amber-50 text-amber-600 border-amber-200/50'
              : 'bg-emerald-50 text-emerald-600 border-emerald-200/50'
          }`}>
            {totalExpired > 0
              ? <AlertTriangle className="w-4 h-4" />
              : <CheckCircle2 className="w-4 h-4" />
            }
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text-main">
              Expired Unit Disposal
            </h3>
            <p className="text-[11px] text-text-muted">
              Units past the 42-day preservation limit
            </p>
          </div>
        </div>

        {totalExpired > 0 && (
          <span className="px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold">
            {totalExpired} total
          </span>
        )}
      </div>

      <div className="space-y-2.5 mt-4 flex-1">
        {expiredGroups.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 gap-2 text-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            <p className="text-sm font-semibold text-emerald-700">No expired units</p>
            <p className="text-[11px] text-text-muted">All stored blood units are within shelf life</p>
          </div>
        ) : (
          expiredGroups.map((item, idx) => {
            const color = BLOOD_GROUP_COLORS[item.blood_group] ?? defaultGroupColor;
            return (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50/50 border border-amber-200/60 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-7 h-7 rounded-lg text-white font-bold flex items-center justify-center text-xs shrink-0"
                    style={{ backgroundColor: color }}
                  >
                    {item.blood_group}
                  </span>
                  <div>
                    <span className="font-semibold text-text-main">
                      {item.expired_units} unit{item.expired_units !== 1 ? 's' : ''}
                    </span>
                    <span className="text-[10px] text-text-muted block">Requires disposal</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-amber-800 font-medium text-[11px]">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>Expired</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
