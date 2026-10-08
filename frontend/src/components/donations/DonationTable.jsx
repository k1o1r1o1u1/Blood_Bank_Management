import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  User,
  Calendar,
  Droplet,
} from 'lucide-react';
import ScreeningBadge from './ScreeningBadge';
import {
  BLOOD_GROUP_COLORS,
  defaultGroupColor,
  formatShortDate,
} from '../../utils/inventoryHelpers';

const ITEMS_PER_PAGE = 10;

export default function DonationTable({
  donations = [],
  onSelectDonation,
}) {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);

  // Pagination
  const totalPages = Math.ceil(donations.length / ITEMS_PER_PAGE) || 1;
  const paginatedDonations = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return donations.slice(start, start + ITEMS_PER_PAGE);
  }, [donations, currentPage]);

  return (
    <div className="bg-surface-white rounded-[22px] border border-border-card shadow-card-clean overflow-hidden">
      {/* Desktop & Tablet Table (sm:block) */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-workspace-bg/80 border-b border-border-card text-[11px] font-semibold text-text-muted uppercase tracking-wider">
              <th className="py-3 px-6">Donation ID</th>
              <th className="py-3 px-4">Donor Name</th>
              <th className="py-3 px-4">Blood Group</th>
              <th className="py-3 px-4">Quantity</th>
              <th className="py-3 px-4">Collection Date</th>
              <th className="py-3 px-4">Screening Status</th>
              <th className="py-3 px-6 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-card/60 text-xs sm:text-sm">
            {paginatedDonations.map((d) => {
              const bgBadgeColor =
                BLOOD_GROUP_COLORS[d.blood_group] ?? defaultGroupColor;

              return (
                <tr
                  key={d.donation_id}
                  onClick={() => onSelectDonation(d)}
                  className="hover:bg-[#FFF8F9] transition-colors cursor-pointer group"
                >
                  {/* Donation ID */}
                  <td className="py-4 px-6 font-bold text-text-main group-hover:text-brand-blood transition-colors whitespace-nowrap">
                    #DON-{d.donation_id}
                  </td>

                  {/* Donor Name (clicking navigates to donor profile) */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-sidebar-dark text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                        {d.donor_name ? d.donor_name[0].toUpperCase() : 'D'}
                      </div>
                      <div className="min-w-0">
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/donors/${d.donor_id}`);
                          }}
                          className="font-bold text-text-main hover:text-brand-blood hover:underline block truncate"
                        >
                          {d.donor_name}
                        </span>
                        <span className="text-[10px] text-text-muted block">
                          Donor #{d.donor_id}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Blood Group */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    <span
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-white font-bold text-xs shadow-2xs"
                      style={{ backgroundColor: bgBadgeColor }}
                    >
                      {d.blood_group}
                    </span>
                  </td>

                  {/* Quantity */}
                  <td className="py-4 px-4 whitespace-nowrap font-medium text-text-main">
                    {d.quantity} unit{d.quantity !== 1 ? 's' : ''}
                  </td>

                  {/* Date */}
                  <td className="py-4 px-4 whitespace-nowrap text-text-muted">
                    {formatShortDate(d.donation_date) || d.donation_date}
                  </td>

                  {/* Screening */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    <ScreeningBadge status={d.screening_status} size="sm" />
                  </td>

                  {/* Action */}
                  <td className="py-4 px-6 text-right whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-blood group-hover:underline">
                      <span>Review</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card Layout (sm:hidden) */}
      <div className="sm:hidden divide-y divide-border-card/60">
        {paginatedDonations.map((d) => {
          const bgBadgeColor =
            BLOOD_GROUP_COLORS[d.blood_group] ?? defaultGroupColor;

          return (
            <div
              key={d.donation_id}
              onClick={() => onSelectDonation(d)}
              className="p-4 space-y-3 hover:bg-[#FFF8F9] transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="w-7 h-7 rounded-lg text-white font-bold text-xs flex items-center justify-center shadow-2xs"
                    style={{ backgroundColor: bgBadgeColor }}
                  >
                    {d.blood_group}
                  </span>
                  <span className="font-bold text-xs text-text-main">
                    #DON-{d.donation_id}
                  </span>
                </div>
                <ScreeningBadge status={d.screening_status} size="sm" />
              </div>

              <div className="flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-text-main">{d.donor_name}</p>
                  <p className="text-[11px] text-text-muted">
                    {d.quantity} unit{d.quantity !== 1 ? 's' : ''} •{' '}
                    {formatShortDate(d.donation_date) || d.donation_date}
                  </p>
                </div>

                <div className="w-8 h-8 rounded-xl bg-workspace-bg flex items-center justify-center text-text-muted">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination Footer */}
      {donations.length > 0 && (
        <div className="px-6 py-4 border-t border-border-card flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-text-muted bg-surface-white">
          <div>
            Showing{' '}
            <strong className="text-text-main">
              {(currentPage - 1) * ITEMS_PER_PAGE + 1}
            </strong>{' '}
            to{' '}
            <strong className="text-text-main">
              {Math.min(currentPage * ITEMS_PER_PAGE, donations.length)}
            </strong>{' '}
            of <strong className="text-text-main">{donations.length}</strong> donations
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-border-card hover:bg-workspace-bg disabled:opacity-40 disabled:cursor-not-allowed text-text-main transition-colors"
                aria-label="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
                    currentPage === page
                      ? 'bg-brand-blood text-white shadow-xs'
                      : 'border border-border-card hover:bg-workspace-bg text-text-main'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-border-card hover:bg-workspace-bg disabled:opacity-40 disabled:cursor-not-allowed text-text-main transition-colors"
                aria-label="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
