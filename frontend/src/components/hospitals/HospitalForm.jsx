import React, { useState, useEffect } from 'react';
import {
  X,
  Building2,
  Phone,
  Mail,
  MapPin,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

const REQUIRED_FIELDS = ['name', 'contact'];

function validate(form) {
  const errors = {};
  if (!form.name.trim()) errors.name = 'Hospital name is required';
  if (!form.contact.trim()) errors.contact = 'Contact number is required';
  return errors;
}

export default function HospitalForm({
  mode = 'create',       // 'create' | 'edit'
  initialData = null,    // hospital object when editing
  onSubmit,              // async (payload) => void
  onCancel,
  loading = false,
  apiError = null,
  successMessage = null,
}) {
  const [form, setForm] = useState({
    name: initialData?.name || '',
    address: initialData?.address || '',
    contact: initialData?.contact || '',
    email: initialData?.email || '',
  });
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});

  // Re-populate when editing a different hospital
  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || '',
        address: initialData.address || '',
        contact: initialData.contact || '',
        email: initialData.email || '',
      });
      setTouched({});
      setErrors({});
    }
  }, [initialData?.hospital_id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const fieldErrors = validate(form);
    setErrors(fieldErrors);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const allTouched = Object.fromEntries(Object.keys(form).map((k) => [k, true]));
    setTouched(allTouched);
    const fieldErrors = validate(form);
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) return;

    // Only pass non-empty fields; backend accepts nulls for address/email
    const payload = {
      name: form.name.trim(),
      contact: form.contact.trim(),
    };
    if (form.address.trim()) payload.address = form.address.trim();
    if (form.email.trim()) payload.email = form.email.trim();

    await onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* Success Banner */}
      {successMessage && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* API Error Banner */}
      {apiError && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm">
          <AlertCircle className="w-5 h-5 text-brand-blood flex-shrink-0 mt-0.5" />
          <span>{apiError}</span>
        </div>
      )}

      {/* Hospital Information Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 pb-1 border-b border-border-card">
          <Building2 className="w-4 h-4 text-brand-blood" />
          <h3 className="text-sm font-bold text-text-main">Hospital Information</h3>
        </div>

        {/* Name */}
        <FormField
          id="hospital-name"
          name="name"
          label="Hospital Name"
          required
          placeholder="e.g. Apollo Hospital"
          value={form.name}
          error={touched.name ? errors.name : undefined}
          onChange={handleChange}
          onBlur={handleBlur}
          icon={Building2}
        />

        {/* Address */}
        <div className="space-y-1.5">
          <label htmlFor="hospital-address" className="block text-xs font-semibold text-text-main">
            Address
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 w-4 h-4 text-text-muted pointer-events-none" />
            <textarea
              id="hospital-address"
              name="address"
              rows={2}
              value={form.address}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Street, area, city…"
              className="w-full pl-9 pr-4 py-2.5 bg-workspace-bg border border-border-card rounded-xl text-sm text-text-main placeholder-text-muted/60 focus:outline-none focus:ring-2 focus:ring-brand-blood/20 focus:border-brand-blood transition-colors resize-none"
            />
          </div>
        </div>
      </section>

      {/* Contact Information Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 pb-1 border-b border-border-card">
          <Phone className="w-4 h-4 text-brand-blood" />
          <h3 className="text-sm font-bold text-text-main">Contact Information</h3>
        </div>

        {/* Contact */}
        <FormField
          id="hospital-contact"
          name="contact"
          label="Contact Number"
          required
          placeholder="e.g. 080-26304050"
          value={form.contact}
          error={touched.contact ? errors.contact : undefined}
          onChange={handleChange}
          onBlur={handleBlur}
          icon={Phone}
          type="tel"
        />

        {/* Email */}
        <FormField
          id="hospital-email"
          name="email"
          label="Email Address"
          placeholder="e.g. emergency@hospital.com"
          value={form.email}
          onChange={handleChange}
          onBlur={handleBlur}
          icon={Mail}
          type="email"
        />
      </section>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-4 py-2 rounded-xl border border-border-card bg-surface-white text-text-main text-sm font-semibold hover:bg-workspace-bg transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-brand-blood text-white text-sm font-semibold hover:bg-brand-blood-dark transition-colors shadow-active-nav disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{mode === 'edit' ? 'Saving…' : 'Registering…'}</span>
            </>
          ) : (
            <span>{mode === 'edit' ? 'Save Changes' : 'Register Hospital'}</span>
          )}
        </button>
      </div>
    </form>
  );
}

// Reusable field
function FormField({ id, name, label, required, placeholder, value, error, onChange, onBlur, icon: Icon, type = 'text' }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-xs font-semibold text-text-main">
        {label}
        {required && <span className="text-brand-blood ml-1">*</span>}
      </label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          aria-required={required}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`w-full pl-9 pr-4 py-2.5 bg-workspace-bg border rounded-xl text-sm text-text-main placeholder-text-muted/60 focus:outline-none focus:ring-2 focus:ring-brand-blood/20 focus:border-brand-blood transition-colors ${
            error ? 'border-rose-400 bg-rose-50/30' : 'border-border-card'
          }`}
        />
      </div>
      {error && (
        <p id={`${id}-error`} role="alert" className="text-[11px] text-rose-600 font-medium flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" />
          {error}
        </p>
      )}
    </div>
  );
}
