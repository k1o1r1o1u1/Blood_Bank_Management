import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  Phone,
  Mail,
  Calendar,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  Hash,
  ServerCrash,
  Loader2,
  ExternalLink,
  PackageCheck,
} from 'lucide-react';
import { requestService } from '../../services/api';
import RequestStatusBadge from '../../components/requests/RequestStatusBadge';
import RequestUrgencyBadge from '../../components/requests/RequestUrgencyBadge';
import RequestStatusModal from '../../components/requests/RequestStatusModal';
import IssueBloodModal from '../../components/issues/IssueBloodModal';
import { formatShortDate, BLOOD_GROUP_COLORS, defaultGroupColor } from '../../utils/inventoryHelpers';

export default function RequestDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Status modal
  const [modalOpen, setModalOpen] = useState(false);
  const [targetStatus, setTargetStatus] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError, setStatusError] = useState(null);

  // Issue modal
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState(null);
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await requestService.getById(id);
      setRequest(res.data);
    } catch (err) {
      const msg = typeof err === 'string' ? err : err?.message || 'Unable to retrieve request details.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const handleConfirmStatus = async () => {
    if (!targetStatus) return;
    setStatusLoading(true);
    setStatusError(null);

    try {
      await requestService.updateStatus(id, { status: targetStatus });
      showToast(`Request updated to ${targetStatus} successfully.`);
      setModalOpen(false);
      setTargetStatus(null);
      await fetchDetail();
    } catch (err) {
      const msg = typeof err === 'string' ? err : err?.message || 'Failed to update request status.';
      setStatusError(msg);
    } finally {
      setStatusLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-16 flex flex-col items-center justify-center gap-3 text-text-muted">
        <Loader2 className="w-8 h-8 animate-spin text-brand-blood" />
        <span className="text-sm font-medium">Loading request information…</span>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-brand-blood mx-auto">
          <ServerCrash className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-text-main">Request Not Found</h2>
        <p className="text-xs text-text-muted leading-relaxed">{error || 'The requested record does not exist.'}</p>
        <button
          type="button"
          onClick={() => navigate('/requests')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-white border border-border-card text-xs font-semibold text-text-main hover:bg-workspace-bg shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Blood Requests
        </button>
      </div>
    );
  }

  const bgColors = BLOOD_GROUP_COLORS[request.blood_group] || defaultGroupColor;
  const isPending = request.status === 'Pending';
  const isApproved = request.status === 'Approved';
  const isCompleted = request.status === 'Completed';

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Back nav & breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/requests')}
          className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text-main transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Blood Requests
        </button>
        <div className="text-xs text-text-muted font-medium">
          OPERATIONS / Blood Requests / Request #{request.request_id}
        </div>
      </div>

      {/* Header card */}
      <div className="bg-surface-white rounded-3xl border border-border-card shadow-card-clean p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-text-main tracking-tight">
              Blood Request <span className="font-mono text-brand-blood">#REQ-{request.request_id}</span>
            </h1>
          </div>
          <p className="text-xs text-text-muted">
            Logged requirement for hospital partner operations
          </p>
        </div>

        <div className="flex items-center gap-3">
          <RequestUrgencyBadge urgency={request.urgency} />
          <RequestStatusBadge status={request.status} />
        </div>
      </div>

      {/* Main Grid: Request info & Hospital info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Request Details Panel */}
        <div className="bg-surface-white rounded-3xl border border-border-card shadow-card-clean p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-border-card">
            <h2 className="text-sm font-bold text-text-main">Requirement Specifications</h2>
            <span className="text-[11px] font-mono text-text-muted">ID: {request.request_id}</span>
          </div>

          <div className="space-y-3.5 text-xs">
            {/* Blood Group */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-workspace-bg border border-border-card/60">
              <span className="text-text-muted font-medium">Blood Group Required</span>
              <span className={`px-3 py-1 rounded-xl text-sm font-bold border ${bgColors.badge}`}>
                {request.blood_group}
              </span>
            </div>

            {/* Quantity */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-workspace-bg border border-border-card/60">
              <span className="text-text-muted font-medium">Quantity Required</span>
              <span className="text-base font-bold text-text-main">
                {request.quantity_required} <span className="text-xs font-normal text-text-muted">unit(s)</span>
              </span>
            </div>

            {/* Request Date */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-workspace-bg border border-border-card/60">
              <span className="text-text-muted font-medium">Request Date</span>
              <span className="font-semibold text-text-main flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-text-muted" />
                {formatShortDate(request.request_date)}
              </span>
            </div>

            {/* Urgency Classification */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-workspace-bg border border-border-card/60">
              <span className="text-text-muted font-medium">Urgency Level</span>
              <RequestUrgencyBadge urgency={request.urgency} />
            </div>

            {/* Current Lifecycle Status */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-workspace-bg border border-border-card/60">
              <span className="text-text-muted font-medium">Lifecycle Status</span>
              <RequestStatusBadge status={request.status} />
            </div>
          </div>
        </div>

        {/* 2. Hospital Information Panel */}
        <div className="bg-surface-white rounded-3xl border border-border-card shadow-card-clean p-6 space-y-5 flex flex-col justify-between">
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-border-card">
              <h2 className="text-sm font-bold text-text-main">Hospital Partner</h2>
              <span className="text-[11px] font-mono text-text-muted">Partner #{request.hospital_id}</span>
            </div>

            <div className="p-4 rounded-2xl bg-workspace-bg border border-border-card/60 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-blood/10 border border-brand-blood/20 flex items-center justify-center text-brand-blood shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-text-main">{request.hospital_name}</h3>
                  <p className="text-xs text-text-muted">Registered Network Partner</p>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-border-card/60 text-xs">
                {request.hospital_contact ? (
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5" />
                      Contact
                    </span>
                    <a
                      href={`tel:${request.hospital_contact}`}
                      className="font-semibold text-text-main hover:text-brand-blood transition-colors"
                    >
                      {request.hospital_contact}
                    </a>
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-text-muted">
                    <span>Contact</span>
                    <span>Not provided</span>
                  </div>
                )}

                {request.hospital_email ? (
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5" />
                      Email
                    </span>
                    <a
                      href={`mailto:${request.hospital_email}`}
                      className="font-medium text-brand-blood hover:underline truncate max-w-[180px]"
                    >
                      {request.hospital_email}
                    </a>
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-text-muted">
                    <span>Email</span>
                    <span>Not provided</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Communication Actions */}
          <div className="flex items-center gap-2 pt-2">
            {request.hospital_contact && (
              <a
                href={`tel:${request.hospital_contact}`}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-surface-white border border-border-card text-xs font-semibold text-text-main hover:bg-workspace-bg transition-colors shadow-xs"
              >
                <Phone className="w-3.5 h-3.5 text-text-muted" />
                Call Partner
              </a>
            )}
            {request.hospital_email && (
              <a
                href={`mailto:${request.hospital_email}`}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-surface-white border border-border-card text-xs font-semibold text-text-main hover:bg-workspace-bg transition-colors shadow-xs"
              >
                <Mail className="w-3.5 h-3.5 text-text-muted" />
                Send Email
              </a>
            )}
          </div>
        </div>
      </div>

      {/* 3. Operational Workflow & Actions Card */}
      <div className="bg-surface-white rounded-3xl border border-border-card shadow-card-clean p-6 space-y-4">
        <h2 className="text-sm font-bold text-text-main">Operational Workflow</h2>

        {/* Explain Current Status */}
        {isPending && (
          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 text-xs text-amber-900 flex items-start justify-between gap-4 flex-wrap">
            <div className="space-y-1">
              <strong className="block font-bold">Awaiting Operational Decision</strong>
              <p className="text-amber-800 leading-relaxed max-w-xl">
                This request has been logged by the partner hospital and is pending verification. Approve to queue for fulfillment, or reject if requirements cannot be serviced.
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setTargetStatus('Approved');
                  setModalOpen(true);
                  setStatusError(null);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4" />
                Approve Request
              </button>
              <button
                type="button"
                onClick={() => {
                  setTargetStatus('Rejected');
                  setModalOpen(true);
                  setStatusError(null);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors shadow-sm"
              >
                <XCircle className="w-4 h-4" />
                Reject Request
              </button>
            </div>
          </div>
        )}

        {isApproved && (
          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 text-xs text-emerald-900 flex items-start justify-between gap-4 flex-wrap">
            <div className="space-y-1">
              <strong className="block font-bold">Approved for Issue Operations</strong>
              <p className="text-emerald-800 leading-relaxed max-w-xl">
                This request is verified and ready for fulfillment. Physical blood units can now be selected and dispatched through the atomic Blood Issue transaction console.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsIssueModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-blood text-white font-bold hover:bg-brand-blood-dark transition-colors shadow-active-nav"
            >
              <PackageCheck className="w-4 h-4" />
              Issue Blood Units
            </button>
          </div>
        )}

        {isCompleted && (
          <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 text-xs text-blue-900">
            <strong className="block font-bold">Fulfillment Completed</strong>
            <p className="text-blue-800 leading-relaxed mt-0.5">
              Blood units were formally issued for this request via an atomic inventory transaction. This record is finalized and cannot be modified.
            </p>
          </div>
        )}

        {request.status === 'Rejected' && (
          <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200 text-xs text-rose-900">
            <strong className="block font-bold">Request Rejected</strong>
            <p className="text-rose-800 leading-relaxed mt-0.5">
              This blood requirement was declined during clinical intake review.
            </p>
          </div>
        )}

        {/* Boundary Notice */}
        <div className="p-3.5 rounded-xl bg-workspace-bg border border-border-card text-xs text-text-muted leading-relaxed">
          <strong className="text-text-main font-semibold">Inventory Process Boundary:</strong> Request creation and status approval do NOT deduct or reserve blood units. Physical inventory reduction is strictly performed during the atomic Blood Issue transaction.
        </div>
      </div>

      {/* Status Modal */}
      {modalOpen && (
        <RequestStatusModal
          request={request}
          targetStatus={targetStatus}
          onConfirm={handleConfirmStatus}
          onCancel={() => {
            setModalOpen(false);
            setTargetStatus(null);
            setStatusError(null);
          }}
          loading={statusLoading}
          apiError={statusError}
        />
      )}

      {/* Issue Blood Modal */}
      <IssueBloodModal
        isOpen={isIssueModalOpen}
        onClose={() => setIsIssueModalOpen(false)}
        preselectedRequestId={request.request_id}
        onIssueSuccess={(resultData) => {
          showToast(`Units issued successfully for #REQ-${request.request_id}. Status updated to Completed.`);
          fetchDetail();
        }}
      />

      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#1C1315] text-white text-xs font-medium shadow-xl border border-white/10">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
