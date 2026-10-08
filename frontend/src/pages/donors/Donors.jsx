import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  ArrowRight,
  RefreshCw,
  Phone,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  UserCheck,
  UserX,
  Sparkles,
} from 'lucide-react';

import { donorService } from '../../services/api';
import {
  getDonorEligibility,
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

const ITEMS_PER_PAGE = 8;

export default function Donors() {
  const navigate = useNavigate();

  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBloodGroup, setSelectedBloodGroup] = useState('ALL');
  const [selectedEligibility, setSelectedEligibility] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch donors on mount
  const fetchDonors = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await donorService.getAll();
      setDonors(response.data || []);
    } catch (err) {
      console.error('Failed to load donors:', err);
      setError(err?.message || 'Could not fetch donors from backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonors();
  }, []);

  // Compute Overview statistics across all donors strictly from real database fields
  const overviewStats = useMemo(() => {
    let active = 0;
    let newDonors = 0;
    let ageQualified = 0;

    donors.forEach((donor) => {
      if (donor.last_donation_date) active += 1;
      else newDonors += 1;

      if (donor.age >= 18 && donor.age <= 65) ageQualified += 1;
    });

    return {
      total: donors.length,
      active,
      newDonors,
      ageQualified,
    };
  }, [donors]);

  // Filter donors
  const filteredDonors = useMemo(() => {
    return donors.filter((donor) => {
      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesName = donor.name?.toLowerCase().includes(query);
        const matchesPhone = donor.phone?.toLowerCase().includes(query);
        const matchesAddress = donor.address?.toLowerCase().includes(query);
        const matchesId = `don-${donor.donor_id}`.toLowerCase().includes(query);
        const matchesBlood = donor.blood_group?.toLowerCase().includes(query);
        if (!matchesName && !matchesPhone && !matchesAddress && !matchesId && !matchesBlood) {
          return false;
        }
      }

      // Blood Group filter
      if (selectedBloodGroup !== 'ALL' && donor.blood_group !== selectedBloodGroup) {
        return false;
      }

      // Status filter
      if (selectedEligibility !== 'ALL') {
        const elig = getDonorEligibility(donor);
        if (selectedEligibility === 'ACTIVE' && elig.status !== 'Active') return false;
        if (selectedEligibility === 'NEW' && elig.status !== 'New Donor') return false;
        if (selectedEligibility === 'AGE_INELIGIBLE' && elig.status !== 'Age Ineligible') return false;
      }

      return true;
    });
  }, [donors, searchTerm, selectedBloodGroup, selectedEligibility]);

  // Reset page on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedBloodGroup, selectedEligibility]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredDonors.length / ITEMS_PER_PAGE) || 1;
  const paginatedDonors = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredDonors.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredDonors, currentPage]);

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header Bar with Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface-white rounded-[22px] p-6 lg:p-7 border border-border-card shadow-card-clean">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-brand-blood-light border border-brand-blood/20 text-brand-blood text-[11px] font-semibold tracking-wide">
            <Users className="w-3.5 h-3.5" />
            <span>Donor Registry</span>
          </div>
          <h1 className="text-2xl font-bold text-text-main tracking-tight">
            Donor Directory
          </h1>
          <p className="text-xs sm:text-sm text-text-muted">
            Manage donor records, clinical eligibility, and historical intake
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="md"
            icon={RefreshCw}
            onClick={fetchDonors}
            disabled={loading}
            className="hover:border-brand-blood/40"
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="md"
            icon={UserPlus}
            onClick={() => navigate('/donors/add')}
            className="bg-brand-blood hover:bg-brand-blood-dark text-white shadow-active-nav"
          >
            Add Donor
          </Button>
        </div>
      </div>

      {/* 2. DONOR OVERVIEW STATS BAR */}
      <div className="bg-surface-white rounded-[22px] p-5 lg:p-6 border border-border-card shadow-card-clean">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-border-card">
          <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">
            Donor Overview
          </span>
          <span className="text-xs text-text-muted">
            Synchronized with database
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {/* Total Donors */}
          <div className="p-4 rounded-xl bg-workspace-bg border border-border-card/60 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-brand-blood/10 text-brand-blood flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-2xl font-bold text-text-main block leading-tight">
                {overviewStats.total.toLocaleString()}
              </span>
              <span className="text-xs text-text-muted font-medium">Total Donors</span>
            </div>
          </div>

          {/* Active Donors */}
          <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/60 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-2xl font-bold text-emerald-700 block leading-tight">
                {overviewStats.active.toLocaleString()}
              </span>
              <span className="text-xs text-emerald-800 font-medium">Active (Donated)</span>
            </div>
          </div>

          {/* New Registered */}
          <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200/60 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-2xl font-bold text-blue-700 block leading-tight">
                {overviewStats.newDonors.toLocaleString()}
              </span>
              <span className="text-xs text-blue-800 font-medium">First-Time Donors</span>
            </div>
          </div>

          {/* Age 18–65 Qualified */}
          <div className="p-4 rounded-xl bg-workspace-bg border border-border-card/60 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-brand-blood-light text-brand-blood flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-2xl font-bold text-text-main block leading-tight">
                {overviewStats.ageQualified.toLocaleString()}
              </span>
              <span className="text-xs text-text-muted font-medium">Age 18–65 Qualified</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Filter and Search Controls */}
      <div className="bg-surface-white rounded-[22px] p-5 border border-border-card shadow-card-clean flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search donors by name, phone, address, ID..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-workspace-bg border border-border-card text-xs sm:text-sm text-text-main placeholder-text-muted/70 focus:outline-none focus:border-brand-blood focus:ring-1 focus:ring-brand-blood transition-all"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-muted hover:text-text-main"
            >
              Clear
            </button>
          )}
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Blood Group Select */}
          <div className="relative">
            <select
              value={selectedBloodGroup}
              onChange={(e) => setSelectedBloodGroup(e.target.value)}
              className="appearance-none bg-workspace-bg border border-border-card text-text-main text-xs font-semibold rounded-xl px-3.5 py-2.5 pr-8 focus:outline-none focus:border-brand-blood transition-colors cursor-pointer"
            >
              <option value="ALL">All Blood Groups</option>
              {BLOOD_GROUPS.map((bg) => (
                <option key={bg} value={bg}>
                  Blood Group: {bg}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted text-[10px]">
              ▼
            </div>
          </div>

          {/* Status Select */}
          <div className="relative">
            <select
              value={selectedEligibility}
              onChange={(e) => setSelectedEligibility(e.target.value)}
              className="appearance-none bg-workspace-bg border border-border-card text-text-main text-xs font-semibold rounded-xl px-3.5 py-2.5 pr-8 focus:outline-none focus:border-brand-blood transition-colors cursor-pointer"
            >
              <option value="ALL">All Donors</option>
              <option value="ACTIVE">Active (Donated)</option>
              <option value="NEW">New (First-Time)</option>
              <option value="AGE_INELIGIBLE">Age Ineligible (&lt;18 or &gt;65)</option>
            </select>
            <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted text-[10px]">
              ▼
            </div>
          </div>

          {(searchTerm || selectedBloodGroup !== 'ALL' || selectedEligibility !== 'ALL') && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setSelectedBloodGroup('ALL');
                setSelectedEligibility('ALL');
              }}
              className="px-3 py-2 text-xs font-semibold text-brand-blood hover:bg-brand-blood-light rounded-xl transition-colors"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* 4. DONOR DIRECTORY TABLE */}
      <div className="bg-surface-white rounded-[22px] border border-border-card shadow-card-clean overflow-hidden">
        <div className="px-6 py-4 border-b border-border-card flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-text-main">Donor Directory</h2>
            <p className="text-xs text-text-muted">
              Showing {filteredDonors.length} registered donor{filteredDonors.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Loading state */}
        {loading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse flex items-center justify-between p-3 bg-workspace-bg rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#EAE3DE]" />
                  <div className="space-y-2">
                    <div className="w-32 h-4 rounded bg-[#EAE3DE]" />
                    <div className="w-20 h-3 rounded bg-[#F2EDE9]" />
                  </div>
                </div>
                <div className="w-16 h-6 rounded bg-[#EAE3DE]" />
                <div className="w-24 h-4 rounded bg-[#EAE3DE]" />
              </div>
            ))}
          </div>
        ) : error ? (
          /* Error state */
          <div className="p-12 text-center space-y-3">
            <AlertCircle className="w-10 h-10 text-brand-blood mx-auto" />
            <h3 className="text-base font-bold text-text-main">Failed to load donors</h3>
            <p className="text-xs text-text-muted max-w-sm mx-auto">{error}</p>
            <Button variant="secondary" size="sm" onClick={fetchDonors}>
              Try Again
            </Button>
          </div>
        ) : filteredDonors.length === 0 ? (
          /* Empty state */
          <div className="p-16 text-center space-y-3">
            <Users className="w-12 h-12 text-text-muted/40 mx-auto" />
            <h3 className="text-base font-bold text-text-main">No donors found</h3>
            <p className="text-xs text-text-muted max-w-sm mx-auto">
              {searchTerm || selectedBloodGroup !== 'ALL' || selectedEligibility !== 'ALL'
                ? 'No donor matches your search and filter criteria. Try resetting filters.'
                : 'No donor records currently exist in the database. Add the first donor to get started.'}
            </p>
            <Button
              variant="primary"
              size="sm"
              icon={UserPlus}
              onClick={() => navigate('/donors/add')}
              className="bg-brand-blood hover:bg-brand-blood-dark text-white shadow-active-nav mt-2"
            >
              Add First Donor
            </Button>
          </div>
        ) : (
          /* Real Table */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-workspace-bg/80 border-b border-border-card text-[11px] font-semibold text-text-muted uppercase tracking-wider">
                  <th className="py-3 px-6">Donor Details</th>
                  <th className="py-3 px-4">Blood Group</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Last Donation</th>
                  <th className="py-3 px-4">Clinical Status</th>
                  <th className="py-3 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-card/60 text-xs sm:text-sm">
                {paginatedDonors.map((donor) => {
                  const elig = getDonorEligibility(donor);
                  const bgBadgeColor = BLOOD_GROUP_COLORS[donor.blood_group] ?? defaultGroupColor;

                  return (
                    <tr
                      key={donor.donor_id}
                      onClick={() => navigate(`/donors/${donor.donor_id}`)}
                      className="hover:bg-[#FFF8F9] transition-colors cursor-pointer group"
                    >
                      {/* Avatar & Donor Info */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <Avatar
                            name={donor.name}
                            size="md"
                            className="bg-[#1C1315] text-white ring-1 ring-border-card shrink-0"
                          />
                          <div className="min-w-0">
                            <span className="font-bold text-text-main group-hover:text-brand-blood transition-colors block truncate">
                              {donor.name}
                            </span>
                            <span className="text-[11px] text-text-muted block">
                              #DON-{donor.donor_id} • {donor.age} yrs • {donor.gender || 'Not specified'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Blood Group */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-white font-bold text-xs shadow-2xs"
                          style={{ backgroundColor: bgBadgeColor }}
                        >
                          {donor.blood_group}
                        </span>
                      </td>

                      {/* Contact */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-text-main font-medium">
                            <Phone className="w-3 h-3 text-text-muted" />
                            <span>{formatPhoneNumber(donor.phone)}</span>
                          </div>
                          <span className="text-[11px] text-text-muted truncate block max-w-[180px]">
                            {donor.address || 'Address unrecorded'}
                          </span>
                        </div>
                      </td>

                      {/* Last Donation */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-text-muted text-xs">
                          <Calendar className="w-3.5 h-3.5 text-text-muted" />
                          <span>
                            {donor.last_donation_date
                              ? formatShortDate(donor.last_donation_date)
                              : 'Never (New)'}
                          </span>
                        </div>
                      </td>

                      {/* Registration Status */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold border ${elig.badgeClass}`}
                        >
                          {elig.status === 'Active' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                          {elig.status === 'New Donor' && <Sparkles className="w-3 h-3 text-blue-600" />}
                          {elig.status === 'Age Ineligible' && <AlertCircle className="w-3 h-3 text-brand-blood" />}
                          <span>{elig.status}</span>
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <div className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-workspace-bg group-hover:bg-brand-blood group-hover:text-white text-text-muted transition-all">
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* 5. Pagination Bar */}
        {!loading && !error && filteredDonors.length > 0 && (
          <div className="px-6 py-4 border-t border-border-card flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-text-muted bg-surface-white">
            <div>
              Showing{' '}
              <strong className="text-text-main">
                {(currentPage - 1) * ITEMS_PER_PAGE + 1}
              </strong>{' '}
              to{' '}
              <strong className="text-text-main">
                {Math.min(currentPage * ITEMS_PER_PAGE, filteredDonors.length)}
              </strong>{' '}
              of <strong className="text-text-main">{filteredDonors.length}</strong> donors
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-border-card hover:bg-workspace-bg disabled:opacity-40 disabled:cursor-not-allowed text-text-main transition-colors"
                aria-label="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
                    currentPage === page
                      ? 'bg-brand-blood text-white shadow-xs'
                      : 'border border-border-card hover:bg-workspace-bg text-text-main'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-border-card hover:bg-workspace-bg disabled:opacity-40 disabled:cursor-not-allowed text-text-main transition-colors"
                aria-label="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
