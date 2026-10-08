import React from 'react';
import {
  PackageCheck,
  Building2,
  Calendar,
  User,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Droplet,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatShortDate, BLOOD_GROUP_COLORS, defaultGroupColor } from '../../utils/inventoryHelpers';

export default function IssueTable({
  issues = [],
  currentPage,
  pageSize,
  totalItems,
  onPageChange,
}) {
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;

  return (
    <div className="bg-surface-white rounded-2xl border border-border-card shadow-card-clean overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-workspace-bg border-b border-border-card text-text-muted font-bold uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-3 px-5">Issue ID</th>
              <th className="py-3 px-5">Blood Unit</th>
              <th className="py-3 px-5 text-center">Group</th>
              <th className="py-3 px-5">Hospital Partner</th>
              <th className="py-3 px-5">Blood Request</th>
              <th className="py-3 px-5">Collection &amp; Expiry</th>
              <th className="py-3 px-5">Issued Date</th>
              <th className="py-3 px-5 text-right">Staff Operator</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-card">
            {issues.map((item) => {
              const bgColors = BLOOD_GROUP_COLORS[item.blood_group] || defaultGroupColor;

              return (
                <tr
                  key={item.issue_id}
                  className="hover:bg-workspace-bg/50 transition-colors group"
                >
                  {/* Issue ID */}
                  <td className="py-3.5 px-5 font-mono font-bold text-text-main">
                    <span className="text-text-muted/70">#ISS-</span>
                    <span>{item.issue_id}</span>
                  </td>

                  {/* Blood Unit ID */}
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-brand-blood/10 border border-brand-blood/20 flex items-center justify-center text-brand-blood shrink-0">
                        <Droplet className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-mono font-bold text-brand-blood text-xs">
                        #UNIT-{item.unit_id}
                      </span>
                    </div>
                  </td>

                  {/* Blood Group */}
                  <td className="py-3.5 px-5 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-lg text-xs font-bold border ${bgColors.badge}`}
                    >
                      {item.blood_group}
                    </span>
                  </td>

                  {/* Hospital */}
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-text-muted shrink-0" />
                      <span className="font-semibold text-text-main truncate max-w-[180px] block">
                        {item.hospital_name}
                      </span>
                    </div>
                  </td>

                  {/* Request ID Link */}
                  <td className="py-3.5 px-5">
                    <Link
                      to={`/requests/${item.request_id}`}
                      className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-text-main hover:text-brand-blood transition-colors group-hover:underline"
                    >
                      #REQ-{item.request_id}
                      <ExternalLink className="w-3 h-3 text-text-muted" />
                    </Link>
                  </td>

                  {/* Collection & Expiry */}
                  <td className="py-3.5 px-5 text-text-muted whitespace-nowrap text-[11px]">
                    <div>Coll: {formatShortDate(item.collection_date)}</div>
                    <div className="text-text-muted/75">Exp: {formatShortDate(item.expiry_date)}</div>
                  </td>

                  {/* Issue Date */}
                  <td className="py-3.5 px-5 text-text-main whitespace-nowrap font-medium text-xs">
                    {formatShortDate(item.issue_date)}
                  </td>

                  {/* Staff Operator */}
                  <td className="py-3.5 px-5 text-right whitespace-nowrap">
                    {item.issued_by_name ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-medium">
                        <User className="w-3 h-3 text-text-muted" />
                        {item.issued_by_name}
                      </span>
                    ) : (
                      <span className="text-text-muted text-xs font-medium">System Operator</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden divide-y divide-border-card">
        {issues.map((item) => {
          const bgColors = BLOOD_GROUP_COLORS[item.blood_group] || defaultGroupColor;

          return (
            <div key={item.issue_id} className="p-4 space-y-3 bg-surface-white">
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-xs font-bold text-text-muted">
                    #ISS-{item.issue_id}
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-mono text-xs font-bold text-brand-blood">
                      #UNIT-{item.unit_id}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${bgColors.badge}`}>
                      {item.blood_group}
                    </span>
                  </div>
                </div>

                <Link
                  to={`/requests/${item.request_id}`}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-border-card text-xs font-semibold text-text-main"
                >
                  #REQ-{item.request_id}
                  <ExternalLink className="w-3 h-3 text-text-muted" />
                </Link>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-bold text-text-main">
                <Building2 className="w-3.5 h-3.5 text-brand-blood shrink-0" />
                <span>{item.hospital_name}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-workspace-bg border border-border-card/60 text-[11px] text-text-muted">
                <div>
                  <span className="block text-[10px] uppercase font-bold text-text-muted/75">Issue Date</span>
                  <span className="font-semibold text-text-main">{formatShortDate(item.issue_date)}</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-bold text-text-muted/75">Operator</span>
                  <span className="font-semibold text-text-main truncate block">
                    {item.issued_by_name || 'System Operator'}
                  </span>
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
            of <strong className="text-text-main">{totalItems}</strong> records
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
