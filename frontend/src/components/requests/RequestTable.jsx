import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Eye,
  CheckCircle2,
  XCircle,
  Building2,
  Phone,
  Calendar,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
} from 'lucide-react';
import RequestStatusBadge from './RequestStatusBadge';
import RequestUrgencyBadge from './RequestUrgencyBadge';
import { formatShortDate, BLOOD_GROUP_COLORS, defaultGroupColor } from '../../utils/inventoryHelpers';

export default function RequestTable({
  requests = [],
  currentPage,
  pageSize,
  totalItems,
  onPageChange,
  onStatusAction, // (request, targetStatus)
}) {
  const navigate = useNavigate();
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;

  return (
    <div className="bg-surface-white rounded-2xl border border-border-card shadow-card-clean overflow-hidden">
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-workspace-bg border-b border-border-card text-text-muted font-bold uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-3 px-5">Request</th>
              <th className="py-3 px-5">Hospital</th>
              <th className="py-3 px-5 text-center">Blood Group</th>
              <th className="py-3 px-5 text-center">Quantity</th>
              <th className="py-3 px-5">Urgency</th>
              <th className="py-3 px-5">Requested Date</th>
              <th className="py-3 px-5">Status</th>
              <th className="py-3 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-card">
            {requests.map((r) => {
              const bgColors = BLOOD_GROUP_COLORS[r.blood_group] || defaultGroupColor;
              const isPending = r.status === 'Pending';

              return (
                <tr
                  key={r.request_id}
                  className="hover:bg-workspace-bg/50 transition-colors group"
                >
                  {/* Request ID */}
                  <td className="py-3.5 px-5 font-mono font-bold text-text-main">
                    <span className="text-text-muted/70">#REQ-</span>
                    <span>{r.request_id}</span>
                  </td>

                  {/* Hospital */}
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-brand-blood/5 border border-brand-blood/10 flex items-center justify-center text-brand-blood shrink-0">
                        <Building2 className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0 max-w-[200px]">
                        <span className="font-semibold text-text-main truncate block">
                          {r.hospital_name}
                        </span>
                        {r.hospital_contact && (
                          <span className="text-[11px] text-text-muted flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {r.hospital_contact}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Blood Group */}
                  <td className="py-3.5 px-5 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-lg text-xs font-bold border ${bgColors.badge}`}
                    >
                      {r.blood_group}
                    </span>
                  </td>

                  {/* Quantity */}
                  <td className="py-3.5 px-5 text-center">
                    <span className="font-bold text-text-main text-sm">
                      {r.quantity_required}
                    </span>
                    <span className="text-text-muted text-[11px] ml-1">unit(s)</span>
                  </td>

                  {/* Urgency */}
                  <td className="py-3.5 px-5">
                    <RequestUrgencyBadge urgency={r.urgency} />
                  </td>

                  {/* Requested Date */}
                  <td className="py-3.5 px-5 text-text-muted whitespace-nowrap">
                    {formatShortDate(r.request_date)}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-5">
                    <RequestStatusBadge status={r.status} />
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-5 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1.5 justify-end">
                      {/* Workflow mutations for Pending status */}
                      {isPending && (
                        <>
                          <button
                            type="button"
                            onClick={() => onStatusAction(r, 'Approved')}
                            title="Approve request"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors text-[11px] font-semibold"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => onStatusAction(r, 'Rejected')}
                            title="Reject request"
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-colors text-[11px] font-semibold"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Reject
                          </button>
                        </>
                      )}

                      {/* View Details */}
                      <button
                        type="button"
                        onClick={() => navigate(`/requests/${r.request_id}`)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-border-card text-text-main hover:bg-surface-white hover:border-brand-blood/40 transition-colors text-[11px] font-semibold shadow-xs"
                      >
                        <Eye className="w-3.5 h-3.5 text-text-muted" />
                        View
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden divide-y divide-border-card">
        {requests.map((r) => {
          const bgColors = BLOOD_GROUP_COLORS[r.blood_group] || defaultGroupColor;
          const isPending = r.status === 'Pending';

          return (
            <div key={r.request_id} className="p-4 space-y-3 bg-surface-white">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-mono text-xs font-bold text-text-muted">
                    #REQ-{r.request_id}
                  </span>
                  <h4 className="text-sm font-bold text-text-main flex items-center gap-1.5 mt-0.5">
                    <Building2 className="w-3.5 h-3.5 text-brand-blood shrink-0" />
                    {r.hospital_name}
                  </h4>
                  {r.hospital_contact && (
                    <span className="text-[11px] text-text-muted flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3" />
                      {r.hospital_contact}
                    </span>
                  )}
                </div>
                <RequestStatusBadge status={r.status} />
              </div>

              <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-workspace-bg border border-border-card/60 text-center">
                <div>
                  <span className="text-[10px] text-text-muted uppercase font-bold block">Group</span>
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold mt-0.5 ${bgColors.badge}`}>
                    {r.blood_group}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-text-muted uppercase font-bold block">Quantity</span>
                  <span className="text-xs font-bold text-text-main mt-0.5 block">
                    {r.quantity_required} unit(s)
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-text-muted uppercase font-bold block">Urgency</span>
                  <div className="mt-0.5">
                    <RequestUrgencyBadge urgency={r.urgency} />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-text-muted pt-1">
                <span className="flex items-center gap-1 text-[11px]">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatShortDate(r.request_date)}
                </span>
                <div className="flex items-center gap-1.5">
                  {isPending && (
                    <>
                      <button
                        type="button"
                        onClick={() => onStatusAction(r, 'Approved')}
                        className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => onStatusAction(r, 'Rejected')}
                        className="px-2 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => navigate(`/requests/${r.request_id}`)}
                    className="px-2.5 py-1 rounded-lg border border-border-card text-text-main text-xs font-semibold"
                  >
                    View
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="px-5 py-3 border-t border-border-card bg-workspace-bg/40 flex items-center justify-between text-xs text-text-muted">
          <span>
            Showing <strong className="text-text-main">{startIndex + 1}</strong> to{' '}
            <strong className="text-text-main">
              {Math.min(startIndex + pageSize, totalItems)}
            </strong>{' '}
            of <strong className="text-text-main">{totalItems}</strong> requests
          </span>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => onPageChange(currentPage - 1)}
              className="p-1.5 rounded-lg border border-border-card bg-surface-white hover:bg-workspace-bg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-medium text-text-main">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange(currentPage + 1)}
              className="p-1.5 rounded-lg border border-border-card bg-surface-white hover:bg-workspace-bg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
