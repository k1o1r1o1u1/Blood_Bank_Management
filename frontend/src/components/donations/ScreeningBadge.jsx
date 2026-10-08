import React from 'react';
import { CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react';

const BADGE_CONFIG = {
  Approved: {
    container: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    icon: CheckCircle2,
    iconColor: 'text-emerald-600',
    label: 'Approved',
  },
  Pending: {
    container: 'bg-amber-50 text-amber-800 border-amber-200',
    icon: Clock,
    iconColor: 'text-amber-600',
    label: 'Pending',
  },
  Rejected: {
    container: 'bg-rose-50 text-brand-blood border-rose-200',
    icon: XCircle,
    iconColor: 'text-brand-blood',
    label: 'Rejected',
  },
};

export default function ScreeningBadge({ status, size = 'sm', className = '' }) {
  const config = BADGE_CONFIG[status] || {
    container: 'bg-zinc-100 text-zinc-700 border-zinc-200',
    icon: AlertCircle,
    iconColor: 'text-zinc-500',
    label: status || 'Unknown',
  };

  const Icon = config.icon;
  const isSm = size === 'sm';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold border rounded-lg select-none ${
        isSm ? 'px-2.5 py-0.5 text-[11px]' : 'px-3 py-1 text-xs'
      } ${config.container} ${className}`}
    >
      <Icon className={`${isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} ${config.iconColor} shrink-0`} />
      <span>{config.label}</span>
    </span>
  );
}
