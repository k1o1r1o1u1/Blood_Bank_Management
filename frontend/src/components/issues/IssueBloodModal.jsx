import React, { useState, useEffect } from 'react';
import {
  X,
  PackageCheck,
  Building2,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Droplet,
  Info,
  ShieldCheck,
  User,
} from 'lucide-react';
import { requestService, inventoryService, issueService } from '../../services/api';
import { formatShortDate, BLOOD_GROUP_COLORS, defaultGroupColor } from '../../utils/inventoryHelpers';
import RequestUrgencyBadge from '../requests/RequestUrgencyBadge';

export default function IssueBloodModal({
  isOpen,
  onClose,
  preselectedRequestId = null,
  onIssueSuccess, // callback(resultData)
}) {
  // Step 1: Requests
  const [approvedRequests, setApprovedRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [requestsError, setRequestsError] = useState(null);

  // Selected Request
  const [selectedRequestId, setSelectedRequestId] = useState(preselectedRequestId ? String(preselectedRequestId) : '');

  // Step 2: Units for selected request
  const [availableUnits, setAvailableUnits] = useState([]);
  const [loadingUnits, setLoadingUnits] = useState(false);
  const [unitsError, setUnitsError] = useState(null);

  // Step 3: Selected unit IDs
  const [selectedUnitIds, setSelectedUnitIds] = useState([]);

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  // Fetch approved requests on open
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const fetchApproved = async () => {
      setLoadingRequests(true);
      setRequestsError(null);
      try {
        const res = await requestService.getAll({ status: 'Approved' });
        if (isMounted) {
          setApprovedRequests(res.data || []);
          if (preselectedRequestId) {
            setSelectedRequestId(String(preselectedRequestId));
          } else if (res.data && res.data.length > 0 && !selectedRequestId) {
            setSelectedRequestId(String(res.data[0].request_id));
          }
        }
      } catch (err) {
        if (isMounted) setRequestsError('Unable to load approved blood requests queue.');
      } finally {
        if (isMounted) setLoadingRequests(false);
      }
    };

    fetchApproved();
    return () => { isMounted = false; };
  }, [isOpen, preselectedRequestId]);

  // The active selected request object
  const currentRequest = approvedRequests.find(
    (r) => String(r.request_id) === String(selectedRequestId)
  );

  // Fetch available units whenever currentRequest changes
  const fetchUnits = async (bloodGroupId) => {
    if (!bloodGroupId) return;
    setLoadingUnits(true);
    setUnitsError(null);
    setSelectedUnitIds([]);
    try {
      const res = await inventoryService.getAvailableUnits(bloodGroupId);
      setAvailableUnits(res.data || []);
    } catch (err) {
      setUnitsError('Failed to retrieve available units for this blood group.');
    } finally {
      setLoadingUnits(false);
    }
  };

  useEffect(() => {
    if (currentRequest?.blood_group_id) {
      fetchUnits(currentRequest.blood_group_id);
    } else {
      setAvailableUnits([]);
      setSelectedUnitIds([]);
    }
  }, [currentRequest?.blood_group_id]);

  if (!isOpen) return null;

  // Toggle unit selection
  const handleToggleUnit = (unitId) => {
    if (!currentRequest) return;
    const reqQty = currentRequest.quantity_required;

    if (selectedUnitIds.includes(unitId)) {
      setSelectedUnitIds((prev) => prev.filter((id) => id !== unitId));
    } else {
      if (selectedUnitIds.length >= reqQty) {
        // Prevent exceeding required quantity
        return;
      }
      setSelectedUnitIds((prev) => [...prev, unitId]);
    }
  };

  // Inspect authenticated user to extract staff_id if present
  let authStaffId = null;
  let authStaffName = null;
  try {
    const rawUser = localStorage.getItem('user');
    if (rawUser) {
      const parsed = JSON.parse(rawUser);
      if (parsed && typeof parsed.staff_id === 'number') {
        authStaffId = parsed.staff_id;
        authStaffName = parsed.name || null;
      }
    }
  } catch (_) {
    authStaffId = null;
  }

  // Submit issuance
  const handleConfirmIssue = async () => {
    if (!currentRequest) return;
    if (selectedUnitIds.length !== currentRequest.quantity_required) return;

    setSubmitting(true);
    setSubmitError(null);

    const payload = {
      request_id: currentRequest.request_id,
      unit_ids: selectedUnitIds,
      issued_by: authStaffId || null,
    };

    try {
      const res = await issueService.issueUnits(payload);
      if (onIssueSuccess) {
        onIssueSuccess(res.data);
      }
      onClose();
    } catch (err) {
      const msg = typeof err === 'string' ? err : err?.message || 'Blood issuance failed. Please retry.';
      setSubmitError(msg);
      // Concurrency recovery: refresh available units in case a unit became stale
      if (currentRequest?.blood_group_id) {
        fetchUnits(currentRequest.blood_group_id);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const reqQty = currentRequest?.quantity_required || 0;
  const isExactQtySelected = selectedUnitIds.length === reqQty && reqQty > 0;
  const bgColors = currentRequest ? (BLOOD_GROUP_COLORS[currentRequest.blood_group] || defaultGroupColor) : defaultGroupColor;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="issue-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      <div className="bg-surface-white rounded-3xl border border-border-card shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in-50 zoom-in-95">
        {/* Header */}
        <div className="px-6 py-5 border-b border-border-card bg-workspace-bg/50 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-blood/10 border border-brand-blood/20 flex items-center justify-center text-brand-blood">
              <PackageCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 id="issue-modal-title" className="text-base font-bold text-text-main">
                Issue Blood Units
              </h2>
              <p className="text-xs text-text-muted">
                Fulfill an approved blood request with unexpired physical units
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full border border-border-card bg-surface-white flex items-center justify-center text-text-muted hover:text-text-main hover:bg-workspace-bg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Step 1: Select Approved Request */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="request_select" className="text-xs font-bold text-text-main uppercase tracking-wider">
                1. Select Approved Request
              </label>
              {loadingRequests && (
                <span className="text-[11px] text-text-muted flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin text-brand-blood" />
                  Loading queue…
                </span>
              )}
            </div>

            {requestsError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-brand-blood" />
                <span>{requestsError}</span>
              </div>
            )}

            {!loadingRequests && approvedRequests.length === 0 && !requestsError && (
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 text-xs text-amber-900 space-y-1">
                <strong className="block font-bold">No Approved Requests in Queue</strong>
                <p className="text-amber-800">
                  Only blood requests in <span className="font-semibold">Approved</span> status can be fulfilled. Please approve incoming requests in the Blood Requests queue first.
                </p>
              </div>
            )}

            {approvedRequests.length > 0 && (
              <select
                id="request_select"
                value={selectedRequestId}
                onChange={(e) => setSelectedRequestId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-workspace-bg border border-border-card rounded-xl text-xs text-text-main font-medium focus:outline-none focus:ring-2 focus:ring-brand-blood/20 focus:border-brand-blood transition-colors"
              >
                {approvedRequests.map((r) => (
                  <option key={r.request_id} value={String(r.request_id)}>
                    #REQ-{r.request_id} • {r.hospital_name} — {r.quantity_required} unit(s) of {r.blood_group} ({r.urgency})
                  </option>
                ))}
              </select>
            )}

            {/* Request Summary Card */}
            {currentRequest && (
              <div className="p-4 rounded-2xl bg-workspace-bg border border-border-card/70 space-y-3 mt-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="font-mono text-xs font-bold text-text-muted">
                      #REQ-{currentRequest.request_id}
                    </span>
                    <h4 className="text-sm font-bold text-text-main flex items-center gap-1.5 mt-0.5">
                      <Building2 className="w-3.5 h-3.5 text-brand-blood shrink-0" />
                      {currentRequest.hospital_name}
                    </h4>
                  </div>
                  <RequestUrgencyBadge urgency={currentRequest.urgency} />
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded-xl bg-surface-white border border-border-card/50">
                    <span className="text-[10px] uppercase font-bold text-text-muted block">Required Group</span>
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold mt-0.5 border ${bgColors.badge}`}>
                      {currentRequest.blood_group}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-surface-white border border-border-card/50">
                    <span className="text-[10px] uppercase font-bold text-text-muted block">Required Units</span>
                    <span className="text-sm font-bold text-text-main mt-0.5 block">
                      {currentRequest.quantity_required}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-surface-white border border-border-card/50">
                    <span className="text-[10px] uppercase font-bold text-text-muted block">Request Date</span>
                    <span className="text-xs font-medium text-text-main mt-0.5 block">
                      {formatShortDate(currentRequest.request_date)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Step 2: Available Units Selection */}
          {currentRequest && (
            <div className="space-y-3 pt-2 border-t border-border-card">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-xs font-bold text-text-main uppercase tracking-wider">
                    2. Select Physical Blood Units
                  </h3>
                  <p className="text-[11px] text-text-muted mt-0.5">
                    Available units are listed by earliest expiry (FEFO). Select exactly{' '}
                    <strong className="text-text-main">{reqQty}</strong> unit(s).
                  </p>
                </div>

                {/* Counter Pill */}
                <div
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-colors self-start sm:self-auto ${
                    isExactQtySelected
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : 'bg-amber-50 text-amber-800 border-amber-300'
                  }`}
                >
                  <span>Selected:</span>
                  <span className="font-mono text-sm">
                    {selectedUnitIds.length} / {reqQty}
                  </span>
                  {isExactQtySelected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                </div>
              </div>

              {loadingUnits && (
                <div className="py-8 flex flex-col items-center justify-center gap-2 text-text-muted">
                  <Loader2 className="w-6 h-6 animate-spin text-brand-blood" />
                  <span className="text-xs font-medium">Fetching available {currentRequest.blood_group} units…</span>
                </div>
              )}

              {unitsError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-brand-blood flex-shrink-0" />
                    <span>{unitsError}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => fetchUnits(currentRequest.blood_group_id)}
                    className="underline font-bold"
                  >
                    Retry
                  </button>
                </div>
              )}

              {!loadingUnits && availableUnits.length === 0 && !unitsError && (
                <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200 text-xs text-rose-900 space-y-1">
                  <strong className="block font-bold">No Available Units for {currentRequest.blood_group}</strong>
                  <p className="text-rose-800 leading-relaxed">
                    Physical inventory has 0 unexpired, available units of this blood group. Intake collections or approved donations are required before this request can be fulfilled.
                  </p>
                </div>
              )}

              {/* Units Selection List */}
              {!loadingUnits && availableUnits.length > 0 && (
                <div className="border border-border-card rounded-2xl overflow-hidden max-h-60 overflow-y-auto divide-y divide-border-card">
                  {availableUnits.map((u, idx) => {
                    const isSelected = selectedUnitIds.includes(u.unit_id);
                    const disabled = !isSelected && selectedUnitIds.length >= reqQty;

                    return (
                      <div
                        key={u.unit_id}
                        onClick={() => !disabled && handleToggleUnit(u.unit_id)}
                        className={`p-3 flex items-center justify-between text-xs transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-brand-blood/10 border-l-4 border-l-brand-blood text-text-main'
                            : disabled
                            ? 'opacity-40 bg-workspace-bg/40 cursor-not-allowed'
                            : 'hover:bg-workspace-bg bg-surface-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            disabled={disabled}
                            onChange={() => handleToggleUnit(u.unit_id)}
                            className="w-4 h-4 rounded text-brand-blood focus:ring-brand-blood/20 pointer-events-none"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-text-main">
                                #UNIT-{u.unit_id}
                              </span>
                              <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold border ${bgColors.badge}`}>
                                {u.blood_group}
                              </span>
                              {idx === 0 && (
                                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                  Earliest Expiry (FEFO)
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-text-muted mt-0.5">
                              Coll: {formatShortDate(u.collection_date)} • Exp:{' '}
                              <strong className="text-text-main">{formatShortDate(u.expiry_date)}</strong>
                            </div>
                          </div>
                        </div>

                        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50/80 px-2 py-0.5 rounded-lg border border-emerald-200">
                          {u.status}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Submission Error Callout */}
          {submitError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-brand-blood flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Issuance Transaction Rejected</strong>
                <span>{submitError}</span>
              </div>
            </div>
          )}

          {/* Operator Signature & Policy Notice */}
          <div className="p-3.5 rounded-xl bg-workspace-bg border border-border-card text-xs text-text-muted space-y-1">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-brand-blood" />
                <strong className="text-text-main">Transaction Operator:</strong>
              </span>
              <span className="font-medium text-text-main">
                {authStaffName ? `${authStaffName} (Staff ID #${authStaffId})` : 'System Operator (null)'}
              </span>
            </div>
            <p className="text-[11px] text-text-muted leading-relaxed pt-1 border-t border-border-card/60">
              Confirming this transaction will mark selected units as <span className="font-bold text-text-main">Issued</span> and finalize Request #REQ-{currentRequest?.request_id} as <span className="font-bold text-text-main">Completed</span> in an atomic database lock.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-border-card bg-workspace-bg/40 flex items-center justify-end gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 rounded-xl border border-border-card bg-surface-white text-xs font-semibold text-text-main hover:bg-workspace-bg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmIssue}
            disabled={!isExactQtySelected || submitting}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-brand-blood text-white text-xs font-bold hover:bg-brand-blood-dark transition-colors shadow-active-nav disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Executing ACID Issue…
              </>
            ) : (
              <>
                <PackageCheck className="w-4 h-4" />
                Confirm Issue ({selectedUnitIds.length} of {reqQty})
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
