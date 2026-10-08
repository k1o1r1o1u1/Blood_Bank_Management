import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, X, Loader2 } from 'lucide-react';
import RequestStatusBadge from './RequestStatusBadge';

export default function RequestStatusModal({ request, targetStatus, onConfirm, onCancel, loading, apiError }) {
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onCancel(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onCancel]);

  if (!request || !targetStatus) return null;

  const isApprove = targetStatus === 'Approved';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="status-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      <div className="bg-surface-white rounded-3xl border border-border-card shadow-2xl w-full max-w-md p-6 space-y-5 animate-in fade-in-50 zoom-in-95">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                isApprove ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
              }`}
            >
              {isApprove ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            </div>
            <div>
              <h3 id="status-modal-title" className="text-base font-bold text-text-main">
                {isApprove ? 'Approve Blood Request' : 'Reject Blood Request'}
              </h3>
              <p className="text-xs text-text-muted">
                Request #REQ-{request.request_id} • {request.hospital_name}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="text-text-muted hover:text-text-main p-1 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Confirmation explanation */}
        <div className="p-4 rounded-2xl bg-workspace-bg border border-border-card text-xs text-text-main space-y-2">
          <div className="flex justify-between py-1 border-b border-border-card/60">
            <span className="text-text-muted">Hospital</span>
            <span className="font-semibold">{request.hospital_name}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-border-card/60">
            <span className="text-text-muted">Blood Group</span>
            <span className="font-bold text-brand-blood">{request.blood_group}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-border-card/60">
            <span className="text-text-muted">Quantity Required</span>
            <span className="font-semibold">{request.quantity_required} unit(s)</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-text-muted">Target Status</span>
            <RequestStatusBadge status={targetStatus} />
          </div>
        </div>

        <p className="text-xs text-text-muted leading-relaxed">
          {isApprove
            ? 'Approving marks this requirement as verified and ready for blood unit allocation in the issue operations queue. Note: Approving does NOT reserve or issue inventory units until physical fulfillment.'
            : 'Rejecting marks this requirement as declined. This action can be re-evaluated if updated clinical requirements are provided.'}
        </p>

        {apiError && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600" />
            <span>{apiError}</span>
          </div>
        )}

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 rounded-xl border border-border-card bg-surface-white text-xs font-semibold text-text-main hover:bg-workspace-bg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white text-xs font-bold transition-colors disabled:opacity-50 ${
              isApprove
                ? 'bg-emerald-600 hover:bg-emerald-700 shadow-sm'
                : 'bg-rose-600 hover:bg-rose-700 shadow-sm'
            }`}
          >
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {isApprove ? 'Confirm Approval' : 'Confirm Rejection'}
          </button>
        </div>
      </div>
    </div>
  );
}
