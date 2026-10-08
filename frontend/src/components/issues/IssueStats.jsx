import React from 'react';
import { PackageCheck, Building2, UserCheck, Droplet } from 'lucide-react';

export default function IssueStats({ issues = [] }) {
  const totalIssued = issues.length;

  // Unique hospitals serviced
  const uniqueHospitals = new Set(issues.map((i) => i.hospital_name).filter(Boolean)).size;

  // Unique requests fulfilled
  const uniqueRequests = new Set(issues.map((i) => i.request_id).filter(Boolean)).size;

  // Recent issues in current month/today
  const todayStr = new Date().toISOString().slice(0, 10);
  const issuedToday = issues.filter((i) => i.issue_date && i.issue_date.startsWith(todayStr)).length;

  return (
    <div className="bg-surface-white rounded-2xl border border-border-card shadow-card-clean p-5 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-border-card">
        <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">
          Issuance Operations Overview
        </span>
        <span className="text-xs text-text-muted">
          Synchronized with hospital dispatch records
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Total Units Issued */}
        <div className="p-4 rounded-xl bg-workspace-bg border border-border-card/60 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-brand-blood/10 text-brand-blood flex items-center justify-center shrink-0">
            <PackageCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-2xl font-bold text-text-main block leading-tight">
              {totalIssued.toLocaleString()}
            </span>
            <span className="text-xs text-text-muted font-medium">Units Dispatched</span>
          </div>
        </div>

        {/* Requests Fulfilled */}
        <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200/60 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
            <Droplet className="w-5 h-5" />
          </div>
          <div>
            <span className="text-2xl font-bold text-blue-700 block leading-tight">
              {uniqueRequests.toLocaleString()}
            </span>
            <span className="text-xs text-blue-800 font-medium">Requests Serviced</span>
          </div>
        </div>

        {/* Hospitals Partnered */}
        <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/60 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-2xl font-bold text-emerald-700 block leading-tight">
              {uniqueHospitals.toLocaleString()}
            </span>
            <span className="text-xs text-emerald-800 font-medium">Hospitals Supplied</span>
          </div>
        </div>

        {/* Units Issued Today */}
        <div className="p-4 rounded-xl bg-workspace-bg border border-border-card/60 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-brand-blood-light text-brand-blood flex items-center justify-center shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-2xl font-bold text-text-main block leading-tight">
              {issuedToday.toLocaleString()}
            </span>
            <span className="text-xs text-text-muted font-medium">Issued Today</span>
          </div>
        </div>
      </div>
    </div>
  );
}
