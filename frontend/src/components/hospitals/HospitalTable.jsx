import React from 'react';
import {
  Building2,
  Phone,
  Mail,
  MapPin,
  ArrowRight,
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export default function HospitalTable({
  hospitals = [],
  onView,
  onEdit,
  onDelete,
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
              <th className="py-3 px-5">Hospital</th>
              <th className="py-3 px-5">Address</th>
              <th className="py-3 px-5">Contact</th>
              <th className="py-3 px-5 hidden lg:table-cell">Email</th>
              <th className="py-3 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-card">
            {hospitals.map((h) => (
              <HospitalRow
                key={h.hospital_id}
                hospital={h}
                onView={onView}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden divide-y divide-border-card">
        {hospitals.map((h) => (
          <HospitalMobileCard
            key={h.hospital_id}
            hospital={h}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-border-card bg-workspace-bg/40 flex items-center justify-between text-xs text-text-muted">
          <span>
            Showing <strong className="text-text-main">{startIndex + 1}</strong>–
            <strong className="text-text-main">{Math.min(startIndex + pageSize, totalItems)}</strong>{' '}
            of <strong className="text-text-main">{totalItems}</strong> hospitals
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => onPageChange(currentPage - 1)}
              className="px-2.5 py-1.5 rounded-lg border border-border-card bg-surface-white text-text-main disabled:opacity-40 disabled:cursor-not-allowed hover:bg-workspace-bg transition-colors text-xs font-medium"
            >
              ← Prev
            </button>
            <span className="px-3 font-semibold text-text-main">
              {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange(currentPage + 1)}
              className="px-2.5 py-1.5 rounded-lg border border-border-card bg-surface-white text-text-main disabled:opacity-40 disabled:cursor-not-allowed hover:bg-workspace-bg transition-colors text-xs font-medium"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function HospitalRow({ hospital: h, onView, onEdit, onDelete }) {
  return (
    <tr className="hover:bg-workspace-bg/60 transition-colors group">
      {/* Hospital */}
      <td className="py-3.5 px-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-blood/10 border border-brand-blood/20 flex items-center justify-center text-brand-blood flex-shrink-0">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-sm text-text-main">{h.name}</div>
            <div className="text-[11px] text-text-muted font-mono">#H-{h.hospital_id}</div>
          </div>
        </div>
      </td>

      {/* Address */}
      <td className="py-3.5 px-5 text-text-muted max-w-[200px]">
        <div className="flex items-start gap-1.5">
          <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-brand-blood/60" />
          <span className="leading-snug">{h.address || '—'}</span>
        </div>
      </td>

      {/* Contact */}
      <td className="py-3.5 px-5">
        <div className="flex items-center gap-1.5 text-text-main font-medium">
          <Phone className="w-3.5 h-3.5 text-brand-blood/60 flex-shrink-0" />
          <span>{h.contact}</span>
        </div>
      </td>

      {/* Email (hidden on md, visible lg+) */}
      <td className="py-3.5 px-5 hidden lg:table-cell text-text-muted">
        {h.email ? (
          <div className="flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-brand-blood/60 flex-shrink-0" />
            <a
              href={`mailto:${h.email}`}
              className="hover:text-brand-blood hover:underline transition-colors truncate max-w-[180px] block"
            >
              {h.email}
            </a>
          </div>
        ) : (
          <span className="text-text-muted/50">—</span>
        )}
      </td>

      {/* Actions */}
      <td className="py-3.5 px-5 text-right">
        <div className="flex items-center gap-1.5 justify-end">
          <button
            type="button"
            onClick={() => onView(h.hospital_id)}
            aria-label={`View ${h.name}`}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-workspace-bg border border-border-card text-text-main text-xs font-semibold hover:border-brand-blood/30 hover:bg-brand-blood/5 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View</span>
          </button>
          <OverflowMenu h={h} onEdit={onEdit} onDelete={onDelete} />
        </div>
      </td>
    </tr>
  );
}

function HospitalMobileCard({ hospital: h, onView, onEdit, onDelete }) {
  return (
    <div className="p-4 space-y-3">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-brand-blood/10 border border-brand-blood/20 flex items-center justify-center text-brand-blood flex-shrink-0 mt-0.5">
          <Building2 className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-sm text-text-main">{h.name}</div>
          <div className="text-[11px] text-text-muted font-mono">#H-{h.hospital_id}</div>
        </div>
      </div>

      <div className="bg-workspace-bg rounded-xl border border-border-card/60 p-3 space-y-2 text-xs">
        {h.address && (
          <div className="flex items-start gap-2">
            <MapPin className="w-3.5 h-3.5 text-brand-blood/60 flex-shrink-0 mt-0.5" />
            <span className="text-text-muted leading-relaxed">{h.address}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Phone className="w-3.5 h-3.5 text-brand-blood/60 flex-shrink-0" />
          <span className="text-text-main font-medium">{h.contact}</span>
        </div>
        {h.email && (
          <div className="flex items-center gap-2">
            <Mail className="w-3.5 h-3.5 text-brand-blood/60 flex-shrink-0" />
            <a href={`mailto:${h.email}`} className="text-brand-blood hover:underline truncate">
              {h.email}
            </a>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onView(h.hospital_id)}
          className="flex-1 py-2 rounded-lg bg-workspace-bg border border-border-card text-text-main text-xs font-semibold hover:border-brand-blood/30 hover:bg-brand-blood/5 transition-colors flex items-center justify-center gap-1"
        >
          <Eye className="w-3.5 h-3.5" />
          View Details
        </button>
        <button
          type="button"
          onClick={() => onEdit(h)}
          aria-label={`Edit ${h.name}`}
          className="p-2 rounded-lg border border-border-card text-text-muted hover:text-text-main hover:bg-workspace-bg transition-colors"
        >
          <Pencil className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => onDelete(h)}
          aria-label={`Delete ${h.name}`}
          className="p-2 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function OverflowMenu({ h, onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="More actions"
        aria-expanded={open}
        className="p-1.5 rounded-lg border border-border-card text-text-muted hover:text-text-main hover:bg-workspace-bg transition-colors"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-36 bg-surface-white rounded-xl border border-border-card shadow-lg z-20 py-1 overflow-hidden">
          <button
            type="button"
            onClick={() => { setOpen(false); onEdit(h); }}
            className="flex items-center gap-2 w-full px-3 py-2 text-xs font-medium text-text-main hover:bg-workspace-bg transition-colors"
          >
            <Pencil className="w-3.5 h-3.5 text-text-muted" />
            Edit Hospital
          </button>
          <div className="border-t border-border-card my-0.5" />
          <button
            type="button"
            onClick={() => { setOpen(false); onDelete(h); }}
            className="flex items-center gap-2 w-full px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
