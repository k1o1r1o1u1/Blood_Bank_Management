import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  PlusCircle,
  Search,
  User,
  Calendar,
  Droplet,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Check,
  RefreshCw,
  Package,
} from 'lucide-react';

import { donationService, donorService } from '../../services/api';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import {
  BLOOD_GROUP_COLORS,
  defaultGroupColor,
  formatShortDate,
} from '../../utils/inventoryHelpers';

export default function AddDonation() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedDonorId = searchParams.get('donor_id');

  // Donors list for selector
  const [donors, setDonors] = useState([]);
  const [loadingDonors, setLoadingDonors] = useState(true);
  const [donorLoadError, setDonorLoadError] = useState(null);

  // Selected Donor
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [donorSearchTerm, setDonorSearchTerm] = useState('');
  const [isSearchingDonor, setIsSearchingDonor] = useState(false);

  // Form Fields
  const [quantity, setQuantity] = useState(1);
  const [donationDate, setDonationDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [screeningStatus, setScreeningStatus] = useState('Pending');

  // Validation & Submission
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);

  // Load donors on mount
  const fetchDonors = async () => {
    setLoadingDonors(true);
    setDonorLoadError(null);
    try {
      const res = await donorService.getAll();
      const list = res.data || [];
      setDonors(list);

      // If URL had ?donor_id=..., auto-select that donor
      if (preselectedDonorId) {
        const found = list.find(
          (d) => Number(d.donor_id) === Number(preselectedDonorId)
        );
        if (found) {
          setSelectedDonor(found);
        }
      }
    } catch (err) {
      console.error('Failed to load donors for donation intake:', err);
      setDonorLoadError(err?.message || 'Unable to load donor directory.');
    } finally {
      setLoadingDonors(false);
    }
  };

  useEffect(() => {
    fetchDonors();
  }, [preselectedDonorId]);

  // Filter donors in the selector
  const filteredDonors = useMemo(() => {
    if (!donorSearchTerm.trim()) {
      return donors.slice(0, 8); // show initial batch
    }
    const q = donorSearchTerm.toLowerCase();
    return donors
      .filter(
        (d) =>
          d.name?.toLowerCase().includes(q) ||
          d.phone?.includes(q) ||
          d.blood_group?.toLowerCase().includes(q) ||
          String(d.donor_id).includes(q)
      )
      .slice(0, 10);
  }, [donors, donorSearchTerm]);

  // Validate form before submission
  const validate = () => {
    const newErrors = {};

    if (!selectedDonor) {
      newErrors.donor = 'Please select a registered donor.';
    }

    const qtyNum = parseInt(quantity, 10);
    if (isNaN(qtyNum) || qtyNum <= 0) {
      newErrors.quantity = 'Quantity must be at least 1 unit.';
    } else if (qtyNum > 5) {
      newErrors.quantity = 'Single intake session quantity cannot exceed 5 units.';
    }

    if (!donationDate) {
      newErrors.donationDate = 'Collection date is required.';
    } else {
      const today = new Date().toISOString().slice(0, 10);
      if (donationDate > today) {
        newErrors.donationDate = 'Donation date cannot be in the future.';
      }
    }

    if (!['Pending', 'Approved', 'Rejected'].includes(screeningStatus)) {
      newErrors.screeningStatus = 'Invalid screening status.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit to POST /api/donations
  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = {
        donor_id: Number(selectedDonor.donor_id),
        blood_group_id: Number(selectedDonor.blood_group_id),
        donation_date: donationDate,
        quantity: parseInt(quantity, 10),
        screening_status: screeningStatus,
      };

      await donationService.create(payload);

      // On success: redirect back to Donations directory
      navigate('/donations');
    } catch (err) {
      console.error('Failed to record donation:', err);
      setServerError(
        err?.message || 'Unable to record donation. Please verify your input.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const donorBgColor = selectedDonor
    ? BLOOD_GROUP_COLORS[selectedDonor.blood_group] ?? defaultGroupColor
    : defaultGroupColor;

  return (
    <div className="space-y-6 pb-16 max-w-3xl mx-auto">
      {/* 1. Header Navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/donations')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-text-muted hover:text-brand-blood transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Donations</span>
        </button>

        <span className="text-xs text-text-muted font-medium">
          Donation Intake Workflow
        </span>
      </div>

      <div className="bg-surface-white rounded-[22px] p-6 lg:p-7 border border-border-card shadow-card-clean space-y-6">
        {/* Banner Title */}
        <div className="flex items-center gap-3.5 pb-4 border-b border-border-card">
          <div className="w-10 h-10 rounded-xl bg-brand-blood-light text-brand-blood flex items-center justify-center shrink-0">
            <PlusCircle className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-main tracking-tight">
              Record New Donation
            </h1>
            <p className="text-xs sm:text-sm text-text-muted">
              Capture a blood collection session and initialize its screening workflow
            </p>
          </div>
        </div>

        {/* Server Error Alert */}
        {serverError && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-xs text-brand-blood">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Failed to record donation</p>
              <p className="mt-0.5">{serverError}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* ── STEP 1: SELECT DONOR ─────────────────────────────────── */}
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-workspace-bg border border-border-card text-[11px] font-bold text-text-main flex items-center justify-center">
                  1
                </span>
                <h2 className="text-sm font-bold text-text-main">
                  Select Donor <span className="text-brand-blood">*</span>
                </h2>
              </div>

              {selectedDonor && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDonor(null);
                    setIsSearchingDonor(true);
                  }}
                  className="text-xs font-semibold text-brand-blood hover:underline"
                >
                  Change Donor
                </button>
              )}
            </div>

            {/* If donor is selected, show verified donor card */}
            {selectedDonor ? (
              <div className="p-4 rounded-2xl bg-[#FFF8F9] border border-brand-blood/20 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar
                    name={selectedDonor.name}
                    size="md"
                    className="bg-sidebar-dark text-white ring-1 ring-border-card shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-text-main truncate">
                        {selectedDonor.name}
                      </span>
                      <span
                        className="px-2 py-0.5 rounded text-white font-bold text-[10px]"
                        style={{ backgroundColor: donorBgColor }}
                      >
                        {selectedDonor.blood_group}
                      </span>
                    </div>
                    <span className="text-[11px] text-text-muted block mt-0.5">
                      Donor #DON-{selectedDonor.donor_id} • Age {selectedDonor.age} •{' '}
                      {selectedDonor.phone}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold shrink-0">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Verified</span>
                </div>
              </div>
            ) : (
              /* Searchable Donor Selector */
              <div className="space-y-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={donorSearchTerm}
                    onChange={(e) => setDonorSearchTerm(e.target.value)}
                    placeholder="Search registered donors by name, phone, or blood group..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-workspace-bg border border-border-card text-xs sm:text-sm text-text-main placeholder-text-muted/60 focus:outline-none focus:border-brand-blood focus:ring-1 focus:ring-brand-blood transition-all"
                  />
                </div>

                {loadingDonors ? (
                  <div className="p-6 text-center text-xs text-text-muted animate-pulse">
                    Loading donors directory...
                  </div>
                ) : donorLoadError ? (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-brand-blood flex items-center justify-between">
                    <span>{donorLoadError}</span>
                    <button
                      type="button"
                      onClick={fetchDonors}
                      className="font-semibold underline"
                    >
                      Retry
                    </button>
                  </div>
                ) : donors.length === 0 ? (
                  <div className="p-6 text-center rounded-xl bg-workspace-bg border border-border-card space-y-2">
                    <p className="text-xs text-text-muted">
                      No donors found in the database.
                    </p>
                    <button
                      type="button"
                      onClick={() => navigate('/donors/add')}
                      className="text-xs font-semibold text-brand-blood hover:underline"
                    >
                      + Register New Donor First
                    </button>
                  </div>
                ) : (
                  <div className="max-h-52 overflow-y-auto divide-y divide-border-card/60 rounded-xl border border-border-card bg-workspace-bg/40">
                    {filteredDonors.map((d) => {
                      const color =
                        BLOOD_GROUP_COLORS[d.blood_group] ?? defaultGroupColor;
                      return (
                        <div
                          key={d.donor_id}
                          onClick={() => {
                            setSelectedDonor(d);
                            setErrors((prev) => ({ ...prev, donor: null }));
                          }}
                          className="p-3 flex items-center justify-between hover:bg-surface-white transition-colors cursor-pointer text-xs"
                        >
                          <div className="flex items-center gap-2.5">
                            <span
                              className="w-7 h-7 rounded-lg text-white font-bold flex items-center justify-center text-xs shrink-0"
                              style={{ backgroundColor: color }}
                            >
                              {d.blood_group}
                            </span>
                            <div>
                              <p className="font-semibold text-text-main">
                                {d.name}
                              </p>
                              <p className="text-[11px] text-text-muted">
                                #DON-{d.donor_id} • {d.phone}
                              </p>
                            </div>
                          </div>

                          <span className="px-2.5 py-1 rounded-lg border border-border-card bg-surface-white text-text-main hover:border-brand-blood font-semibold text-[11px]">
                            Select
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {errors.donor && (
                  <p className="text-[11px] font-medium text-brand-blood">
                    {errors.donor}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* ── STEP 2: COLLECTION DETAILS ────────────────────────────── */}
          <div className="space-y-4 pt-4 border-t border-border-card">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-workspace-bg border border-border-card text-[11px] font-bold text-text-main flex items-center justify-center">
                2
              </span>
              <h2 className="text-sm font-bold text-text-main">
                Donation Details
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Quantity */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-text-main">
                  Quantity (Units) <span className="text-brand-blood">*</span>
                </label>
                <div className="relative">
                  <Droplet className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="number"
                    min="1"
                    max="5"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-workspace-bg border border-border-card text-xs sm:text-sm text-text-main focus:outline-none focus:border-brand-blood focus:ring-1 focus:ring-brand-blood"
                  />
                </div>
                {errors.quantity ? (
                  <p className="text-[11px] font-medium text-brand-blood">
                    {errors.quantity}
                  </p>
                ) : (
                  <p className="text-[10px] text-text-muted">
                    Standard whole blood: 1 unit (~450 mL)
                  </p>
                )}
              </div>

              {/* Donation Date */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-text-main">
                  Collection Date <span className="text-brand-blood">*</span>
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="date"
                    required
                    max={new Date().toISOString().slice(0, 10)}
                    value={donationDate}
                    onChange={(e) => setDonationDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-workspace-bg border border-border-card text-xs sm:text-sm text-text-main focus:outline-none focus:border-brand-blood focus:ring-1 focus:ring-brand-blood"
                  />
                </div>
                {errors.donationDate && (
                  <p className="text-[11px] font-medium text-brand-blood">
                    {errors.donationDate}
                  </p>
                )}
              </div>

              {/* Blood Group (Read-only, derived from donor) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-text-main">
                  Blood Group (Inherited)
                </label>
                <div className="flex items-center h-[42px] px-3.5 rounded-xl bg-workspace-bg border border-border-card text-xs sm:text-sm">
                  {selectedDonor ? (
                    <div className="flex items-center gap-2">
                      <span
                        className="px-2 py-0.5 rounded text-white font-bold text-xs"
                        style={{ backgroundColor: donorBgColor }}
                      >
                        {selectedDonor.blood_group}
                      </span>
                      <span className="text-[11px] text-text-muted">
                        From donor profile
                      </span>
                    </div>
                  ) : (
                    <span className="text-text-muted text-xs">
                      Select donor above
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-text-muted">
                  Auto-locked to prevent typing mismatch
                </p>
              </div>
            </div>
          </div>

          {/* ── STEP 3: SCREENING STATUS ──────────────────────────────── */}
          <div className="space-y-3.5 pt-4 border-t border-border-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-workspace-bg border border-border-card text-[11px] font-bold text-text-main flex items-center justify-center">
                  3
                </span>
                <h2 className="text-sm font-bold text-text-main">
                  Initial Screening Status <span className="text-brand-blood">*</span>
                </h2>
              </div>

              <span className="text-[11px] text-text-muted">
                Status: <strong className="text-text-main">{screeningStatus}</strong>
              </span>
            </div>

            {/* Three backend-supported statuses */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  id: 'Pending',
                  title: 'Pending Lab Review',
                  desc: 'Collected, awaiting laboratory screening tests',
                  icon: Clock,
                  style: 'border-amber-200 text-amber-800 bg-amber-50/50',
                },
                {
                  id: 'Approved',
                  title: 'Approved / Cleared',
                  desc: 'Lab screening passed; immediately provisions storage units',
                  icon: CheckCircle2,
                  style: 'border-emerald-200 text-emerald-800 bg-emerald-50/50',
                },
                {
                  id: 'Rejected',
                  title: 'Screening Rejected',
                  desc: 'Did not meet lab screening standards; marked for disposal',
                  icon: XCircle,
                  style: 'border-rose-200 text-brand-blood bg-rose-50/50',
                },
              ].map((st) => {
                const Icon = st.icon;
                const isSelected = screeningStatus === st.id;
                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setScreeningStatus(st.id)}
                    className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between gap-2 ${
                      isSelected
                        ? 'border-brand-blood bg-[#FFF5F6] ring-2 ring-brand-blood/30 shadow-xs'
                        : 'border-border-card bg-workspace-bg hover:bg-surface-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-text-main" />
                        <span className="font-bold text-xs text-text-main">
                          {st.id}
                        </span>
                      </div>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-brand-blood" />
                      )}
                    </div>
                    <p className="text-[11px] text-text-muted leading-tight">
                      {st.desc}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Inventory Note */}
            {screeningStatus === 'Approved' && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2.5">
                <Package className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>
                  <strong>Downstream Effect:</strong> Selecting <em>Approved</em> will immediately generate {quantity} Available blood unit(s) in inventory with 42-day preservation limit.
                </span>
              </div>
            )}
          </div>

          {/* ── STEP 4: REVIEW & RECORD ───────────────────────────────── */}
          <div className="pt-4 border-t border-border-card space-y-4">
            {selectedDonor && (
              <div className="p-4 rounded-xl bg-workspace-bg border border-border-card/60 text-xs space-y-2">
                <span className="font-bold text-text-main uppercase tracking-wider block text-[11px]">
                  Intake Session Summary
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-text-muted text-[11px]">
                  <div>
                    <span>Donor:</span>{' '}
                    <strong className="text-text-main block">
                      {selectedDonor.name}
                    </strong>
                  </div>
                  <div>
                    <span>Blood Group:</span>{' '}
                    <strong className="text-brand-blood block">
                      {selectedDonor.blood_group}
                    </strong>
                  </div>
                  <div>
                    <span>Quantity:</span>{' '}
                    <strong className="text-text-main block">
                      {quantity} unit(s)
                    </strong>
                  </div>
                  <div>
                    <span>Date:</span>{' '}
                    <strong className="text-text-main block">
                      {formatShortDate(donationDate) || donationDate}
                    </strong>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Action Buttons */}
            <div className="flex items-center justify-end gap-3">
              <Button
                variant="secondary"
                size="md"
                type="button"
                onClick={() => navigate('/donations')}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                type="submit"
                loading={submitting}
                icon={PlusCircle}
                className="bg-brand-blood hover:bg-brand-blood-dark text-white shadow-active-nav px-6"
              >
                Record Donation
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
