import React from 'react';
import { GitPullRequest, Clock, AlertTriangle, CheckCheck } from 'lucide-react';

export default function RequestStats({ requests = [] }) {
  const total = requests.length;
  const pending = requests.filter((r) => r.status === 'Pending').length;
  const critical = requests.filter((r) => r.urgency === 'Critical').length;
  const completed = requests.filter((r) => r.status === 'Completed').length;

  return (
    <div className="bg-surface-white rounded-2xl border border-border-card shadow-card-clean p-5 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-border-card">
        <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">
          Request Operations Overview
        </span>
        <span className="text-xs text-text-muted">
          Synchronized with hospital requirements
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Total Requests */}
        <div className="p-4 rounded-xl bg-workspace-bg border border-border-card/60 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-brand-blood/10 text-brand-blood flex items-center justify-center shrink-0">
            <GitPullRequest className="w-5 h-5" />
          </div>
          <div>
            <span className="text-2xl font-bold text-text-main block leading-tight">
              {total.toLocaleString()}
            </span>
            <span className="text-xs text-text-muted font-medium">Total Requests</span>
          </div>
        </div>

        {/* Pending Requests */}
        <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/60 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-2xl font-bold text-amber-700 block leading-tight">
              {pending.toLocaleString()}
            </span>
            <span className="text-xs text-amber-800 font-medium">Pending Review</span>
          </div>
        </div>

        {/* Critical Urgency */}
        <div className="p-4 rounded-xl bg-rose-50/50 border border-rose-200/60 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-2xl font-bold text-rose-700 block leading-tight">
              {critical.toLocaleString()}
            </span>
            <span className="text-xs text-rose-800 font-medium">Critical Urgency</span>
          </div>
        </div>

        {/* Completed / Fulfilled */}
        <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200/60 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
            <CheckCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-2xl font-bold text-blue-700 block leading-tight">
              {completed.toLocaleString()}
            </span>
            <span className="text-xs text-blue-800 font-medium">Fulfilled (Completed)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
