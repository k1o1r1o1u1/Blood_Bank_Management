import React from 'react';
import { Clock, CheckCircle2, AlertCircle, CheckCheck } from 'lucide-react';

export const REQUEST_STATUS_CONFIG = {
  Pending: {
    label: 'Pending',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200/80',
    dotClass: 'bg-amber-500',
    icon: Clock,
  },
  Approved: {
    label: 'Approved',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
    dotClass: 'bg-emerald-500',
    icon: CheckCircle2,
  },
  Rejected: {
    label: 'Rejected',
    badgeClass: 'bg-rose-50 text-rose-800 border-rose-200/80',
    dotClass: 'bg-rose-500',
    icon: AlertCircle,
  },
  Completed: {
    label: 'Completed',
    badgeClass: 'bg-blue-50 text-blue-800 border-blue-200/80',
    dotClass: 'bg-blue-500',
    icon: CheckCheck,
  },
};

export default function RequestStatusBadge({ status, showIcon = true, className = '' }) {
  const config = REQUEST_STATUS_CONFIG[status] || {
    label: status || 'Unknown',
    badgeClass: 'bg-slate-50 text-slate-700 border-slate-200',
    dotClass: 'bg-slate-400',
    icon: Clock,
  };

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.badgeClass} ${className}`}
    >
      {showIcon && <Icon className="w-3.5 h-3.5" />}
      <span>{config.label}</span>
    </span>
  );
}
