import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  GitPullRequest,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import { requestService, hospitalService, bloodGroupService } from '../../services/api';
import { BLOOD_GROUP_COLORS, defaultGroupColor } from '../../utils/inventoryHelpers';

export default function AddRequest() {
  const navigate = useNavigate();

  // Reference lists from backend
  const [hospitals, setHospitals] = useState([]);
  const [bloodGroups, setBloodGroups] = useState([]);
  const [loadingLookups, setLoadingLookups] = useState(true);
  const [lookupError, setLookupError] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    hospital_id: '',
    blood_group_id: '',
    quantity_required: '1',
    urgency: 'Normal',
    request_date: new Date().toISOString().slice(0, 10),
  });

  // Submission state
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Fetch hospitals and blood-groups on mount
  const loadLookups = async () => {
    setLoadingLookups(true);
    setLookupError(null);
    try {
      const [hospRes, bgRes] = await Promise.all([
        hospitalService.getAll(),
        bloodGroupService.getAll(),
      ]);
      setHospitals(hospRes.data || []);
      setBloodGroups(bgRes.data || []);
    } catch (err) {
      setLookupError('Failed to load hospitals or blood groups. Please check backend connection.');
    } finally {
      setLoadingLookups(false);
    }
  };

  useEffect(() => {
    loadLookups();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: null }));
    }
    if (apiError) setApiError(null);
  };

  const validate = () => {
    const errors = {};
    if (!formData.hospital_id) {
      errors.hospital_id = 'Hospital selection is required';
    }
    if (!formData.blood_group_id) {
      errors.blood_group_id = 'Blood group selection is required';
    }
    const qty = parseInt(formData.quantity_required, 10);
    if (!formData.quantity_required || isNaN(qty) || qty <= 0) {
      errors.quantity_required = 'Quantity must be a positive integer';
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setSubmitting(true);
    setApiError(null);
    setSuccessMessage(null);

    try {
      const payload = {
        hospital_id: parseInt(formData.hospital_id, 10),
        blood_group_id: parseInt(formData.blood_group_id, 10),
        quantity_required: parseInt(formData.quantity_required, 10),
        urgency: formData.urgency || 'Normal',
        request_date: formData.request_date || new Date().toISOString().slice(0, 10),
      };

      const res = await requestService.create(payload);
      setSuccessMessage('Blood request registered successfully in Pending review status.');

      setTimeout(() => {
        if (res.data?.request_id) {
          navigate(`/requests/${res.data.request_id}`);
        } else {
          navigate('/requests');
        }
      }, 1200);
    } catch (err) {
      const msg = typeof err === 'string' ? err : err?.message || 'Failed to submit blood request.';
      setApiError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      {/* Back button */}
      <button
        type="button"
        onClick={() => navigate('/requests')}
        className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text-main transition-colors font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Blood Requests
      </button>

      {/* Page Title */}
      <div>
        <h1 className="text-page-title">New Blood Request</h1>
        <p className="text-page-subtitle">
          Record an incoming clinical blood requirement from a partner hospital
        </p>
      </div>

      {/* Main Form Card */}
      <div className="bg-surface-white rounded-3xl border border-border-card shadow-card-clean overflow-hidden">
        {/* Card Header */}
        <div className="px-6 pt-6 pb-5 border-b border-border-card bg-workspace-bg/40 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-blood/10 border border-brand-blood/20 flex items-center justify-center text-brand-blood">
            <GitPullRequest className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-text-main">Request Parameters</h2>
            <p className="text-xs text-text-muted">
              Fields marked <span className="text-brand-blood font-bold">*</span> are required
            </p>
          </div>
        </div>

        {/* Card Body */}
        <div className="px-6 py-6">
          {/* Lookup loading / error indicator */}
          {loadingLookups && (
            <div className="py-8 flex flex-col items-center justify-center gap-2 text-text-muted">
              <Loader2 className="w-6 h-6 animate-spin text-brand-blood" />
              <span className="text-xs font-medium">Loading hospital directory and blood groups…</span>
            </div>
          )}

          {lookupError && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2 mb-4">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-brand-blood mt-0.5" />
              <div>
                <span>{lookupError}</span>
                <button
                  type="button"
                  onClick={loadLookups}
                  className="block mt-1 font-bold underline hover:text-rose-900"
                >
                  Retry loading options
                </button>
              </div>
            </div>
          )}

          {!loadingLookups && (
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {/* Hospital Partner Dropdown */}
              <div>
                <label htmlFor="hospital_id" className="block text-xs font-semibold text-text-main mb-1.5">
                  Partner Hospital <span className="text-brand-blood font-bold">*</span>
                </label>
                <select
                  id="hospital_id"
                  name="hospital_id"
                  value={formData.hospital_id}
                  onChange={handleChange}
                  className={`w-full px-3.5 py-2.5 bg-workspace-bg border rounded-xl text-xs text-text-main font-medium focus:outline-none focus:ring-2 focus:ring-brand-blood/20 focus:border-brand-blood transition-colors ${
                    fieldErrors.hospital_id ? 'border-rose-300 ring-2 ring-rose-100' : 'border-border-card'
                  }`}
                >
                  <option value="">-- Select Partner Hospital --</option>
                  {hospitals.map((h) => (
                    <option key={h.hospital_id} value={h.hospital_id}>
                      {h.name} {h.contact ? `(${h.contact})` : ''}
                    </option>
                  ))}
                </select>
                {fieldErrors.hospital_id && (
                  <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {fieldErrors.hospital_id}
                  </p>
                )}
                {hospitals.length === 0 && !loadingLookups && !lookupError && (
                  <p className="mt-1 text-xs text-amber-700">
                    No hospitals found in database. Please register a hospital first.
                  </p>
                )}
              </div>

              {/* Blood Group Radio / Select */}
              <div>
                <label className="block text-xs font-semibold text-text-main mb-1.5">
                  Blood Group Required <span className="text-brand-blood font-bold">*</span>
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {bloodGroups.map((bg) => {
                    const isSelected = String(formData.blood_group_id) === String(bg.blood_group_id);
                    const colors = BLOOD_GROUP_COLORS[bg.group_name] || defaultGroupColor;

                    return (
                      <button
                        type="button"
                        key={bg.blood_group_id}
                        onClick={() => {
                          setFormData((prev) => ({ ...prev, blood_group_id: String(bg.blood_group_id) }));
                          if (fieldErrors.blood_group_id) {
                            setFieldErrors((prev) => ({ ...prev, blood_group_id: null }));
                          }
                        }}
                        className={`py-2 rounded-xl text-xs font-bold border transition-all text-center ${
                          isSelected
                            ? 'bg-brand-blood text-white border-brand-blood shadow-sm scale-105'
                            : 'bg-workspace-bg hover:bg-surface-white border-border-card text-text-main'
                        }`}
                      >
                        {bg.group_name}
                      </button>
                    );
                  })}
                </div>
                {fieldErrors.blood_group_id && (
                  <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {fieldErrors.blood_group_id}
                  </p>
                )}
              </div>

              {/* Quantity Required & Urgency */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Quantity */}
                <div>
                  <label htmlFor="quantity_required" className="block text-xs font-semibold text-text-main mb-1.5">
                    Quantity Required (Units) <span className="text-brand-blood font-bold">*</span>
                  </label>
                  <input
                    type="number"
                    id="quantity_required"
                    name="quantity_required"
                    min="1"
                    max="50"
                    step="1"
                    value={formData.quantity_required}
                    onChange={handleChange}
                    className={`w-full px-3.5 py-2.5 bg-workspace-bg border rounded-xl text-xs text-text-main font-medium focus:outline-none focus:ring-2 focus:ring-brand-blood/20 focus:border-brand-blood transition-colors ${
                      fieldErrors.quantity_required ? 'border-rose-300 ring-2 ring-rose-100' : 'border-border-card'
                    }`}
                  />
                  {fieldErrors.quantity_required && (
                    <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {fieldErrors.quantity_required}
                    </p>
                  )}
                </div>

                {/* Urgency */}
                <div>
                  <label htmlFor="urgency" className="block text-xs font-semibold text-text-main mb-1.5">
                    Urgency Classification
                  </label>
                  <select
                    id="urgency"
                    name="urgency"
                    value={formData.urgency}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-workspace-bg border border-border-card rounded-xl text-xs text-text-main font-medium focus:outline-none focus:ring-2 focus:ring-brand-blood/20 focus:border-brand-blood transition-colors"
                  >
                    <option value="Normal">Normal (Standard Schedule)</option>
                    <option value="Urgent">Urgent (Priority Allocation)</option>
                    <option value="Critical">Critical (Immediate Emergency)</option>
                  </select>
                </div>
              </div>

              {/* Request Date */}
              <div>
                <label htmlFor="request_date" className="block text-xs font-semibold text-text-main mb-1.5">
                  Request Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    id="request_date"
                    name="request_date"
                    value={formData.request_date}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-workspace-bg border border-border-card rounded-xl text-xs text-text-main font-medium focus:outline-none focus:ring-2 focus:ring-brand-blood/20 focus:border-brand-blood transition-colors"
                  />
                </div>
              </div>

              {/* Feedback banners */}
              {apiError && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-brand-blood mt-0.5" />
                  <span>{apiError}</span>
                </div>
              )}

              {successMessage && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600 mt-0.5" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Submit / Cancel Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-card">
                <button
                  type="button"
                  onClick={() => navigate('/requests')}
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl border border-border-card bg-surface-white text-xs font-semibold text-text-main hover:bg-workspace-bg transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || loadingLookups}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-brand-blood text-white text-xs font-bold hover:bg-brand-blood-dark transition-colors shadow-active-nav disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Submitting Request…
                    </>
                  ) : (
                    'Submit Blood Request'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Informational Workflow Boundary Notice */}
      <div className="px-4 py-3 rounded-xl bg-workspace-bg border border-border-card text-xs text-text-muted leading-relaxed">
        <strong className="text-text-main font-semibold">Workflow Policy:</strong> Newly submitted requests are entered in <span className="font-semibold text-amber-700">Pending</span> status. Recording a request does not reserve or alter physical stock until formal unit issuance.
      </div>
    </div>
  );
}
