import React from 'react';
import { AlertTriangle, AlertCircle, Clock } from 'lucide-react';

export const REQUEST_URGENCY_CONFIG = {
  Critical: {
    label: 'Critical',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-300 font-bold',
    dotClass: 'bg-rose-600',
    icon: AlertCircle,
  },
  Urgent: {
    label: 'Urgent',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-300 font-semibold',
    dotClass: 'bg-amber-600',
    icon: AlertTriangle,
  },
  Normal: {
    label: 'Normal',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200 font-medium',
    dotClass: 'bg-slate-400',
    icon: Clock,
  },
};

export default function RequestUrgencyBadge({ urgency, showIcon = true, className = '' }) {
  const config = REQUEST_URGENCY_CONFIG[urgency] || {
    label: urgency || 'Normal',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
    dotClass: 'bg-slate-400',
    icon: Clock,
  };

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs border ${config.badgeClass} ${className}`}
    >
      {showIcon && <Icon className="w-3.5 h-3.5" />}
      <span>{config.label}</span>
    </span>
  );
}
