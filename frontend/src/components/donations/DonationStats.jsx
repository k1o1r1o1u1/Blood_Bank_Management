import React from 'react';
import { Droplet, Clock, CheckCircle2, XCircle } from 'lucide-react';

export default function DonationStats({ donations = [] }) {
  const total = donations.length;
  const pending = donations.filter((d) => d.screening_status === 'Pending').length;
  const approved = donations.filter((d) => d.screening_status === 'Approved').length;
  const rejected = donations.filter((d) => d.screening_status === 'Rejected').length;

  return (
    <div className="bg-surface-white rounded-[22px] p-5 lg:p-6 border border-border-card shadow-card-clean">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-border-card">
        <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">
          Donation Operations Overview
        </span>
        <span className="text-xs text-text-muted">
          Real-time intake &amp; lab status
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Total Donations */}
        <div className="p-4 rounded-xl bg-workspace-bg border border-border-card/60 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-sidebar-dark text-white flex items-center justify-center shrink-0 shadow-2xs">
            <Droplet className="w-5 h-5 fill-white/20" />
          </div>
          <div>
            <span className="text-2xl font-bold text-text-main block leading-tight">
              {total.toLocaleString()}
            </span>
            <span className="text-xs text-text-muted font-medium">Total Collections</span>
          </div>
        </div>

        {/* Pending Screening */}
        <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/60 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-2xl font-bold text-amber-700 block leading-tight">
              {pending.toLocaleString()}
            </span>
            <span className="text-xs text-amber-800 font-medium">Pending Screening</span>
          </div>
        </div>

        {/* Approved Units */}
        <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/60 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-2xl font-bold text-emerald-700 block leading-tight">
              {approved.toLocaleString()}
            </span>
            <span className="text-xs text-emerald-800 font-medium">Approved / Storage</span>
          </div>
        </div>

        {/* Rejected */}
        <div className="p-4 rounded-xl bg-rose-50/40 border border-rose-200/60 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-brand-blood-light text-brand-blood flex items-center justify-center shrink-0">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-2xl font-bold text-brand-blood block leading-tight">
              {rejected.toLocaleString()}
            </span>
            <span className="text-xs text-brand-blood font-medium">Screening Rejected</span>
          </div>
        </div>
      </div>
    </div>
  );
}
