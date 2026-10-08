import React from 'react';
import { AlertCircle, ArrowRight, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatShortDate } from '../../utils/inventoryHelpers';

export default function CriticalRequests({ requests = [] }) {
  const navigate = useNavigate();

  return (
    <div className="bg-surface-white rounded-[22px] p-6 border border-border-card shadow-card-clean space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-border-card">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-brand-blood flex items-center justify-center text-white shrink-0 shadow-xs">
            <AlertCircle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-text-main">
              Critical Blood Requests
            </h3>
            <p className="text-[11px] text-text-muted">
              High-priority crossmatches awaiting dispatch
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate('/requests')}
          className="text-xs font-semibold text-brand-blood hover:underline flex items-center gap-1"
        >
          <span>All</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      <div className="space-y-3">
        {requests.length === 0 ? (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
            <p className="text-xs font-semibold text-emerald-700">✓ No critical requests pending</p>
            <p className="text-[11px] text-emerald-600 mt-0.5">All high-priority requests resolved</p>
          </div>
        ) : (
          requests.map((req) => (
            <div
              key={req.request_id}
              onClick={() => navigate(`/requests`)}
              className="p-3.5 rounded-xl border border-rose-200/80 bg-[#FFF7F8] hover:bg-[#FEEFF1] transition-all duration-150 cursor-pointer space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-text-main group-hover:text-brand-blood transition-colors truncate max-w-[140px]">
                  {req.hospital_name}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-brand-blood text-white font-bold text-[10px] tracking-wide shrink-0">
                  {req.urgency}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-text-muted">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-brand-blood text-sm">
                    {req.blood_group}
                  </span>
                  <span>• {req.quantity_required} unit{req.quantity_required !== 1 ? 's' : ''} required</span>
                </div>
                <div className="flex items-center gap-1 text-[11px]">
                  <Clock className="w-3 h-3" />
                  <span>{formatShortDate(req.request_date) || 'Pending'}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-rose-100 text-[11px]">
                <span className="text-text-muted truncate max-w-[130px]">
                  {req.hospital_contact || 'Blood Bank Desk'}
                </span>
                <span className="font-semibold text-brand-blood flex items-center gap-0.5 shrink-0">
                  Review →
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
