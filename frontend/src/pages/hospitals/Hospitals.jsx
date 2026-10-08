import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  PlusCircle,
  RefreshCw,
  ServerCrash,
  Search,
  X,
  Trash2,
  Pencil,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react';
import { hospitalService } from '../../services/api';
import HospitalTable from '../../components/hospitals/HospitalTable';
import HospitalDetailModal from '../../components/hospitals/HospitalDetailModal';
import HospitalForm from '../../components/hospitals/HospitalForm';
import HospitalSkeleton from '../../components/hospitals/HospitalSkeleton';
import HospitalEmptyState from '../../components/hospitals/HospitalEmptyState';

const PAGE_SIZE = 8;

// ─── Delete Confirmation Dialog ──────────────────────────────────────────────
function DeleteConfirmDialog({ hospital, onConfirm, onCancel, loading, apiError }) {
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onCancel(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onCancel]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-confirm-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      <div className="bg-surface-white rounded-3xl border border-border-card shadow-2xl w-full max-w-sm p-6 space-y-5">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-full bg-rose-100 border border-rose-200 flex items-center justify-center text-brand-blood flex-shrink-0">
            <Trash2 className="w-5 h-5" />
          </div>
          <div>
            <h3 id="delete-confirm-title" className="text-base font-bold text-text-main">
              Delete {hospital.name}?
            </h3>
            <p className="text-xs text-text-muted mt-1 leading-relaxed">
              This will permanently remove the hospital from the network. If any blood requests are associated, deletion will be blocked by the system.
            </p>
          </div>
        </div>

        {apiError && (
          <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-brand-blood" />
            <span>{apiError}</span>
          </div>
        )}

        <div className="flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 rounded-xl border border-border-card bg-surface-white text-text-main text-xs font-semibold hover:bg-workspace-bg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Deleting…</>
            ) : (
              <><Trash2 className="w-3.5 h-3.5" /> Delete Hospital</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────
function EditModal({ hospital, onSave, onClose }) {
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const handleSubmit = async (payload) => {
    setLoading(true);
    setApiError(null);
    try {
      await hospitalService.update(hospital.hospital_id, payload);
      onSave();
    } catch (err) {
      const msg = typeof err === 'string' ? err : err?.message || 'Failed to update hospital.';
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-hospital-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      <div className="bg-surface-white rounded-3xl border border-border-card shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh] overflow-hidden">
        <div className="px-6 py-5 border-b border-border-card bg-workspace-bg/50 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-blood/10 border border-brand-blood/20 flex items-center justify-center text-brand-blood">
              <Pencil className="w-4 h-4" />
            </div>
            <h2 id="edit-hospital-title" className="text-base font-bold text-text-main">Edit Hospital</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close edit dialog"
            className="w-9 h-9 rounded-full border border-border-card bg-surface-white flex items-center justify-center text-text-muted hover:text-text-main hover:bg-workspace-bg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <HospitalForm
            mode="edit"
            initialData={hospital}
            onSubmit={handleSubmit}
            onCancel={onClose}
            loading={loading}
            apiError={apiError}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Main Hospitals Page ──────────────────────────────────────────────────────
export default function Hospitals() {
  const navigate = useNavigate();

  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Search
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Detail modal
  const [viewHospitalId, setViewHospitalId] = useState(null);

  // Edit modal
  const [editHospital, setEditHospital] = useState(null);

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  // Toast success
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  // Fetch hospitals
  const fetchHospitals = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const res = await hospitalService.getAll();
      setHospitals(res.data || []);
    } catch (err) {
      const msg = typeof err === 'string' ? err : err?.message || 'Unable to load hospital directory.';
      setError(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchHospitals();
  }, [fetchHospitals]);

  // Network overview statistics
  const overviewStats = useMemo(() => {
    const total = hospitals.length;
    const withContact = hospitals.filter((h) => Boolean(h.contact && h.contact.trim())).length;
    const withEmail = hospitals.filter((h) => Boolean(h.email && h.email.trim())).length;
    const withAddress = hospitals.filter((h) => Boolean(h.address && h.address.trim())).length;
    return { total, withContact, withEmail, withAddress };
  }, [hospitals]);

  // Filtered hospitals
  const filteredHospitals = useMemo(() => {
    if (!searchTerm.trim()) return hospitals;
    const q = searchTerm.toLowerCase();
    return hospitals.filter(
      (h) =>
        h.name?.toLowerCase().includes(q) ||
        h.address?.toLowerCase().includes(q) ||
        h.contact?.toLowerCase().includes(q) ||
        h.email?.toLowerCase().includes(q)
    );
  }, [hospitals, searchTerm]);

  // Reset page on filter change
  useEffect(() => { setCurrentPage(1); }, [searchTerm]);

  // Paginated
  const paginatedHospitals = useMemo(() => {
    return filteredHospitals.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  }, [filteredHospitals, currentPage]);

  // Handle delete
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      await hospitalService.delete(deleteTarget.hospital_id);
      setDeleteTarget(null);
      showToast(`${deleteTarget.name} removed from the network.`);
      await fetchHospitals(true);
    } catch (err) {
      const msg = typeof err === 'string' ? err : err?.message || 'Failed to delete hospital.';
      setDeleteError(msg);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Handle edit save
  const handleEditSave = async () => {
    const name = editHospital?.name || 'Hospital';
    setEditHospital(null);
    showToast(`${name} updated successfully.`);
    await fetchHospitals(true);
  };

  const isFiltered = Boolean(searchTerm.trim());
  const isEmpty = hospitals.length === 0;
  const noResults = !isEmpty && filteredHospitals.length === 0;

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-6 pb-12">
        <HospitalSkeleton />
      </div>
    );
  }

  // ── Error state ───────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="space-y-6 pb-12">
        <PageHeader navigate={navigate} onRefresh={() => fetchHospitals()} refreshing={false} />
        <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-8 bg-surface-white rounded-3xl border border-border-card shadow-card-clean max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-brand-blood mb-4">
            <ServerCrash className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-text-main mb-1.5">Hospitals Unavailable</h2>
          <p className="text-xs text-text-muted mb-5 leading-relaxed">{error}</p>
          <p className="text-[11px] text-text-muted/70 mb-5">
            Ensure the backend is running at <code className="font-mono text-brand-blood">http://localhost:5000</code>
          </p>
          <button
            type="button"
            onClick={() => fetchHospitals()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-blood text-white text-xs font-semibold hover:bg-brand-blood-dark transition-colors shadow-active-nav"
          >
            <RefreshCw className="w-4 h-4" />
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Page Header */}
      <PageHeader
        navigate={navigate}
        onRefresh={() => fetchHospitals(true)}
        refreshing={refreshing}
      />

      {/* Summary stats overview */}
      {!isEmpty && (
        <div className="bg-surface-white rounded-2xl border border-border-card shadow-card-clean p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border-card">
            <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">
              Network Overview
            </span>
            <span className="text-xs text-text-muted">
              Synchronized with partner directory
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {/* Total Hospitals */}
            <div className="p-4 rounded-xl bg-workspace-bg border border-border-card/60 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-brand-blood/10 text-brand-blood flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-2xl font-bold text-text-main block leading-tight">
                  {hospitals.length.toLocaleString()}
                </span>
                <span className="text-xs text-text-muted font-medium">Total Hospitals</span>
              </div>
            </div>

            {/* With Contact Number */}
            <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/60 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <span className="text-2xl font-bold text-emerald-700 block leading-tight">
                  {overviewStats.withContact.toLocaleString()}
                </span>
                <span className="text-xs text-emerald-800 font-medium">With Contact Number</span>
              </div>
            </div>

            {/* With Email Address */}
            <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200/60 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <span className="text-2xl font-bold text-blue-700 block leading-tight">
                  {overviewStats.withEmail.toLocaleString()}
                </span>
                <span className="text-xs text-blue-800 font-medium">With Email Address</span>
              </div>
            </div>

            {/* With Address */}
            <div className="p-4 rounded-xl bg-workspace-bg border border-border-card/60 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-brand-blood/10 text-brand-blood flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <span className="text-2xl font-bold text-text-main block leading-tight">
                  {overviewStats.withAddress.toLocaleString()}
                </span>
                <span className="text-xs text-text-muted font-medium">With Address</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Search toolbar */}
      {!isEmpty && (
        <div className="bg-surface-white rounded-2xl border border-border-card shadow-card-clean p-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search hospitals by name, address, contact, email…"
                className="w-full pl-10 pr-4 py-2 bg-workspace-bg border border-border-card rounded-xl text-xs text-text-main placeholder-text-muted/70 focus:outline-none focus:ring-2 focus:ring-brand-blood/20 focus:border-brand-blood transition-colors"
              />
            </div>
            <div className="flex items-center gap-2 text-xs text-text-muted">
              <span className="font-semibold text-text-main">{filteredHospitals.length}</span>
              <span>of {hospitals.length} hospitals</span>
              {isFiltered && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-border-card hover:bg-workspace-bg text-text-muted hover:text-text-main transition-colors font-medium"
                >
                  <X className="w-3.5 h-3.5" />
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. Content — empty / no-results / table */}
      {isEmpty ? (
        <HospitalEmptyState isFiltered={false} />
      ) : noResults ? (
        <HospitalEmptyState isFiltered onClearFilters={() => setSearchTerm('')} />
      ) : (
        <HospitalTable
          hospitals={paginatedHospitals}
          currentPage={currentPage}
          pageSize={PAGE_SIZE}
          totalItems={filteredHospitals.length}
          onPageChange={setCurrentPage}
          onView={setViewHospitalId}
          onEdit={setEditHospital}
          onDelete={(h) => { setDeleteTarget(h); setDeleteError(null); }}
        />
      )}

      {/* Modals */}
      {viewHospitalId && (
        <HospitalDetailModal
          hospitalId={viewHospitalId}
          onClose={() => setViewHospitalId(null)}
        />
      )}

      {editHospital && (
        <EditModal
          hospital={editHospital}
          onSave={handleEditSave}
          onClose={() => setEditHospital(null)}
        />
      )}

      {deleteTarget && (
        <DeleteConfirmDialog
          hospital={deleteTarget}
          onConfirm={handleDeleteConfirm}
          onCancel={() => { setDeleteTarget(null); setDeleteError(null); }}
          loading={deleteLoading}
          apiError={deleteError}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#1C1315] text-white text-xs font-medium shadow-xl border border-white/10">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}

// ─── Page Header ──────────────────────────────────────────────────────────────
function PageHeader({ navigate, onRefresh, refreshing }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-page-title">Hospitals</h1>
        <p className="text-page-subtitle">Hospital network and partner directory</p>
      </div>
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-white border border-border-card text-xs font-semibold text-text-main hover:bg-workspace-bg transition-colors shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-text-muted ${refreshing ? 'animate-spin text-brand-blood' : ''}`} />
          {refreshing ? 'Refreshing…' : 'Refresh'}
        </button>
        <button
          type="button"
          onClick={() => navigate('/hospitals/add')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-blood text-white text-xs font-semibold hover:bg-brand-blood-dark transition-colors shadow-active-nav"
        >
          <PlusCircle className="w-4 h-4" />
          Add Hospital
        </button>
      </div>
    </div>
  );
}
