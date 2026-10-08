import React, { useEffect, useState } from 'react';
import { X, Clock, CheckCircle2, ShieldAlert, ArrowRight, Loader2, ServerCrash } from 'lucide-react';
import { inventoryService } from '../../services/api';
import { BLOOD_GROUP_COLORS, defaultGroupColor } from '../../utils/inventoryHelpers';
import { getStockStatus, STOCK_STATUS_CONFIG, formatInventoryDate, getDaysUntilExpiry } from '../../pages/inventory/inventoryHelpers';

export default function InventoryDetailModal({ bloodGroupItem, onClose }) {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const groupName = bloodGroupItem?.blood_group || '';
  const bloodColor = BLOOD_GROUP_COLORS[groupName] || defaultGroupColor;
  const statusKey = getStockStatus(bloodGroupItem?.available_units);
  const statusConfig = STOCK_STATUS_CONFIG[statusKey] || STOCK_STATUS_CONFIG.Adequate;

  useEffect(() => {
    if (!bloodGroupItem) return;

    let isMounted = true;
    const fetchGroupUnits = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch specific group units using real backend query filter: ?blood_group_id=...
        const res = await inventoryService.getAvailableUnits(bloodGroupItem.blood_group_id);
        if (isMounted) {
          setUnits(res.data || []);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Failed to fetch group units:', err);
          setError(err?.message || 'Unable to load available unit list for this blood group.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchGroupUnits();

    return () => {
      isMounted = false;
    };
  }, [bloodGroupItem]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!bloodGroupItem) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-blood-group-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="bg-surface-white rounded-3xl border border-border-card shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-border-card flex items-center justify-between bg-workspace-bg/50">
          <div className="flex items-center gap-3.5">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center font-extrabold text-white text-lg shadow-sm"
              style={{ backgroundColor: bloodColor }}
            >
              {groupName}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="modal-blood-group-title" className="text-lg font-bold text-text-main">
                  Blood Group {groupName}
                </h3>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${statusConfig.badge}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
                  {statusConfig.label}
                </span>
              </div>
              <p className="text-xs text-text-muted mt-0.5">
                Current storage breakdown &amp; available unit inspection
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="w-9 h-9 rounded-full bg-surface-white border border-border-card flex items-center justify-center text-text-muted hover:text-text-main hover:bg-workspace-bg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {/* Storage Breakdown Cards */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-3">
              Storage Breakdown (All Units)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-workspace-bg p-3.5 rounded-2xl border border-border-card/70">
                <span className="text-[11px] text-text-muted block">Available</span>
                <span className="text-2xl font-extrabold text-text-main block mt-0.5">
                  {(bloodGroupItem.available_units ?? 0).toLocaleString()}
                </span>
                <span className="text-[10px] text-emerald-700 font-medium">Ready for issue</span>
              </div>

              <div className="bg-workspace-bg p-3.5 rounded-2xl border border-border-card/70">
                <span className="text-[11px] text-text-muted block">Reserved</span>
                <span className="text-2xl font-extrabold text-text-main block mt-0.5">
                  {(bloodGroupItem.reserved_units ?? 0).toLocaleString()}
                </span>
                <span className="text-[10px] text-blue-700 font-medium">Status: Reserved</span>
              </div>

              <div className="bg-workspace-bg p-3.5 rounded-2xl border border-border-card/70">
                <span className="text-[11px] text-text-muted block">Issued</span>
                <span className="text-2xl font-extrabold text-text-main block mt-0.5">
                  {(bloodGroupItem.issued_units ?? 0).toLocaleString()}
                </span>
                <span className="text-[10px] text-text-muted font-medium">Dispatched total</span>
              </div>

              <div className={`p-3.5 rounded-2xl border ${
                (bloodGroupItem.expired_units ?? 0) > 0 ? 'bg-rose-50 border-rose-200' : 'bg-workspace-bg border-border-card/70'
              }`}>
                <span className={`text-[11px] block ${
                  (bloodGroupItem.expired_units ?? 0) > 0 ? 'text-rose-900 font-medium' : 'text-text-muted'
                }`}>
                  Expired
                </span>
                <span className={`text-2xl font-extrabold block mt-0.5 ${
                  (bloodGroupItem.expired_units ?? 0) > 0 ? 'text-rose-900' : 'text-text-main'
                }`}>
                  {(bloodGroupItem.expired_units ?? 0).toLocaleString()}
                </span>
                <span className={`text-[10px] font-medium ${
                  (bloodGroupItem.expired_units ?? 0) > 0 ? 'text-rose-700' : 'text-emerald-700'
                }`}>
                  {(bloodGroupItem.expired_units ?? 0) > 0 ? 'Pending disposal' : 'Zero expired'}
                </span>
              </div>
            </div>
          </div>

          {/* Unit-level List for this group */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">
                Available Unit Batches ({units.length})
              </h4>
              <span className="text-[11px] text-text-muted">Sorted by expiry date</span>
            </div>

            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-2 text-text-muted">
                <Loader2 className="w-6 h-6 animate-spin text-brand-blood" />
                <span className="text-xs font-medium">Loading unit records...</span>
              </div>
            ) : error ? (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-3">
                <ServerCrash className="w-5 h-5 flex-shrink-0 text-brand-blood" />
                <span>{error}</span>
              </div>
            ) : units.length === 0 ? (
              <div className="p-8 text-center bg-workspace-bg rounded-2xl border border-border-card text-text-muted text-xs">
                No active available units in storage for {groupName}.
              </div>
            ) : (
              <div className="divide-y divide-border-card border border-border-card rounded-2xl overflow-hidden bg-workspace-bg/40 max-h-60 overflow-y-auto text-xs">
                {units.map((u) => {
                  const daysLeft = getDaysUntilExpiry(u.expiry_date);
                  const isUrgent = daysLeft !== null && daysLeft <= 7;
                  return (
                    <div key={u.unit_id} className="p-3.5 flex items-center justify-between hover:bg-surface-white transition-colors">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-text-main">
                            #UNIT-{u.unit_id}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            Available
                          </span>
                        </div>
                        <div className="text-[11px] text-text-muted">
                          Collected: {formatInventoryDate(u.collection_date)}
                        </div>
                      </div>

                      <div className="text-right space-y-0.5">
                        <div className="font-medium text-text-main">
                          Expires: {formatInventoryDate(u.expiry_date)}
                        </div>
                        {daysLeft !== null && (
                          <div className={`text-[11px] font-semibold ${isUrgent ? 'text-rose-600' : 'text-text-muted'}`}>
                            {daysLeft} days remaining
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:px-6 bg-workspace-bg/80 border-t border-border-card flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-surface-white border border-border-card text-text-main text-xs font-semibold hover:bg-workspace-bg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
