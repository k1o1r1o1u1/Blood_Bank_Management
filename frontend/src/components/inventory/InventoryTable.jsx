import React from 'react';
import { ChevronLeft, ChevronRight, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { BLOOD_GROUP_COLORS, defaultGroupColor } from '../../utils/inventoryHelpers';
import { formatInventoryDate, getDaysUntilExpiry } from '../../pages/inventory/inventoryHelpers';

export default function InventoryTable({
  units = [],
  currentPage = 1,
  pageSize = 10,
  totalItems = 0,
  onPageChange,
}) {
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const currentUnits = units.slice(startIndex, startIndex + pageSize);

  return (
    <div className="bg-surface-white rounded-2xl border border-border-card shadow-card-clean overflow-hidden">
      {/* Table Header Strip */}
      <div className="p-4 sm:px-6 sm:py-4 border-b border-border-card flex items-center justify-between">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-text-main">
            Available Blood Units (Ready for Issue)
          </h3>
          <p className="text-xs text-text-muted">
            Individual tested units passing screening criteria (from GET /api/inventory/units/available)
          </p>
        </div>
        <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
          {totalItems} Available Units
        </span>
      </div>

      {/* Desktop Table View (>= 768px) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-workspace-bg border-b border-border-card text-text-muted font-semibold uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-3 px-6">Unit ID</th>
              <th className="py-3 px-6">Blood Group</th>
              <th className="py-3 px-6">Collection Date</th>
              <th className="py-3 px-6">Expiry Date</th>
              <th className="py-3 px-6">Days Left</th>
              <th className="py-3 px-6 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-card">
            {currentUnits.map((unit) => {
              const bloodColor = BLOOD_GROUP_COLORS[unit.blood_group] || defaultGroupColor;
              const daysLeft = getDaysUntilExpiry(unit.expiry_date);
              const isUrgent = daysLeft !== null && daysLeft <= 7;

              return (
                <tr
                  key={unit.unit_id}
                  className="hover:bg-workspace-bg/60 transition-colors"
                >
                  {/* Unit ID */}
                  <td className="py-3.5 px-6 font-mono font-bold text-text-main">
                    #UNIT-{unit.unit_id}
                  </td>

                  {/* Blood Group */}
                  <td className="py-3.5 px-6">
                    <span
                      className="inline-flex items-center justify-center font-bold text-white text-[11px] px-2 py-0.5 rounded-md min-w-[28px]"
                      style={{ backgroundColor: bloodColor }}
                    >
                      {unit.blood_group}
                    </span>
                  </td>

                  {/* Collection Date */}
                  <td className="py-3.5 px-6 text-text-main font-medium">
                    {formatInventoryDate(unit.collection_date)}
                  </td>

                  {/* Expiry Date */}
                  <td className="py-3.5 px-6 text-text-main font-medium">
                    {formatInventoryDate(unit.expiry_date)}
                  </td>

                  {/* Days Left */}
                  <td className="py-3.5 px-6">
                    {daysLeft !== null ? (
                      <span
                        className={`inline-flex items-center gap-1 font-semibold text-xs ${
                          isUrgent ? 'text-rose-600' : 'text-text-muted'
                        }`}
                      >
                        {isUrgent && <AlertCircle className="w-3.5 h-3.5" />}
                        {daysLeft} days
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-6 text-right">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      {unit.status || 'Available'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View (< 768px) */}
      <div className="md:hidden divide-y divide-border-card">
        {currentUnits.map((unit) => {
          const bloodColor = BLOOD_GROUP_COLORS[unit.blood_group] || defaultGroupColor;
          const daysLeft = getDaysUntilExpiry(unit.expiry_date);
          const isUrgent = daysLeft !== null && daysLeft <= 7;

          return (
            <div key={unit.unit_id} className="p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="font-bold text-white text-xs px-2 py-0.5 rounded min-w-[28px] text-center"
                    style={{ backgroundColor: bloodColor }}
                  >
                    {unit.blood_group}
                  </span>
                  <span className="font-mono font-bold text-text-main text-xs">
                    #UNIT-{unit.unit_id}
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  {unit.status || 'Available'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-text-muted bg-workspace-bg p-2.5 rounded-xl border border-border-card/60">
                <div>
                  <span className="block text-[10px]">Collection Date</span>
                  <span className="text-text-main font-semibold">
                    {formatInventoryDate(unit.collection_date)}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px]">Expiry Date</span>
                  <span className="text-text-main font-semibold">
                    {formatInventoryDate(unit.expiry_date)}
                  </span>
                </div>
              </div>

              {daysLeft !== null && (
                <div className="text-[11px] flex items-center justify-between">
                  <span className="text-text-muted">Storage Shelf-Life:</span>
                  <span className={`font-bold ${isUrgent ? 'text-rose-600' : 'text-text-main'}`}>
                    {daysLeft} days remaining
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-border-card flex items-center justify-between bg-workspace-bg/40 text-xs">
          <span className="text-text-muted">
            Showing <strong className="text-text-main">{startIndex + 1}</strong>–
            <strong className="text-text-main">{Math.min(startIndex + pageSize, totalItems)}</strong> of{' '}
            <strong className="text-text-main">{totalItems}</strong> units
          </span>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => onPageChange(currentPage - 1)}
              className="p-1.5 rounded-lg border border-border-card bg-surface-white text-text-main disabled:opacity-40 disabled:cursor-not-allowed hover:bg-workspace-bg transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-semibold text-text-main">
              {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange(currentPage + 1)}
              className="p-1.5 rounded-lg border border-border-card bg-surface-white text-text-main disabled:opacity-40 disabled:cursor-not-allowed hover:bg-workspace-bg transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
