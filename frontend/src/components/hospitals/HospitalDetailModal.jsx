import React, { useState, useEffect } from 'react';
import {
  X,
  Building2,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  Hash,
  Loader2,
  ServerCrash,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
} from 'lucide-react';
import { hospitalService } from '../../services/api';
import { formatShortDate } from '../../utils/inventoryHelpers';

// Urgency badge config — request urgency values are Enum('Normal','Urgent','Critical') from DB
const URGENCY_CONFIG = {
  Critical: {
    badge: 'bg-rose-100 text-rose-800 border-rose-200',
    dot: 'bg-rose-500',
  },
  Urgent: {
    badge: 'bg-amber-100 text-amber-800 border-amber-200',
    dot: 'bg-amber-500',
  },
  Normal: {
    badge: 'bg-slate-100 text-slate-700 border-slate-200',
    dot: 'bg-slate-400',
  },
};

// Request status badge config — Enum('Pending','Approved','Rejected','Completed')
const REQUEST_STATUS_CONFIG = {
  Pending: {
    badge: 'bg-amber-50 text-amber-800 border-amber-200',
    icon: Clock,
  },
  Approved: {
    badge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    icon: CheckCircle2,
  },
  Completed: {
    badge: 'bg-blue-50 text-blue-800 border-blue-200',
    icon: CheckCircle2,
  },
  Rejected: {
    badge: 'bg-rose-50 text-rose-800 border-rose-200',
    icon: AlertCircle,
  },
};

const REQUESTS_PER_PAGE = 5;

export default function HospitalDetailModal({ hospitalId, onClose, onEditRequest, onAddRequest }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requestPage, setRequestPage] = useState(1);

  useEffect(() => {
    if (!hospitalId) return;
    let isMounted = true;

    const fetchDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await hospitalService.getById(hospitalId);
        if (isMounted) setData(res.data);
      } catch (err) {
        if (isMounted) setError(err?.message || 'Unable to load hospital details.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDetail();
    return () => { isMounted = false; };
  }, [hospitalId]);

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const requests = data?.requests || [];
  const totalPages = Math.ceil(requests.length / REQUESTS_PER_PAGE) || 1;
  const pagedRequests = requests.slice(
    (requestPage - 1) * REQUESTS_PER_PAGE,
    requestPage * REQUESTS_PER_PAGE
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="hospital-detail-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      <div className="bg-surface-white rounded-3xl border border-border-card shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-border-card bg-workspace-bg/50 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-blood/10 border border-brand-blood/20 flex items-center justify-center text-brand-blood">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 id="hospital-detail-title" className="text-base font-bold text-text-main">
                {loading ? 'Loading…' : (data?.name || 'Hospital Detail')}
              </h2>
              <p className="text-xs text-text-muted">
                Partner hospital profile &amp; request history
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="w-9 h-9 rounded-full border border-border-card bg-surface-white flex items-center justify-center text-text-muted hover:text-text-main hover:bg-workspace-bg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading && (
            <div className="py-16 flex flex-col items-center gap-3 text-text-muted">
              <Loader2 className="w-8 h-8 animate-spin text-brand-blood" />
              <span className="text-sm font-medium">Loading hospital data…</span>
            </div>
          )}

          {error && (
            <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-rose-800 text-sm">
              <ServerCrash className="w-5 h-5 flex-shrink-0 text-brand-blood" />
              <span>{error}</span>
            </div>
          )}

          {!loading && !error && data && (
            <>
              {/* Hospital Identity */}
              <div className="bg-workspace-bg rounded-2xl border border-border-card p-5 space-y-3.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">
                  Hospital Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <InfoRow icon={Hash} label="Hospital ID" value={`#H-${data.hospital_id}`} />
                  <InfoRow icon={Building2} label="Name" value={data.name} />
                  {data.address && (
                    <InfoRow icon={MapPin} label="Address" value={data.address} className="sm:col-span-2" />
                  )}
                  <InfoRow icon={Phone} label="Contact" value={data.contact} />
                  {data.email && (
                    <InfoRow
                      icon={Mail}
                      label="Email"
                      value={
                        <a
                          href={`mailto:${data.email}`}
                          className="text-brand-blood hover:underline font-medium"
                        >
                          {data.email}
                        </a>
                      }
                    />
                  )}
                </div>
              </div>

              {/* Request History */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">
                    Blood Request History ({requests.length})
                  </h3>
                </div>

                {requests.length === 0 ? (
                  <div className="bg-workspace-bg rounded-2xl border border-border-card p-8 text-center">
                    <p className="text-sm font-semibold text-text-main">No requests recorded</p>
                    <p className="text-xs text-text-muted mt-1">
                      This hospital has not submitted any blood requests yet.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="border border-border-card rounded-2xl overflow-hidden divide-y divide-border-card">
                      {pagedRequests.map((req) => {
                        const urgencyCfg = URGENCY_CONFIG[req.urgency] || URGENCY_CONFIG.Normal;
                        const statusCfg = REQUEST_STATUS_CONFIG[req.status] || REQUEST_STATUS_CONFIG.Pending;
                        const StatusIcon = statusCfg.icon;
                        return (
                          <div key={req.request_id} className="p-4 bg-surface-white hover:bg-workspace-bg/50 transition-colors">
                            <div className="flex flex-wrap items-start gap-2 justify-between">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-xs font-mono font-bold text-text-main">
                                    #REQ-{req.request_id}
                                  </span>
                                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${urgencyCfg.badge}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${urgencyCfg.dot}`} />
                                    {req.urgency}
                                  </span>
                                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${statusCfg.badge}`}>
                                    <StatusIcon className="w-3 h-3" />
                                    {req.status}
                                  </span>
                                </div>
                                <div className="text-xs text-text-muted">
                                  <span className="font-semibold text-text-main">{req.blood_group}</span>
                                  {' · '}{req.quantity_required} unit{req.quantity_required !== 1 ? 's' : ''}
                                  {' · '}{formatShortDate(req.request_date)}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between text-xs text-text-muted py-1">
                        <span>
                          Page {requestPage} of {totalPages}
                        </span>
                        <div className="flex gap-1">
                          <button
                            type="button"
                            disabled={requestPage <= 1}
                            onClick={() => setRequestPage((p) => p - 1)}
                            className="p-1.5 rounded-lg border border-border-card hover:bg-workspace-bg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={requestPage >= totalPages}
                            onClick={() => setRequestPage((p) => p + 1)}
                            className="p-1.5 rounded-lg border border-border-card hover:bg-workspace-bg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border-card bg-workspace-bg/50 flex items-center justify-end gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-border-card bg-surface-white text-text-main text-xs font-semibold hover:bg-workspace-bg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// Small helper for info rows
function InfoRow({ icon: Icon, label, value, className = '' }) {
  return (
    <div className={`space-y-0.5 ${className}`}>
      <span className="text-[11px] text-text-muted flex items-center gap-1.5 font-medium">
        <Icon className="w-3.5 h-3.5 text-brand-blood" />
        {label}
      </span>
      <div className="text-sm font-semibold text-text-main pl-5">
        {value || '—'}
      </div>
    </div>
  );
}
