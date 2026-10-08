import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GitPullRequest,
  PlusCircle,
  RefreshCw,
  ServerCrash,
  CheckCircle2,
} from 'lucide-react';
import { requestService, hospitalService } from '../../services/api';
import RequestTable from '../../components/requests/RequestTable';
import RequestStats from '../../components/requests/RequestStats';
import RequestFilters from '../../components/requests/RequestFilters';
import RequestSkeleton from '../../components/requests/RequestSkeleton';
import RequestEmptyState from '../../components/requests/RequestEmptyState';
import RequestStatusModal from '../../components/requests/RequestStatusModal';

const PAGE_SIZE = 10;

export default function Requests() {
  const navigate = useNavigate();

  // Primary data states
  const [requests, setRequests] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Filters & search state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [urgencyFilter, setUrgencyFilter] = useState('ALL');
  const [hospitalFilter, setHospitalFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);

  // Status mutation modal state
  const [activeModalRequest, setActiveModalRequest] = useState(null);
  const [targetStatus, setTargetStatus] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError, setStatusError] = useState(null);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState(null);
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch requests using server query filters where applicable
  const fetchRequests = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const params = {};
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (urgencyFilter !== 'ALL') params.urgency = urgencyFilter;
      if (hospitalFilter !== 'ALL') params.hospital_id = hospitalFilter;

      const [reqRes, hospRes] = await Promise.all([
        requestService.getAll(params),
        hospitalService.getAll().catch(() => ({ data: [] })),
      ]);

      setRequests(reqRes.data || []);
      setHospitals(hospRes.data || []);
    } catch (err) {
      const msg = typeof err === 'string' ? err : err?.message || 'Unable to load blood requests.';
      setError(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [statusFilter, urgencyFilter, hospitalFilter]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Client-side search on top of current filter set
  const filteredRequests = useMemo(() => {
    if (!searchTerm.trim()) return requests;
    const q = searchTerm.toLowerCase();
    return requests.filter(
      (r) =>
        String(r.request_id).includes(q) ||
        r.hospital_name?.toLowerCase().includes(q) ||
        r.blood_group?.toLowerCase().includes(q) ||
        r.hospital_contact?.toLowerCase().includes(q)
    );
  }, [requests, searchTerm]);

  // Reset page on filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, urgencyFilter, hospitalFilter]);

  // Paginated slice
  const paginatedRequests = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredRequests.slice(start, start + PAGE_SIZE);
  }, [filteredRequests, currentPage]);

  // Handle status update submission
  const handleConfirmStatus = async () => {
    if (!activeModalRequest || !targetStatus) return;
    setStatusLoading(true);
    setStatusError(null);

    try {
      await requestService.updateStatus(activeModalRequest.request_id, {
        status: targetStatus,
      });

      showToast(`Request #REQ-${activeModalRequest.request_id} updated to ${targetStatus}.`);
      setActiveModalRequest(null);
      setTargetStatus(null);
      // Re-fetch to ensure complete sync with database
      await fetchRequests(true);
    } catch (err) {
      const msg = typeof err === 'string' ? err : err?.message || 'Failed to update request status.';
      setStatusError(msg);
    } finally {
      setStatusLoading(false);
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('ALL');
    setUrgencyFilter('ALL');
    setHospitalFilter('ALL');
  };

  const isFiltered = Boolean(
    searchTerm.trim() ||
    statusFilter !== 'ALL' ||
    urgencyFilter !== 'ALL' ||
    hospitalFilter !== 'ALL'
  );

  const isEmpty = requests.length === 0 && !isFiltered;
  const noMatches = filteredRequests.length === 0 && (isFiltered || requests.length > 0);

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-6 pb-12">
        <RequestSkeleton />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6 pb-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-page-title">Blood Requests</h1>
            <p className="text-page-subtitle">Monitor incoming blood requirements and coordinate fulfillment</p>
          </div>
        </div>
        <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-8 bg-surface-white rounded-3xl border border-border-card shadow-card-clean max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-brand-blood mb-4">
            <ServerCrash className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-text-main mb-1.5">Requests Unavailable</h2>
          <p className="text-xs text-text-muted mb-5 leading-relaxed">{error}</p>
          <button
            type="button"
            onClick={() => fetchRequests()}
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">
            <span>OPERATIONS</span>
            <span>/</span>
            <span>Blood Requests</span>
          </div>
          <h1 className="text-page-title">Blood Requests</h1>
          <p className="text-page-subtitle">
            Monitor incoming blood requirements and coordinate fulfillment
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => fetchRequests(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-white border border-border-card text-xs font-semibold text-text-main hover:bg-workspace-bg transition-colors shadow-sm disabled:opacity-50"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-text-muted ${refreshing ? 'animate-spin text-brand-blood' : ''}`}
            />
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/requests/add')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-blood text-white text-xs font-semibold hover:bg-brand-blood-dark transition-colors shadow-active-nav"
          >
            <PlusCircle className="w-4 h-4" />
            New Request
          </button>
        </div>
      </div>

      {/* 2. Operational Summary Stats */}
      {!isEmpty && <RequestStats requests={requests} />}

      {/* 3. Filter & Search Toolbar */}
      {!isEmpty && (
        <RequestFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          urgencyFilter={urgencyFilter}
          onUrgencyChange={setUrgencyFilter}
          hospitalFilter={hospitalFilter}
          onHospitalChange={setHospitalFilter}
          hospitals={hospitals}
          totalCount={requests.length}
          filteredCount={filteredRequests.length}
          onClearFilters={handleClearFilters}
        />
      )}

      {/* 4. Requests Work Queue Content */}
      {isEmpty ? (
        <RequestEmptyState isFiltered={false} />
      ) : noMatches ? (
        <RequestEmptyState isFiltered onClearFilters={handleClearFilters} />
      ) : (
        <RequestTable
          requests={paginatedRequests}
          currentPage={currentPage}
          pageSize={PAGE_SIZE}
          totalItems={filteredRequests.length}
          onPageChange={setCurrentPage}
          onStatusAction={(request, nextStatus) => {
            setActiveModalRequest(request);
            setTargetStatus(nextStatus);
            setStatusError(null);
          }}
        />
      )}

      {/* Status confirmation dialog */}
      {activeModalRequest && (
        <RequestStatusModal
          request={activeModalRequest}
          targetStatus={targetStatus}
          onConfirm={handleConfirmStatus}
          onCancel={() => {
            setActiveModalRequest(null);
            setTargetStatus(null);
            setStatusError(null);
          }}
          loading={statusLoading}
          apiError={statusError}
        />
      )}

      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#1C1315] text-white text-xs font-medium shadow-xl border border-white/10 animate-in fade-in-50">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
