import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { hospitalService } from '../../services/api';
import HospitalForm from '../../components/hospitals/HospitalForm';

export default function AddHospital() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const handleSubmit = async (payload) => {
    setLoading(true);
    setApiError(null);
    setSuccessMessage(null);
    try {
      const res = await hospitalService.create(payload);
      const newId = res?.data?.hospital_id;
      setSuccessMessage(
        `Hospital "${payload.name}" registered successfully${newId ? ` (ID: #H-${newId})` : ''}.`
      );
      // Short pause so user sees success before navigating back
      setTimeout(() => navigate('/hospitals'), 1800);
    } catch (err) {
      const msg =
        typeof err === 'string'
          ? err
          : err?.message || 'Failed to register hospital. Please try again.';
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      {/* Back nav */}
      <button
        type="button"
        onClick={() => navigate('/hospitals')}
        className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text-main transition-colors font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Hospital Network
      </button>

      {/* Page header */}
      <div>
        <h1 className="text-page-title">Add Hospital</h1>
        <p className="text-page-subtitle">Register a new hospital partner in the network</p>
      </div>

      {/* Form card */}
      <div className="bg-surface-white rounded-3xl border border-border-card shadow-card-clean">
        {/* Card header */}
        <div className="px-6 pt-6 pb-5 border-b border-border-card bg-workspace-bg/40 rounded-t-3xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-blood/10 border border-brand-blood/20 flex items-center justify-center text-brand-blood">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-text-main">Hospital Information</h2>
            <p className="text-xs text-text-muted">
              Fields marked <span className="text-brand-blood font-bold">*</span> are required
            </p>
          </div>
        </div>

        {/* Form body */}
        <div className="px-6 py-6">
          <HospitalForm
            mode="create"
            onSubmit={handleSubmit}
            onCancel={() => navigate('/hospitals')}
            loading={loading}
            apiError={apiError}
            successMessage={successMessage}
          />
        </div>
      </div>

      {/* Info note about required fields */}
      <div className="px-4 py-3 rounded-xl bg-workspace-bg border border-border-card text-xs text-text-muted leading-relaxed">
        <strong className="text-text-main">Required fields:</strong> Hospital Name and Contact Number.
        Address and Email are optional. A hospital with a duplicate email address will be rejected by the system.
      </div>
    </div>
  );
}
