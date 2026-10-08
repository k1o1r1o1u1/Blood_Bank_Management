import React from 'react';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

export default function InventoryHealth({ inventory = [], totals, healthScore = 0, healthStatus = 'Healthy' }) {
  const available    = totals?.available ?? 0;
  const reserved     = totals?.reserved  ?? 0;
  const issued       = totals?.issued    ?? 0;
  const expired      = totals?.expired   ?? 0;

  const isHealthy    = healthScore >= 75;
  const pillStyle    = isHealthy
    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
    : 'bg-amber-50 border-amber-200 text-amber-800';
  const PillIcon     = isHealthy ? CheckCircle2 : AlertTriangle;
  const pillIconColor = isHealthy ? 'text-emerald-600' : 'text-amber-600';

  return (
    <div className="bg-surface-white rounded-[22px] p-6 border border-border-card shadow-card-clean flex flex-col justify-between">
      <div className="flex items-center justify-between pb-3 border-b border-border-card">
        <div>
          <h3 className="text-sm font-semibold text-text-main">
            Inventory Health Index
          </h3>
          <p className="text-[11px] text-text-muted">Storage viability and turnaround status</p>
        </div>

        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${pillStyle}`}>
          <PillIcon className={`w-3.5 h-3.5 ${pillIconColor}`} />
          <span>{healthStatus} ({healthScore}%)</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
        <div className="p-3 rounded-xl bg-workspace-bg border border-border-card/60">
          <span className="text-text-muted block text-[11px]">Available Storage</span>
          <span className="text-lg font-bold text-text-main mt-0.5 block">
            {available.toLocaleString()}
          </span>
          <span className="text-[10px] text-emerald-700 font-medium">Ready for issue</span>
        </div>

        <div className="p-3 rounded-xl bg-workspace-bg border border-border-card/60">
          <span className="text-text-muted block text-[11px]">Crossmatch Reserved</span>
          <span className="text-lg font-bold text-text-main mt-0.5 block">
            {reserved.toLocaleString()}
          </span>
          <span className="text-[10px] text-blue-700 font-medium">Locked for pending cases</span>
        </div>

        <div className="p-3 rounded-xl bg-workspace-bg border border-border-card/60">
          <span className="text-text-muted block text-[11px]">Issued / Dispatched</span>
          <span className="text-lg font-bold text-text-main mt-0.5 block">
            {issued.toLocaleString()}
          </span>
          <span className="text-[10px] text-text-muted font-medium">Historical total</span>
        </div>

        <div className={`p-3 rounded-xl border ${expired > 0 ? 'bg-[#FFF6F0] border-amber-200/60' : 'bg-workspace-bg border-border-card/60'}`}>
          <span className={`block text-[11px] ${expired > 0 ? 'text-amber-900' : 'text-text-muted'}`}>
            Expired Units
          </span>
          <span className={`text-lg font-bold mt-0.5 block ${expired > 0 ? 'text-amber-900' : 'text-text-main'}`}>
            {expired.toLocaleString()}
          </span>
          <span className={`text-[10px] font-medium ${expired > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
            {expired > 0 ? 'Pending disposal' : 'No expired units'}
          </span>
        </div>
      </div>
    </div>
  );
}
