import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  PackageCheck,
  Building2,
  Calendar,
  User,
  ExternalLink,
  ServerCrash,
  Loader2,
  Droplet,
  Clock,
} from 'lucide-react';
import { issueService } from '../../services/api';
import { formatShortDate, BLOOD_GROUP_COLORS, defaultGroupColor } from '../../utils/inventoryHelpers';

export default function IssueDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await issueService.getById(id);
      setIssue(res.data);
    } catch (err) {
      const msg = typeof err === 'string' ? err : err?.message || 'Unable to retrieve blood issue record.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-16 flex flex-col items-center justify-center gap-3 text-text-muted">
        <Loader2 className="w-8 h-8 animate-spin text-brand-blood" />
        <span className="text-sm font-medium">Loading issuance audit log…</span>
      </div>
    );
  }

  if (error || !issue) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-brand-blood mx-auto">
          <ServerCrash className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-text-main">Record Not Found</h2>
        <p className="text-xs text-text-muted leading-relaxed">{error || 'The requested issue record does not exist.'}</p>
        <button
          type="button"
          onClick={() => navigate('/issues')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-white border border-border-card text-xs font-semibold text-text-main hover:bg-workspace-bg shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Blood Issuance
        </button>
      </div>
    );
  }

  const bgColors = BLOOD_GROUP_COLORS[issue.blood_group] || defaultGroupColor;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Back navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/issues')}
          className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text-main transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Blood Issuance
        </button>
        <div className="text-xs text-text-muted font-medium">
          OPERATIONS / Blood Issuance / Record #{issue.issue_id}
        </div>
      </div>

      {/* Header Banner */}
      <div className="bg-surface-white rounded-3xl border border-border-card shadow-card-clean p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-text-main tracking-tight">
              Blood Issuance <span className="font-mono text-brand-blood">#ISS-{issue.issue_id}</span>
            </h1>
          </div>
          <p className="text-xs text-text-muted">
            Permanent dispatch record and traceability audit trail
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
            <PackageCheck className="w-3.5 h-3.5 text-blue-600" />
            Issued to Partner
          </span>
        </div>
      </div>

      {/* Grid: Issuance Details, Request Association, Blood Unit Traceability */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 1. ISSUANCE */}
        <div className="bg-surface-white rounded-3xl border border-border-card shadow-card-clean p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-border-card text-xs font-bold uppercase tracking-wider text-text-muted">
            <Clock className="w-4 h-4 text-brand-blood" />
            <span>Issuance Event</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-2xl bg-workspace-bg border border-border-card/60">
              <span className="text-text-muted block text-[11px] mb-0.5">Issue Transaction ID</span>
              <span className="font-mono font-bold text-text-main text-sm">#ISS-{issue.issue_id}</span>
            </div>

            <div className="p-3 rounded-2xl bg-workspace-bg border border-border-card/60">
              <span className="text-text-muted block text-[11px] mb-0.5">Issue Date</span>
              <span className="font-semibold text-text-main flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-text-muted" />
                {formatShortDate(issue.issue_date)}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-workspace-bg border border-border-card/60">
              <span className="text-text-muted block text-[11px] mb-0.5">Authorized Staff Operator</span>
              <span className="font-semibold text-text-main flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-text-muted" />
                {issue.issued_by_name || (issue.issued_by ? `Staff ID #${issue.issued_by}` : 'System Operator')}
              </span>
            </div>
          </div>
        </div>

        {/* 2. REQUEST & HOSPITAL */}
        <div className="bg-surface-white rounded-3xl border border-border-card shadow-card-clean p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-border-card text-xs font-bold uppercase tracking-wider text-text-muted">
            <Building2 className="w-4 h-4 text-brand-blood" />
            <span>Request &amp; Hospital</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-2xl bg-workspace-bg border border-border-card/60">
              <span className="text-text-muted block text-[11px] mb-0.5">Fulfillment For Request</span>
              <Link
                to={`/requests/${issue.request_id}`}
                className="inline-flex items-center gap-1 font-mono font-bold text-brand-blood hover:underline text-sm"
              >
                #REQ-{issue.request_id}
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="p-3 rounded-2xl bg-workspace-bg border border-border-card/60">
              <span className="text-text-muted block text-[11px] mb-0.5">Partner Hospital</span>
              <span className="font-bold text-text-main text-sm block">{issue.hospital_name}</span>
              <span className="text-[11px] text-text-muted mt-0.5 block">Registered Network Partner</span>
            </div>
          </div>
        </div>

        {/* 3. BLOOD UNIT SPECIFICATION */}
        <div className="bg-surface-white rounded-3xl border border-border-card shadow-card-clean p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-border-card text-xs font-bold uppercase tracking-wider text-text-muted">
            <Droplet className="w-4 h-4 text-brand-blood" />
            <span>Blood Unit Dispatched</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-2xl bg-workspace-bg border border-border-card/60 flex items-center justify-between">
              <div>
                <span className="text-text-muted block text-[11px] mb-0.5">Physical Unit ID</span>
                <span className="font-mono font-bold text-brand-blood text-sm">#UNIT-{issue.unit_id}</span>
              </div>
              <span className={`px-2.5 py-1 rounded-xl text-xs font-bold border ${bgColors.badge}`}>
                {issue.blood_group}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-workspace-bg border border-border-card/60">
              <span className="text-text-muted block text-[11px] mb-0.5">Collection Date</span>
              <span className="font-semibold text-text-main">{formatShortDate(issue.collection_date)}</span>
            </div>

            <div className="p-3 rounded-2xl bg-workspace-bg border border-border-card/60">
              <span className="text-text-muted block text-[11px] mb-0.5">Expiry Date</span>
              <span className="font-semibold text-text-main">{formatShortDate(issue.expiry_date)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Audit Footnote */}
      <div className="p-4 rounded-2xl bg-workspace-bg border border-border-card text-xs text-text-muted leading-relaxed">
        <strong className="text-text-main font-semibold">ACID Transaction Verification:</strong> This blood unit was validated for blood-group match, non-expiration, and availability before being permanently marked as <span className="font-semibold text-text-main">Issued</span> in the physical inventory and binding to Request #REQ-{issue.request_id}.
      </div>
    </div>
  );
}
