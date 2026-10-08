import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { RefreshCw, ServerCrash, Layers } from 'lucide-react';
import { inventoryService } from '../../services/api';
import { aggregateInventoryData } from './inventoryHelpers';

// Subcomponents
import InventoryHero from '../../components/inventory/InventoryHero';
import BloodGroupMatrix from '../../components/inventory/BloodGroupMatrix';
import InventoryAlerts from '../../components/inventory/InventoryAlerts';
import InventoryFilters from '../../components/inventory/InventoryFilters';
import InventoryTable from '../../components/inventory/InventoryTable';
import InventoryDetailModal from '../../components/inventory/InventoryDetailModal';
import InventorySkeleton from '../../components/inventory/InventorySkeleton';
import InventoryEmptyState from '../../components/inventory/InventoryEmptyState';

export default function Inventory() {
  const [summaryList, setSummaryList] = useState([]);
  const [availableUnits, setAvailableUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Selected blood group item for drilldown modal
  const [selectedGroup, setSelectedGroup] = useState(null);

  // Unit Table Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [bloodGroupFilter, setBloodGroupFilter] = useState('ALL');
  const [expirySort, setExpirySort] = useState('ASC');
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  // Primary fetch routine
  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      // Execute both real backend queries in parallel
      const [summaryRes, unitsRes] = await Promise.all([
        inventoryService.getSummary(),
        inventoryService.getAvailableUnits(),
      ]);

      setSummaryList(summaryRes.data || []);
      setAvailableUnits(unitsRes.data || []);
    } catch (err) {
      console.error('Failed to load inventory data:', err);
      setError(
        typeof err === 'string'
          ? err
          : err?.message || 'Unable to communicate with the BloodCare inventory service.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Aggregated totals directly computed from API data
  const totals = useMemo(() => {
    return aggregateInventoryData(summaryList);
  }, [summaryList]);

  // Filtered and sorted unit records
  const filteredUnits = useMemo(() => {
    let result = [...availableUnits];

    // Filter by Search (Unit ID)
    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase();
      result = result.filter((u) => {
        const idMatch = String(u.unit_id).includes(q) || `unit-${u.unit_id}`.toLowerCase().includes(q);
        const groupMatch = u.blood_group?.toLowerCase().includes(q);
        return idMatch || groupMatch;
      });
    }

    // Filter by Blood Group
    if (bloodGroupFilter !== 'ALL') {
      result = result.filter((u) => u.blood_group === bloodGroupFilter);
    }

    // Sort by Expiration Date
    result.sort((a, b) => {
      const dateA = new Date(a.expiry_date || 0).getTime();
      const dateB = new Date(b.expiry_date || 0).getTime();
      return expirySort === 'ASC' ? dateA - dateB : dateB - dateA;
    });

    return result;
  }, [availableUnits, searchTerm, bloodGroupFilter, expirySort]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, bloodGroupFilter, expirySort]);

  // Handle drilldown trigger
  const handleSelectGroup = (item) => {
    setSelectedGroup(item);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setBloodGroupFilter('ALL');
    setExpirySort('ASC');
  };

  // ── Render: Full Loading State ──
  if (loading) {
    return (
      <div className="space-y-8 pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-page-title">Inventory</h1>
            <p className="text-page-subtitle">Blood stock and unit availability overview</p>
          </div>
        </div>
        <InventorySkeleton />
      </div>
    );
  }

  // ── Render: Error State (Backend down / network error) ──
  if (error) {
    return (
      <div className="space-y-8 pb-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-page-title">Inventory</h1>
            <p className="text-page-subtitle">Blood stock and unit availability overview</p>
          </div>
        </div>

        <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-8 bg-surface-white rounded-3xl border border-border-card shadow-card-clean max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-brand-blood mb-4">
            <ServerCrash className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-text-main mb-1.5">
            Inventory Service Unavailable
          </h2>
          <p className="text-xs text-text-muted mb-4 leading-relaxed">
            {error}
          </p>
          <p className="text-[11px] text-text-muted/70 mb-6">
            Ensure the BloodCare backend is active at <code className="font-mono text-brand-blood">http://localhost:5000/api</code>
          </p>
          <button
            type="button"
            onClick={() => fetchData()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-blood text-white text-xs font-semibold hover:bg-brand-blood-dark transition-colors shadow-active-nav"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retry Connection</span>
          </button>
        </div>
      </div>
    );
  }

  const isFilterActive = Boolean(searchTerm.trim()) || bloodGroupFilter !== 'ALL' || expirySort !== 'ASC';
  const hasZeroUnits = availableUnits.length === 0;

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-page-title">Inventory</h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-brand-blood/10 text-brand-blood border border-brand-blood/20">
              <Layers className="w-3 h-3" />
              Command Center
            </span>
          </div>
          <p className="text-page-subtitle">
            Current stock overview and unit availability across storage reserves
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-white border border-border-card text-xs font-semibold text-text-main hover:bg-workspace-bg transition-colors shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-text-muted ${refreshing ? 'animate-spin text-brand-blood' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh Stock'}</span>
          </button>
        </div>
      </div>

      {/* 2. Inventory Status Hero */}
      <InventoryHero
        totals={totals}
        inventory={summaryList}
        onSelectGroup={handleSelectGroup}
      />

      {/* 3. Attention / Low Stock Area */}
      <InventoryAlerts
        inventory={summaryList}
        onSelectGroup={handleSelectGroup}
      />

      {/* 4. Blood Group Matrix */}
      <BloodGroupMatrix
        inventory={summaryList}
        selectedGroup={selectedGroup}
        onSelectGroup={handleSelectGroup}
      />

      {/* 5. Available Units Section (Filter Toolbar + Table) */}
      <div className="space-y-4 pt-2">
        <div>
          <h2 className="text-base font-bold text-text-main">
            Tested &amp; Available Unit Batches
          </h2>
          <p className="text-xs text-text-muted">
            Individual tested units currently marked as Available in storage
          </p>
        </div>

        {/* Filter Toolbar */}
        {!hasZeroUnits && (
          <InventoryFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            bloodGroupFilter={bloodGroupFilter}
            onBloodGroupChange={setBloodGroupFilter}
            expirySort={expirySort}
            onExpirySortChange={setExpirySort}
            bloodGroups={summaryList}
            totalUnitsCount={availableUnits.length}
            filteredCount={filteredUnits.length}
            onClearFilters={handleClearFilters}
          />
        )}

        {/* Unit Data Table / Empty States */}
        {hasZeroUnits ? (
          <InventoryEmptyState isFiltered={false} />
        ) : filteredUnits.length === 0 ? (
          <InventoryEmptyState
            isFiltered={isFilterActive}
            onClearFilters={handleClearFilters}
          />
        ) : (
          <InventoryTable
            units={filteredUnits}
            currentPage={currentPage}
            pageSize={PAGE_SIZE}
            totalItems={filteredUnits.length}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      {/* 6. Blood Group Drilldown Inspection Modal */}
      {selectedGroup && (
        <InventoryDetailModal
          bloodGroupItem={selectedGroup}
          onClose={() => setSelectedGroup(null)}
        />
      )}
    </div>
  );
}
