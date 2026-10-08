import React from 'react';
import { Building2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function HospitalDemand({ demandProfile = [], criticalRequests = [] }) {
  const navigate = useNavigate();

  return (
    <div className="bg-surface-white rounded-[22px] p-6 border border-border-card shadow-card-clean flex flex-col">
      <div className="flex items-center justify-between pb-3 border-b border-border-card">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-brand-blood-light flex items-center justify-center text-brand-blood shrink-0">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text-main">
              Hospital Demand Profile
            </h3>
            <p className="text-[11px] text-text-muted">
              Top requested blood groups from pending hospital requests
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

      <div className="space-y-3 mt-4 flex-1">
        {demandProfile.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 gap-2 text-center">
            <p className="text-sm font-medium text-text-muted">No pending requests</p>
            <p className="text-[11px] text-text-muted opacity-70">Hospital demand is clear</p>
          </div>
        ) : (
          demandProfile.map((item) => (
            <div key={item.group} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-text-main">{item.group}</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-text-main">
                    {item.count} request{item.count !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              <div className="h-2 w-full bg-[#F4EFEA] rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-blood rounded-full transition-all duration-500"
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary footer */}
      {criticalRequests.length > 0 && (
        <div className="mt-4 pt-3 border-t border-border-card flex items-center justify-between text-[11px]">
          <span className="text-text-muted">Critical urgency</span>
          <span className="font-bold text-brand-blood">{criticalRequests.length} request{criticalRequests.length !== 1 ? 's' : ''}</span>
        </div>
      )}
    </div>
  );
}
