import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Droplet,
  User,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  Save,
  Package,
} from 'lucide-react';
import ScreeningBadge from './ScreeningBadge';
import Button from '../ui/Button';
import { donationService } from '../../services/api';
import {
  BLOOD_GROUP_COLORS,
  defaultGroupColor,
  formatShortDate,
} from '../../utils/inventoryHelpers';

export default function DonationDetailModal({
  donation,
  isOpen,
  onClose,
  onStatusUpdated,
}) {
  const navigate = useNavigate();

  const [selectedStatus, setSelectedStatus] = useState(
    donation?.screening_status || 'Pending'
  );
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [confirmPrompt, setConfirmPrompt] = useState(false);

  if (!isOpen || !donation) return null;

  const bgBadgeColor =
    BLOOD_GROUP_COLORS[donation.blood_group] ?? defaultGroupColor;

  const handleApplyScreening = async () => {
    if (selectedStatus === donation.screening_status) {
      setConfirmPrompt(false);
      return;
    }

    setUpdating(true);
    setError(null);
    setSuccessMsg(null);

    try {
      await donationService.updateScreening(donation.donation_id, {
        screening_status: selectedStatus,
      });

      setSuccessMsg(`Screening status updated to "${selectedStatus}".`);
      setConfirmPrompt(false);
      if (onStatusUpdated) {
        onStatusUpdated(donation.donation_id, selectedStatus);
      }
    } catch (err) {
      console.error('Failed to update screening status:', err);
      setError(err?.message || 'Unable to update screening status.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in-50 duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget && !updating) onClose();
      }}
    >
      <div className="bg-surface-white rounded-[24px] max-w-lg w-full p-6 sm:p-7 border border-border-card shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border-card">
          <div className="flex items-center gap-3">
            <span
              className="w-10 h-10 rounded-xl text-white font-bold flex items-center justify-center text-sm shadow-2xs shrink-0"
              style={{ backgroundColor: bgBadgeColor }}
            >
              {donation.blood_group}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-text-main">
                  Donation #{donation.donation_id}
                </h3>
                <ScreeningBadge status={donation.screening_status} size="sm" />
              </div>
              <p className="text-xs text-text-muted mt-0.5">
                Collection session record details
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={updating}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-main hover:bg-workspace-bg transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback messages */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-brand-blood font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Donation Details Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          {/* Donor */}
          <div className="p-3.5 rounded-xl bg-workspace-bg border border-border-card/60 col-span-2 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-surface-white border border-border-card flex items-center justify-center text-text-main">
                <User className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider block">
                  Donor
                </span>
                <span className="font-bold text-text-main text-sm">
                  {donation.donor_name}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                onClose();
                navigate(`/donors/${donation.donor_id}`);
              }}
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand-blood hover:underline"
            >
              <span>Donor Profile</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Collection Date */}
          <div className="p-3.5 rounded-xl bg-workspace-bg border border-border-card/60 space-y-1">
            <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider block">
              Collection Date
            </span>
            <div className="flex items-center gap-1.5 font-bold text-text-main text-sm">
              <Calendar className="w-3.5 h-3.5 text-text-muted" />
              <span>{formatShortDate(donation.donation_date) || '—'}</span>
            </div>
            <span className="text-[10px] text-text-muted block">
              {donation.donation_date}
            </span>
          </div>

          {/* Quantity */}
          <div className="p-3.5 rounded-xl bg-workspace-bg border border-border-card/60 space-y-1">
            <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider block">
              Quantity / Volume
            </span>
            <div className="flex items-center gap-1.5 font-bold text-text-main text-sm">
              <Droplet className="w-3.5 h-3.5 text-brand-blood" />
              <span>
                {donation.quantity} unit{donation.quantity !== 1 ? 's' : ''}
              </span>
            </div>
            <span className="text-[10px] text-text-muted block">
              Approx. {(donation.quantity || 1) * 450} mL whole blood
            </span>
          </div>
        </div>

        {/* Downstream Inventory Note */}
        <div className="p-3 rounded-xl bg-workspace-bg/80 border border-border-card flex items-start gap-2.5 text-xs text-text-muted">
          <Package className="w-4 h-4 text-text-muted shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-text-main font-semibold">Inventory Effect:</strong> Marking a collection as <strong>Approved</strong> automatically provisions available blood storage units with a 42-day preservation expiry.
          </p>
        </div>

        {/* Screening Update Workflow */}
        <div className="space-y-3 pt-3 border-t border-border-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-main uppercase tracking-wider">
              Update Screening Status
            </span>
            <span className="text-[11px] text-text-muted">
              Current: <strong>{donation.screening_status}</strong>
            </span>
          </div>

          {/* Three backend-supported statuses */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'Pending', label: 'Pending', icon: Clock, color: 'text-amber-700 border-amber-200 hover:bg-amber-50' },
              { id: 'Approved', label: 'Approved', icon: CheckCircle2, color: 'text-emerald-700 border-emerald-200 hover:bg-emerald-50' },
              { id: 'Rejected', label: 'Rejected', icon: XCircle, color: 'text-brand-blood border-rose-200 hover:bg-rose-50' },
            ].map((st) => {
              const Icon = st.icon;
              const isSelected = selectedStatus === st.id;
              return (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => {
                    setSelectedStatus(st.id);
                    setConfirmPrompt(st.id !== donation.screening_status);
                  }}
                  disabled={updating}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    isSelected
                      ? 'border-brand-blood bg-[#FFF5F6] text-brand-blood ring-1 ring-brand-blood/40 shadow-xs'
                      : `bg-workspace-bg text-text-main border-border-card ${st.color}`
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{st.label}</span>
                </button>
              );
            })}
          </div>

          {/* Confirmation Prompt when status changed */}
          {confirmPrompt && selectedStatus !== donation.screening_status && (
            <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs space-y-2">
              <p className="text-amber-900 font-semibold">
                Change screening status from{' '}
                <strong className="underline">{donation.screening_status}</strong> to{' '}
                <strong className="underline">{selectedStatus}</strong>?
              </p>
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedStatus(donation.screening_status);
                    setConfirmPrompt(false);
                  }}
                  disabled={updating}
                  className="px-2.5 py-1 text-xs font-semibold text-text-muted hover:text-text-main"
                >
                  Cancel
                </button>
                <Button
                  variant="primary"
                  size="sm"
                  loading={updating}
                  onClick={handleApplyScreening}
                  className="bg-brand-blood hover:bg-brand-blood-dark text-white text-xs shadow-active-nav"
                >
                  Confirm Change
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end pt-3 border-t border-border-card">
          <Button
            variant="secondary"
            size="md"
            onClick={onClose}
            disabled={updating}
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
