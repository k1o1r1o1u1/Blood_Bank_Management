import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  UserPlus,
  User,
  Phone,
  MapPin,
  Calendar,
  Droplet,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Info,
  RefreshCw,
} from 'lucide-react';

import { donorService, bloodGroupService } from '../../services/api';
import {
  BLOOD_GROUPS,
  BLOOD_COMPATIBILITY,
} from '../../utils/donorHelpers';
import {
  BLOOD_GROUP_COLORS,
  defaultGroupColor,
} from '../../utils/inventoryHelpers';
import Button from '../../components/ui/Button';

export default function AddDonor() {
  const navigate = useNavigate();

  const [bloodGroups, setBloodGroups] = useState([]);
  const [loadingBloodGroups, setLoadingBloodGroups] = useState(true);
  const [bloodGroupError, setBloodGroupError] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'Male',
    phone: '',
    address: '',
    blood_group_id: null,
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);

  // Load blood groups with explicit retry support
  const loadBloodGroups = async () => {
    setLoadingBloodGroups(true);
    setBloodGroupError(null);
    try {
      const res = await bloodGroupService.getAll();
      const groups = res.data || [];
      setBloodGroups(groups);
      if (groups.length > 0 && !formData.blood_group_id) {
        setFormData((prev) => ({ ...prev, blood_group_id: groups[0].blood_group_id }));
      }
    } catch (err) {
      console.error('Failed to load blood groups:', err);
      setBloodGroupError(err?.message || 'Unable to load blood groups');
    } finally {
      setLoadingBloodGroups(false);
    }
  };

  useEffect(() => {
    loadBloodGroups();
  }, []);

  // Selected blood group object
  const selectedGroup = bloodGroups.find(
    (bg) => bg.blood_group_id === formData.blood_group_id
  );
  const compatibility = selectedGroup
    ? BLOOD_COMPATIBILITY[selectedGroup.group_name]
    : null;

  // Validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required.';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters.';
    }

    if (!formData.age) {
      newErrors.age = 'Age is required.';
    } else {
      const ageNum = Number(formData.age);
      if (isNaN(ageNum) || ageNum < 18 || ageNum > 65) {
        newErrors.age = 'Donor age must be between 18 and 65 years.';
      }
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required.';
    } else {
      const cleanPhone = formData.phone.replace(/\D/g, '');
      if (cleanPhone.length < 10) {
        newErrors.phone = 'Please provide a valid 10-digit phone number.';
      }
    }

    if (!formData.blood_group_id) {
      newErrors.blood_group_id = 'Please select a blood group.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError(null);

    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        age: Number(formData.age),
        gender: formData.gender,
        phone: formData.phone.trim(),
        address: formData.address.trim() || null,
        blood_group_id: Number(formData.blood_group_id),
      };

      const res = await donorService.create(payload);
      const newDonorId = res.data?.donor_id;

      // Navigate to the newly created donor's profile
      if (newDonorId) {
        navigate(`/donors/${newDonorId}`);
      } else {
        navigate('/donors');
      }
    } catch (err) {
      console.error('Failed to create donor:', err);
      setServerError(
        err?.message || 'Could not register donor. Please verify the input values.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const ageNum = Number(formData.age);
  const isAgeValid = ageNum >= 18 && ageNum <= 65;

  return (
    <div className="space-y-6 pb-16 max-w-4xl mx-auto">
      {/* 1. Back Navigation & Header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/donors')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-text-muted hover:text-brand-blood transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Donors</span>
        </button>

        <span className="text-xs text-text-muted">
          New Donor Registration Form
        </span>
      </div>

      <div className="bg-surface-white rounded-[22px] p-6 lg:p-7 border border-border-card shadow-card-clean">
        <div className="flex items-center gap-3.5 pb-4 border-b border-border-card">
          <div className="w-10 h-10 rounded-xl bg-brand-blood-light text-brand-blood flex items-center justify-center shrink-0">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-main tracking-tight">
              Register New Donor
            </h1>
            <p className="text-xs sm:text-sm text-text-muted">
              Add verified donor profile, clinical qualification, and emergency contact details
            </p>
          </div>
        </div>

        {/* Server Error Alert */}
        {serverError && (
          <div className="mt-5 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-xs text-brand-blood">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Registration Failed</p>
              <p className="mt-0.5">{serverError}</p>
            </div>
          </div>
        )}

        {/* 2. MAIN FORM */}
        <form onSubmit={handleSubmit} className="space-y-8 mt-6">
          {/* SECTION 1: Personal & Demographic Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-workspace-bg border border-border-card text-[11px] font-bold text-text-main flex items-center justify-center">
                1
              </span>
              <h2 className="text-sm font-bold text-text-main">
                Personal &amp; Demographic Details
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Full Name */}
              <div className="md:col-span-6 space-y-1.5">
                <label className="block text-xs font-semibold text-text-main">
                  Full Name <span className="text-brand-blood">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Rahul Sharma"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-workspace-bg border text-xs sm:text-sm text-text-main placeholder-text-muted/60 focus:outline-none transition-all ${
                      errors.name
                        ? 'border-brand-blood focus:ring-1 focus:ring-brand-blood'
                        : 'border-border-card focus:border-brand-blood focus:ring-1 focus:ring-brand-blood'
                    }`}
                  />
                </div>
                {errors.name && (
                  <p className="text-[11px] font-medium text-brand-blood">{errors.name}</p>
                )}
              </div>

              {/* Age */}
              <div className="md:col-span-3 space-y-1.5">
                <label className="block text-xs font-semibold text-text-main">
                  Age (18–65) <span className="text-brand-blood">*</span>
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="number"
                    min="18"
                    max="65"
                    required
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    placeholder="25"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-workspace-bg border text-xs sm:text-sm text-text-main placeholder-text-muted/60 focus:outline-none transition-all ${
                      errors.age
                        ? 'border-brand-blood focus:ring-1 focus:ring-brand-blood'
                        : 'border-border-card focus:border-brand-blood focus:ring-1 focus:ring-brand-blood'
                    }`}
                  />
                </div>
                {errors.age && (
                  <p className="text-[11px] font-medium text-brand-blood">{errors.age}</p>
                )}
              </div>

              {/* Gender */}
              <div className="md:col-span-3 space-y-1.5">
                <label className="block text-xs font-semibold text-text-main">
                  Gender
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-workspace-bg border border-border-card text-xs sm:text-sm text-text-main focus:outline-none focus:border-brand-blood cursor-pointer"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Age Qualification Pill */}
            {formData.age && (
              <div className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs ${
                isAgeValid
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-brand-blood'
              }`}>
                {isAgeValid ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>
                  {isAgeValid
                    ? `Eligible: Age ${ageNum} satisfies WHO whole blood donation guidelines (18–65 years).`
                    : `Ineligible: Age must be between 18 and 65 years.`}
                </span>
              </div>
            )}
          </div>

          {/* SECTION 2: Contact Information */}
          <div className="space-y-4 pt-4 border-t border-border-card">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-workspace-bg border border-border-card text-[11px] font-bold text-text-main flex items-center justify-center">
                2
              </span>
              <h2 className="text-sm font-bold text-text-main">
                Contact &amp; Emergency Information
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Phone */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-text-main">
                  Phone Number <span className="text-brand-blood">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. 9876543210"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-workspace-bg border text-xs sm:text-sm text-text-main placeholder-text-muted/60 focus:outline-none transition-all ${
                      errors.phone
                        ? 'border-brand-blood focus:ring-1 focus:ring-brand-blood'
                        : 'border-border-card focus:border-brand-blood focus:ring-1 focus:ring-brand-blood'
                    }`}
                  />
                </div>
                {errors.phone ? (
                  <p className="text-[11px] font-medium text-brand-blood">{errors.phone}</p>
                ) : (
                  <p className="text-[11px] text-text-muted">Must be unique in database.</p>
                )}
              </div>

              {/* Address */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-text-main">
                  Residential Address
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="e.g. 124 Indiranagar, Bengaluru"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-workspace-bg border border-border-card text-xs sm:text-sm text-text-main placeholder-text-muted/60 focus:outline-none focus:border-brand-blood focus:ring-1 focus:ring-brand-blood transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: Blood Group Selection & Clinical Typing */}
          <div className="space-y-4 pt-4 border-t border-border-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-workspace-bg border border-border-card text-[11px] font-bold text-text-main flex items-center justify-center">
                  3
                </span>
                <h2 className="text-sm font-bold text-text-main">
                  Blood Group Classification <span className="text-brand-blood">*</span>
                </h2>
              </div>

              {selectedGroup && (
                <span className="text-xs font-semibold text-brand-blood">
                  Selected: {selectedGroup.group_name}
                </span>
              )}
            </div>

            {loadingBloodGroups ? (
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div
                    key={i}
                    className="h-16 rounded-xl bg-workspace-bg border border-border-card/60 animate-pulse flex flex-col items-center justify-center p-2 gap-1.5"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#EAE4DF]" />
                    <div className="w-10 h-2.5 rounded bg-[#EAE4DF]" />
                  </div>
                ))}
              </div>
            ) : bloodGroupError ? (
              <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 text-brand-blood">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span className="font-semibold">Unable to load blood groups</span>
                </div>
                <button
                  type="button"
                  onClick={loadBloodGroups}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-white border border-rose-200 text-xs font-semibold text-brand-blood hover:bg-rose-100 transition-colors shadow-2xs"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry</span>
                </button>
              </div>
            ) : bloodGroups.length === 0 ? (
              <div className="p-5 rounded-xl bg-workspace-bg border border-border-card text-center text-xs text-text-muted">
                No blood groups available
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2.5">
                {bloodGroups.map((bg) => {
                  const isSelected = formData.blood_group_id === bg.blood_group_id;
                  const groupColor = BLOOD_GROUP_COLORS[bg.group_name] ?? defaultGroupColor;

                  return (
                    <button
                      key={bg.blood_group_id}
                      type="button"
                      onClick={() => setFormData({ ...formData, blood_group_id: bg.blood_group_id })}
                      className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all text-center ${
                        isSelected
                          ? 'border-brand-blood bg-[#FFF5F6] ring-2 ring-brand-blood/30 shadow-xs'
                          : 'border-border-card bg-workspace-bg hover:bg-surface-white hover:border-gray-300'
                      }`}
                    >
                      <span
                        className="w-8 h-8 rounded-lg text-white font-bold text-xs flex items-center justify-center shadow-2xs"
                        style={{ backgroundColor: groupColor }}
                      >
                        {bg.group_name}
                      </span>
                      <span className={`text-[11px] font-semibold ${isSelected ? 'text-brand-blood' : 'text-text-muted'}`}>
                        {isSelected ? 'Selected' : 'Choose'}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Compatibility Preview Box */}
            {compatibility && selectedGroup && (
              <div className="p-4 rounded-xl bg-workspace-bg border border-border-card/60 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-text-main font-semibold">
                  <ShieldCheck className="w-4 h-4 text-brand-blood" />
                  <span>Clinical Typing Summary: Group {selectedGroup.group_name}</span>
                  {compatibility.universal && (
                    <span className="ml-auto px-2 py-0.5 rounded-full bg-brand-blood-light text-brand-blood font-bold text-[10px]">
                      {compatibility.universal}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-text-muted">
                  <p>
                    <strong>Can donate red cells to:</strong>{' '}
                    <span className="text-text-main">{compatibility.giveTo.join(', ')}</span>
                  </p>
                  <p>
                    <strong>Can receive red cells from:</strong>{' '}
                    <span className="text-text-main">{compatibility.receiveFrom.join(', ')}</span>
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-border-card">
            <Button
              variant="secondary"
              size="md"
              type="button"
              onClick={() => navigate('/donors')}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              type="submit"
              loading={submitting}
              icon={UserPlus}
              className="bg-brand-blood hover:bg-brand-blood-dark text-white shadow-active-nav px-6"
            >
              Register Donor
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
