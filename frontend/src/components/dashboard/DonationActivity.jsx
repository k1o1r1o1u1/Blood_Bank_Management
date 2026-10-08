import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HeartHandshake, CheckCircle2, Clock, AlertCircle, ArrowRight, Info } from 'lucide-react';
import { formatShortDate, BLOOD_GROUP_COLORS, defaultGroupColor } from '../../utils/inventoryHelpers';

const STATUS_BADGE = {
  Approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Pending:  'bg-amber-50 text-amber-700 border-amber-200',
  Rejected: 'bg-rose-50 text-brand-blood border-rose-200',
};

export default function DonationActivity({ recentDonations = [] }) {
  const navigate = useNavigate();

  // Derive real summary metrics from the verified recent donations feed
  const totalScreened = recentDonations.length;
  const totalApproved = recentDonations.filter((d) => d.screening_status === 'Approved').length;
  const totalPending  = recentDonations.filter((d) => d.screening_status === 'Pending').length;
  const totalRejected = recentDonations.filter((d) => d.screening_status === 'Rejected').length;
  const approvalRate  = totalScreened > 0
    ? `${Math.round((totalApproved / totalScreened) * 100)}%`
    : '—';

  return (
    <div className="bg-surface-white rounded-[22px] p-6 lg:p-7 border border-border-card shadow-card-clean flex flex-col space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border-card">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-semibold text-text-main">
              Recent Donation Activity
            </h2>
          </div>
          <p className="text-xs text-text-muted mt-0.5">
            Verified donor collections &amp; laboratory screening outcomes from backend
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-workspace-bg border border-border-card text-[11px] font-medium text-text-muted">
            <Info className="w-3.5 h-3.5 text-text-muted/70" />
            <span>Trends API: Unavailable</span>
          </span>
          <button
            type="button"
            onClick={() => navigate('/donations')}
            className="inline-flex items-center gap-1 text-xs font-semibold text-brand-blood hover:underline"
          >
            <span>All Donations</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* KPI Metric Summary Bar — 100% computed from real data */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-workspace-bg border border-border-card/60">
          <span className="text-[11px] text-text-muted font-medium block">Recent Screened</span>
          <span className="text-xl font-bold text-text-main mt-0.5 block">{totalScreened}</span>
          <span className="text-[10px] text-text-muted">Recorded batches</span>
        </div>

        <div className="p-3 rounded-xl bg-workspace-bg border border-border-card/60">
          <span className="text-[11px] text-text-muted font-medium block">Approved</span>
          <span className="text-xl font-bold text-emerald-700 mt-0.5 block">{totalApproved}</span>
          <span className="text-[10px] text-emerald-600 font-medium">Passed screening</span>
        </div>

        <div className="p-3 rounded-xl bg-workspace-bg border border-border-card/60">
          <span className="text-[11px] text-text-muted font-medium block">Pending / Review</span>
          <span className="text-xl font-bold text-amber-700 mt-0.5 block">{totalPending}</span>
          <span className="text-[10px] text-amber-600 font-medium">Awaiting lab tests</span>
        </div>

        <div className="p-3 rounded-xl bg-workspace-bg border border-border-card/60">
          <span className="text-[11px] text-text-muted font-medium block">Approval Rate</span>
          <span className="text-xl font-bold text-text-main mt-0.5 block">{approvalRate}</span>
          <span className="text-[10px] text-text-muted">Screening success</span>
        </div>
      </div>

      {/* Real Donations Table / List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-text-muted px-2 py-1">
          <span>Donor &amp; Collection</span>
          <span>Screening Status</span>
        </div>

        {recentDonations.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-workspace-bg border border-border-card/60">
            <HeartHandshake className="w-8 h-8 text-text-muted/50 mx-auto mb-2" />
            <p className="text-sm font-semibold text-text-main">No recent donations</p>
            <p className="text-xs text-text-muted mt-0.5">Donation intake records will appear once added to the system.</p>
          </div>
        ) : (
          <div className="divide-y divide-border-card/60 rounded-xl border border-border-card bg-workspace-bg/40 overflow-hidden">
            {recentDonations.map((d) => {
              const bgBadgeColor = BLOOD_GROUP_COLORS[d.blood_group] ?? defaultGroupColor;
              return (
                <div
                  key={d.donation_id}
                  className="p-3.5 flex items-center justify-between gap-4 hover:bg-surface-white transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className="w-8 h-8 rounded-lg text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-2xs"
                      style={{ backgroundColor: bgBadgeColor }}
                    >
                      {d.blood_group}
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold text-xs sm:text-sm text-text-main truncate">
                        {d.donor_name}
                      </p>
                      <p className="text-[11px] text-text-muted">
                        Batch #{d.donation_id} • {d.quantity} unit{d.quantity !== 1 ? 's' : ''} • {formatShortDate(d.donation_date)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${
                        STATUS_BADGE[d.screening_status] ?? STATUS_BADGE.Pending
                      }`}
                    >
                      {d.screening_status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Transparent Disclaimer Notice */}
      <div className="p-3 rounded-xl bg-workspace-bg/70 border border-border-card/70 flex items-start gap-2.5 text-xs text-text-muted">
        <Info className="w-4 h-4 text-text-muted shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-text-main font-semibold">Data Integrity Notice:</strong> Historical time-series trends (7D / 30D / 90D) are currently unavailable as the backend does not expose an aggregated time-series endpoint. Displaying verified real-time donation batches above.
        </p>
      </div>
    </div>
  );
}
