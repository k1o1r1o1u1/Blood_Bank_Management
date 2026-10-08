import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Users,
  Phone,
  MapPin,
  Calendar,
  Heart,
  Droplet,
  Clock,
  CheckCircle2,
  AlertCircle,
  Edit,
  Trash2,
  PlusCircle,
  RefreshCw,
  X,
  Save,
  Award,
  Activity,
  Shield,
  HelpCircle,
  Sparkles,
} from 'lucide-react';

import { donorService, donationService, bloodGroupService } from '../../services/api';
import {
  getDonorEligibility,
  BLOOD_COMPATIBILITY,
  BLOOD_GROUPS,
  formatPhoneNumber,
} from '../../utils/donorHelpers';
import {
  BLOOD_GROUP_COLORS,
  defaultGroupColor,
  formatShortDate,
} from '../../utils/inventoryHelpers';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';

const SCREENING_BADGE = {
  Approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Pending:  'bg-amber-50 text-amber-700 border-amber-200',
  Rejected: 'bg-rose-50 text-brand-blood border-rose-200',
};

export default function DonorDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [donor, setDonor] = useState(null);
  const [donations, setDonations] = useState([]);
  const [bloodGroups, setBloodGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Edit Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    age: '',
    gender: 'Male',
    phone: '',
    address: '',
    blood_group_id: 1,
  });
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState(null);

  // Delete State
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  // Fetch Donor & Donation History
  const loadDonorData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [donorRes, allDonationsRes, bgRes] = await Promise.all([
        donorService.getById(id),
        donationService.getAll(),
        bloodGroupService.getAll().catch(() => ({ data: [] })),
      ]);

      setDonor(donorRes.data);
      // Filter donations specific to this donor
      const donorDonations = (allDonationsRes.data || []).filter(
        (d) => Number(d.donor_id) === Number(id)
      );
      setDonations(donorDonations);
      setBloodGroups(bgRes.data || []);

      // Populate edit form initial values
      setEditForm({
        name: donorRes.data.name || '',
        age: donorRes.data.age || '',
        gender: donorRes.data.gender || 'Male',
        phone: donorRes.data.phone || '',
        address: donorRes.data.address || '',
        blood_group_id: donorRes.data.blood_group_id || 1,
      });
    } catch (err) {
      console.error('Failed to load donor details:', err);
      setError(err?.message || 'Could not retrieve donor details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDonorData();
  }, [id]);

  // Handle Edit Submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditSaving(true);
    setEditError(null);

    if (!editForm.name.trim() || !editForm.phone.trim() || !editForm.age) {
      setEditError('Name, age, and phone number are required.');
      setEditSaving(false);
      return;
    }

    if (Number(editForm.age) < 18 || Number(editForm.age) > 65) {
      setEditError('Donor age must be between 18 and 65.');
      setEditSaving(false);
      return;
    }

    try {
      await donorService.update(id, {
        name: editForm.name.trim(),
        age: Number(editForm.age),
        gender: editForm.gender,
        phone: editForm.phone.trim(),
        address: editForm.address.trim(),
        blood_group_id: Number(editForm.blood_group_id),
      });

      setIsEditOpen(false);
      await loadDonorData(); // refresh
    } catch (err) {
      setEditError(err?.message || 'Failed to update donor.');
    } finally {
      setEditSaving(false);
    }
  };

  // Handle Delete
  const handleDeleteDonor = async () => {
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      await donorService.delete(id);
      navigate('/donors');
    } catch (err) {
      setDeleteError(err?.message || 'Cannot delete donor (has associated records).');
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 pb-12 animate-pulse">
        <div className="h-8 w-40 bg-[#EFEBE4] rounded-lg" />
        <div className="h-44 bg-surface-white rounded-[22px] border border-border-card" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-surface-white rounded-[22px] border border-border-card" />
          <div className="h-64 bg-surface-white rounded-[22px] border border-border-card" />
        </div>
      </div>
    );
  }

  if (error || !donor) {
    return (
      <div className="p-12 text-center space-y-4 max-w-md mx-auto">
        <div className="w-14 h-14 rounded-full bg-rose-50 text-brand-blood flex items-center justify-center mx-auto border border-rose-200">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-text-main">Donor Record Not Found</h2>
        <p className="text-xs text-text-muted">{error || 'The requested donor does not exist.'}</p>
        <Button variant="secondary" size="md" onClick={() => navigate('/donors')}>
          ← Return to Donors
        </Button>
      </div>
    );
  }

  const elig = getDonorEligibility(donor);
  const bgBadgeColor = BLOOD_GROUP_COLORS[donor.blood_group] ?? defaultGroupColor;
  const compatibility = BLOOD_COMPATIBILITY[donor.blood_group] || { giveTo: [], receiveFrom: [] };

  // Donor Statistics
  const totalDonations = donations.length;
  const approvedDonations = donations.filter((d) => d.screening_status === 'Approved').length;
  const totalVolumeML = donations.reduce((sum, d) => sum + (d.quantity || 1) * 450, 0);
  const passRate = totalDonations > 0 ? `${Math.round((approvedDonations / totalDonations) * 100)}%` : '—';

  // Loyalty tier
  let loyaltyTier = 'First-Time Donor';
  if (totalDonations >= 5) loyaltyTier = 'Champion Donor 🎖️';
  else if (totalDonations >= 3) loyaltyTier = 'Gold Regular 🥇';
  else if (totalDonations >= 1) loyaltyTier = 'Silver Contributor 🥈';

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Back Navigation & Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/donors')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-text-muted hover:text-brand-blood transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Donors</span>
        </button>

        <span className="text-xs text-text-muted font-medium">
          Record ID: <strong className="text-text-main">#DON-{donor.donor_id}</strong>
        </span>
      </div>

      {/* 2. PROFILE HERO BANNER */}
      <div className="bg-surface-white rounded-[22px] p-6 lg:p-7 border border-border-card shadow-card-clean flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        {/* Subtle accent backdrop */}
        <div className="absolute right-0 top-0 bottom-0 w-1/4 bg-gradient-to-l from-brand-blood-light/50 to-transparent pointer-events-none" />

        <div className="flex items-center gap-5 z-10 min-w-0">
          <Avatar
            name={donor.name}
            size="lg"
            className="w-16 h-16 text-lg bg-[#1C1315] text-white ring-2 ring-border-card shrink-0 shadow-md"
          />
          <div className="space-y-1.5 min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl lg:text-3xl font-bold text-text-main tracking-tight truncate">
                {donor.name}
              </h1>
              <span
                className="px-2.5 py-0.5 rounded-lg text-white font-bold text-xs shadow-2xs"
                style={{ backgroundColor: bgBadgeColor }}
              >
                {donor.blood_group}
              </span>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold border ${elig.badgeClass}`}
              >
                {elig.status === 'Active' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                {elig.status === 'New Donor' && <Sparkles className="w-3.5 h-3.5 text-blue-600" />}
                {elig.status === 'Age Ineligible' && <AlertCircle className="w-3.5 h-3.5 text-brand-blood" />}
                <span>{elig.status}</span>
              </span>
            </div>

            <p className="text-xs sm:text-sm text-text-muted flex flex-wrap items-center gap-x-3 gap-y-1">
              <span>{donor.age} years old</span>
              <span>•</span>
              <span>{donor.gender || 'Gender unrecorded'}</span>
              <span>•</span>
              <span>
                Last donation:{' '}
                <strong className="text-text-main">
                  {donor.last_donation_date ? formatShortDate(donor.last_donation_date) : 'Never (New Donor)'}
                </strong>
              </span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 z-10 w-full sm:w-auto">
          <Button
            variant="secondary"
            size="md"
            icon={Edit}
            onClick={() => {
              setEditError(null);
              setIsEditOpen(true);
            }}
            className="hover:border-brand-blood/40 flex-1 sm:flex-none"
          >
            Edit Donor
          </Button>

          <Button
            variant="primary"
            size="md"
            icon={PlusCircle}
            onClick={() => navigate(`/donations/add?donor_id=${donor.donor_id}`)}
            className="bg-brand-blood hover:bg-brand-blood-dark text-white shadow-active-nav flex-1 sm:flex-none"
          >
            Record Donation
          </Button>

          <button
            type="button"
            onClick={() => setDeleteConfirmOpen(true)}
            className="p-2.5 rounded-xl border border-border-card text-text-muted hover:text-brand-blood hover:bg-rose-50 transition-colors"
            title="Delete Donor"
            aria-label="Delete Donor"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3. FOUR CORE SECTIONS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (lg:col-span-7): Contact Info + Eligibility */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section A: Contact Information */}
          <div className="bg-surface-white rounded-[22px] p-6 border border-border-card shadow-card-clean space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border-card">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-brand-blood-light flex items-center justify-center text-brand-blood shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-text-main">Contact &amp; Personal Info</h2>
                  <p className="text-[11px] text-text-muted">Primary verified phone and address details</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-workspace-bg border border-border-card/60 space-y-1">
                <span className="text-text-muted block text-[11px] font-medium">Mobile Phone</span>
                <a
                  href={`tel:${donor.phone}`}
                  className="text-sm font-bold text-brand-blood hover:underline block"
                >
                  {formatPhoneNumber(donor.phone)}
                </a>
                <span className="text-[10px] text-text-muted">Primary emergency contact</span>
              </div>

              <div className="p-3.5 rounded-xl bg-workspace-bg border border-border-card/60 space-y-1">
                <span className="text-text-muted block text-[11px] font-medium">Age &amp; Gender</span>
                <span className="text-sm font-bold text-text-main block">
                  {donor.age} Years • {donor.gender || 'Unspecified'}
                </span>
                <span className="text-[10px] text-text-muted">Eligible age limit: 18–65</span>
              </div>

              <div className="p-3.5 rounded-xl bg-workspace-bg border border-border-card/60 space-y-1 sm:col-span-2">
                <span className="text-text-muted block text-[11px] font-medium">Residential Address</span>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-text-muted shrink-0 mt-0.5" />
                  <span className="text-xs font-semibold text-text-main">
                    {donor.address || 'No residential address recorded.'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section B: Clinical Eligibility & Compatibility */}
          <div className="bg-surface-white rounded-[22px] p-6 border border-border-card shadow-card-clean space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border-card">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-text-main">Donor Status &amp; Compatibility</h2>
                  <p className="text-[11px] text-text-muted">Verified database registration &amp; blood typing</p>
                </div>
              </div>

              <span className={`px-2.5 py-0.5 rounded-md text-xs font-semibold border ${elig.badgeClass}`}>
                {elig.status}
              </span>
            </div>

            {/* Status Message */}
            <div className={`p-4 rounded-xl border flex items-start gap-3 ${
              elig.status === 'Active'
                ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                : elig.status === 'New Donor'
                ? 'bg-blue-50/60 border-blue-200 text-blue-900'
                : 'bg-rose-50 border-rose-200 text-brand-blood'
            }`}>
              {elig.status === 'Active' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : elig.status === 'New Donor' ? (
                <Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-brand-blood shrink-0 mt-0.5" />
              )}
              <div className="space-y-0.5 text-xs">
                <p className="font-bold">{elig.reason}</p>
                <p className="text-[11px] opacity-80">
                  {elig.status === 'Active'
                    ? 'Clinical intake screening (hemoglobin, vitals) is conducted per donation session by lab staff.'
                    : elig.status === 'New Donor'
                    ? 'First-time donor registered in database. Initial health screening will be conducted during intake.'
                    : 'Backend constraint: Donor registration requires age between 18 and 65 years.'}
                </p>
              </div>
            </div>

            {/* Blood Transfusion Compatibility */}
            <div className="p-4 rounded-xl bg-workspace-bg border border-border-card/60 space-y-3 text-xs">
              <span className="font-semibold text-text-main block">
                Transfusion Compatibility Profile ({donor.blood_group})
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <span className="text-[11px] text-text-muted font-medium block">Can Donate Red Cells To:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {compatibility.giveTo.map((grp) => (
                      <span
                        key={grp}
                        className="px-2 py-0.5 rounded bg-surface-white border border-border-card text-brand-blood font-bold text-xs"
                      >
                        {grp}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] text-text-muted font-medium block">Can Receive Red Cells From:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {compatibility.receiveFrom.map((grp) => (
                      <span
                        key={grp}
                        className="px-2 py-0.5 rounded bg-surface-white border border-border-card text-emerald-700 font-bold text-xs"
                      >
                        {grp}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (lg:col-span-5): Donation Statistics */}
        <div className="lg:col-span-5 space-y-6">
          {/* Section C: Donation Statistics */}
          <div className="bg-surface-white rounded-[22px] p-6 border border-border-card shadow-card-clean space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border-card">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-brand-blood-light flex items-center justify-center text-brand-blood shrink-0">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-text-main">Donation Statistics</h2>
                  <p className="text-[11px] text-text-muted">Lifetime blood collection contribution</p>
                </div>
              </div>

              <span className="px-2 py-0.5 rounded-full bg-workspace-bg border border-border-card text-[11px] font-semibold text-text-main">
                {totalDonations > 0 ? `${totalDonations} Collections Recorded` : 'No Intakes Yet'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-workspace-bg border border-border-card/60">
                <span className="text-text-muted block text-[11px]">Lifetime Donations</span>
                <span className="text-2xl font-bold text-text-main mt-0.5 block">
                  {totalDonations}
                </span>
                <span className="text-[10px] text-text-muted">Logged records</span>
              </div>

              <div className="p-3.5 rounded-xl bg-workspace-bg border border-border-card/60">
                <span className="text-text-muted block text-[11px]">Volume Donated</span>
                <span className="text-2xl font-bold text-brand-blood mt-0.5 block">
                  {totalVolumeML} <span className="text-xs font-normal">mL</span>
                </span>
                <span className="text-[10px] text-text-muted">Whole blood</span>
              </div>

              <div className="p-3.5 rounded-xl bg-workspace-bg border border-border-card/60">
                <span className="text-text-muted block text-[11px]">Approved Units</span>
                <span className="text-2xl font-bold text-emerald-700 mt-0.5 block">
                  {approvedDonations}
                </span>
                <span className="text-[10px] text-emerald-700 font-medium">Passed screening</span>
              </div>

              <div className="p-3.5 rounded-xl bg-workspace-bg border border-border-card/60">
                <span className="text-text-muted block text-[11px]">Screening Success</span>
                <span className="text-2xl font-bold text-text-main mt-0.5 block">
                  {passRate}
                </span>
                <span className="text-[10px] text-text-muted">Lab qualification</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. DONATION HISTORY TABLE */}
      <div className="bg-surface-white rounded-[22px] border border-border-card shadow-card-clean overflow-hidden">
        <div className="px-6 py-4 border-b border-border-card flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-text-main">Donation History</h2>
            <p className="text-xs text-text-muted">
              Chronological log of collections and laboratory screening results for this donor
            </p>
          </div>

          <Button
            variant="secondary"
            size="sm"
            icon={PlusCircle}
            onClick={() => navigate(`/donations/add?donor_id=${donor.donor_id}`)}
            className="text-xs hover:border-brand-blood/40"
          >
            Record Intake
          </Button>
        </div>

        {donations.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Droplet className="w-10 h-10 text-text-muted/40 mx-auto" />
            <h3 className="text-sm font-bold text-text-main">No donation records yet</h3>
            <p className="text-xs text-text-muted max-w-sm mx-auto">
              This donor has not completed any logged blood donation sessions. Click below to record their first intake.
            </p>
            <Button
              variant="primary"
              size="sm"
              icon={PlusCircle}
              onClick={() => navigate(`/donations/add?donor_id=${donor.donor_id}`)}
              className="bg-brand-blood hover:bg-brand-blood-dark text-white shadow-active-nav mt-1"
            >
              Record First Donation
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-workspace-bg/80 border-b border-border-card text-[11px] font-semibold text-text-muted uppercase tracking-wider">
                  <th className="py-3 px-6">Batch ID</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Blood Group</th>
                  <th className="py-3 px-4">Volume / Quantity</th>
                  <th className="py-3 px-6 text-right">Lab Screening</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-card/60 text-xs sm:text-sm">
                {donations.map((d) => (
                  <tr key={d.donation_id} className="hover:bg-workspace-bg/50 transition-colors">
                    <td className="py-3.5 px-6 font-semibold text-text-main">
                      #DON-{d.donation_id}
                    </td>
                    <td className="py-3.5 px-4 text-text-muted">
                      {formatShortDate(d.donation_date)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-white font-bold text-xs"
                        style={{ backgroundColor: bgBadgeColor }}
                      >
                        {d.blood_group}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-text-main">
                      {d.quantity} unit ({d.quantity * 450} mL)
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-semibold border ${
                          SCREENING_BADGE[d.screening_status] ?? SCREENING_BADGE.Pending
                        }`}
                      >
                        {d.screening_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. EDIT DONOR MODAL */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-surface-white rounded-[24px] max-w-lg w-full p-6 sm:p-7 border border-border-card shadow-2xl space-y-5 animate-in fade-in-50 zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-border-card">
              <div>
                <h3 className="text-lg font-bold text-text-main">Edit Donor Profile</h3>
                <p className="text-xs text-text-muted">Update contact and clinical details for #DON-{donor.donor_id}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditOpen(false)}
                className="p-1.5 rounded-lg text-text-muted hover:text-text-main hover:bg-workspace-bg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {editError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-brand-blood font-semibold">
                {editError}
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-main mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-workspace-bg border border-border-card text-sm text-text-main focus:outline-none focus:border-brand-blood focus:ring-1 focus:ring-brand-blood"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-text-main mb-1.5">
                    Age (18–65) *
                  </label>
                  <input
                    type="number"
                    min="18"
                    max="65"
                    required
                    value={editForm.age}
                    onChange={(e) => setEditForm({ ...editForm, age: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-workspace-bg border border-border-card text-sm text-text-main focus:outline-none focus:border-brand-blood focus:ring-1 focus:ring-brand-blood"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-main mb-1.5">
                    Gender
                  </label>
                  <select
                    value={editForm.gender}
                    onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-workspace-bg border border-border-card text-sm text-text-main focus:outline-none focus:border-brand-blood"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-text-main mb-1.5">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-workspace-bg border border-border-card text-sm text-text-main focus:outline-none focus:border-brand-blood focus:ring-1 focus:ring-brand-blood"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-main mb-1.5">
                    Blood Group *
                  </label>
                  <select
                    value={editForm.blood_group_id}
                    onChange={(e) => setEditForm({ ...editForm, blood_group_id: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-workspace-bg border border-border-card text-sm text-text-main focus:outline-none focus:border-brand-blood"
                  >
                    {bloodGroups.map((bg) => (
                      <option key={bg.blood_group_id} value={bg.blood_group_id}>
                        {bg.group_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-main mb-1.5">
                  Residential Address
                </label>
                <input
                  type="text"
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  placeholder="Street, City, Postal Code"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-workspace-bg border border-border-card text-sm text-text-main focus:outline-none focus:border-brand-blood focus:ring-1 focus:ring-brand-blood"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-card">
                <Button
                  variant="secondary"
                  size="md"
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  type="submit"
                  loading={editSaving}
                  icon={Save}
                  className="bg-brand-blood hover:bg-brand-blood-dark text-white shadow-active-nav"
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. DELETE CONFIRMATION DIALOG */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-surface-white rounded-[24px] max-w-md w-full p-6 border border-border-card shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-brand-blood flex items-center justify-center border border-rose-200">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-text-main">Delete Donor Record?</h3>
              <p className="text-xs text-text-muted mt-1">
                Are you sure you want to remove <strong>{donor.name}</strong> (#DON-{donor.donor_id})? If this donor has existing donation records, MySQL integrity constraints will prevent deletion.
              </p>
            </div>

            {deleteError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-brand-blood font-semibold">
                {deleteError}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-3">
              <Button
                variant="secondary"
                size="md"
                onClick={() => setDeleteConfirmOpen(false)}
                disabled={deleteLoading}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="md"
                onClick={handleDeleteDonor}
                loading={deleteLoading}
                className="bg-brand-blood hover:bg-brand-blood-dark text-white shadow-active-nav"
              >
                Confirm Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
