import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PackageCheck,
  RefreshCw,
  ServerCrash,
  PlusCircle,
  CheckCircle2,
} from 'lucide-react';
import { issueService, bloodGroupService } from '../../services/api';
import IssueTable from '../../components/issues/IssueTable';
import IssueStats from '../../components/issues/IssueStats';
import IssueFilters from '../../components/issues/IssueFilters';
import IssueSkeleton from '../../components/issues/IssueSkeleton';
import IssueEmptyState from '../../components/issues/IssueEmptyState';
import IssueBloodModal from '../../components/issues/IssueBloodModal';

const PAGE_SIZE = 10;

export default function Issues() {
  const navigate = useNavigate();

  // Data states
  const [issues, setIssues] = useState([]);
  const [bloodGroups, setBloodGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Modal & Toast states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [bloodGroupFilter, setBloodGroupFilter] = useState('ALL');
  const [hospitalFilter, setHospitalFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch all issues from backend
  const fetchIssues = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const [issuesRes, bgRes] = await Promise.all([
        issueService.getAll(),
        bloodGroupService.getAll().catch(() => ({ data: [] })),
      ]);

      setIssues(issuesRes.data || []);
      setBloodGroups(bgRes.data || []);
    } catch (err) {
      const msg = typeof err === 'string' ? err : err?.message || 'Unable to load blood issuance history.';
      setError(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  // Derive unique hospital names from real returned issues
  const hospitalOptions = useMemo(() => {
    const list = Array.from(new Set(issues.map((i) => i.hospital_name).filter(Boolean)));
    return list.sort();
  }, [issues]);

  // Client-side filtering & search
  const filteredIssues = useMemo(() => {
    return issues.filter((item) => {
      // Blood Group filter
      if (bloodGroupFilter !== 'ALL' && item.blood_group !== bloodGroupFilter) {
        return false;
      }

      // Hospital filter
      if (hospitalFilter !== 'ALL' && item.hospital_name !== hospitalFilter) {
        return false;
      }

      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesIssueId = String(item.issue_id).includes(q);
        const matchesUnitId = String(item.unit_id).includes(q);
        const matchesRequestId = String(item.request_id).includes(q);
        const matchesHospital = item.hospital_name?.toLowerCase().includes(q);
        const matchesBloodGroup = item.blood_group?.toLowerCase().includes(q);
        const matchesOperator = item.issued_by_name?.toLowerCase().includes(q);

        if (!matchesIssueId && !matchesUnitId && !matchesRequestId && !matchesHospital && !matchesBloodGroup && !matchesOperator) {
          return false;
        }
      }

      return true;
    });
  }, [issues, bloodGroupFilter, hospitalFilter, searchTerm]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, bloodGroupFilter, hospitalFilter]);

  // Paginated slice
  const paginatedIssues = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredIssues.slice(start, start + PAGE_SIZE);
  }, [filteredIssues, currentPage]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setBloodGroupFilter('ALL');
    setHospitalFilter('ALL');
  };

  const handleIssueSuccess = (resultData) => {
    const qty = resultData?.issued_unit_ids?.length || 1;
    showToast(`Blood units successfully issued for Request #REQ-${resultData?.request_id} (${qty} unit(s) dispatched).`);
    fetchIssues(true);
  };

  const isFiltered = Boolean(
    searchTerm.trim() ||
    bloodGroupFilter !== 'ALL' ||
    hospitalFilter !== 'ALL'
  );

  const isEmpty = issues.length === 0 && !isFiltered;
  const noMatches = filteredIssues.length === 0 && (isFiltered || issues.length > 0);

  // ── Loading Skeleton ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-6 pb-12">
        <IssueSkeleton />
      </div>
    );
  }

  // ── API Error State ─────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="space-y-6 pb-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">
              <span>OPERATIONS</span>
              <span>/</span>
              <span>Blood Issuance</span>
            </div>
            <h1 className="text-page-title">Blood Issuance</h1>
            <p className="text-page-subtitle">Track blood unit distribution and fulfillment history</p>
          </div>
        </div>

        <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-8 bg-surface-white rounded-3xl border border-border-card shadow-card-clean max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-brand-blood mb-4">
            <ServerCrash className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-text-main mb-1.5">Blood Issuance Unavailable</h2>
          <p className="text-xs text-text-muted mb-5 leading-relaxed">{error}</p>
          <p className="text-[11px] text-text-muted/70 mb-5">
            Ensure the backend is running at <code className="font-mono text-brand-blood">http://localhost:5000</code>
          </p>
          <button
            type="button"
            onClick={() => fetchIssues()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-blood text-white text-xs font-semibold hover:bg-brand-blood-dark transition-colors shadow-active-nav"
          >
            <RefreshCw className="w-4 h-4" />
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  // ── Normal Render ───────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 pb-12">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">
            <span>OPERATIONS</span>
            <span>/</span>
            <span>Blood Issuance</span>
          </div>
          <h1 className="text-page-title">Blood Issuance</h1>
          <p className="text-page-subtitle">
            Log and audit trail of physical blood units dispatched to partner hospitals
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => fetchIssues(true)}
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
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-blood text-white text-xs font-semibold hover:bg-brand-blood-dark transition-colors shadow-active-nav"
          >
            <PlusCircle className="w-4 h-4" />
            Issue Blood
          </button>
        </div>
      </div>

      {/* 2. Operational Summary Stats */}
      {!isEmpty && <IssueStats issues={issues} />}

      {/* 3. Filter and Search Toolbar */}
      {!isEmpty && (
        <IssueFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          bloodGroupFilter={bloodGroupFilter}
          onBloodGroupChange={setBloodGroupFilter}
          hospitalFilter={hospitalFilter}
          onHospitalChange={setHospitalFilter}
          hospitals={hospitalOptions}
          bloodGroups={bloodGroups}
          totalCount={issues.length}
          filteredCount={filteredIssues.length}
          onClearFilters={handleClearFilters}
        />
      )}

      {/* 4. Issue Records Content */}
      {isEmpty ? (
        <IssueEmptyState isFiltered={false} />
      ) : noMatches ? (
        <IssueEmptyState isFiltered onClearFilters={handleClearFilters} />
      ) : (
        <IssueTable
          issues={paginatedIssues}
          currentPage={currentPage}
          pageSize={PAGE_SIZE}
          totalItems={filteredIssues.length}
          onPageChange={setCurrentPage}
        />
      )}

      {/* 5. Issue Blood Modal Workflow */}
      <IssueBloodModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onIssueSuccess={handleIssueSuccess}
      />

      {/* 6. Feedback Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#1C1315] text-white text-xs font-medium shadow-xl border border-white/10 animate-in fade-in-50">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
