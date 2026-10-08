import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Droplet,
  PlusCircle,
  RefreshCw,
  AlertCircle,
  ServerCrash,
} from 'lucide-react';
import { donationService } from '../../services/api';
import DonationStats from '../../components/donations/DonationStats';
import DonationFilters from '../../components/donations/DonationFilters';
import DonationTable from '../../components/donations/DonationTable';
import DonationDetailModal from '../../components/donations/DonationDetailModal';
import DonationSkeleton from '../../components/donations/DonationSkeleton';
import DonationEmptyState from '../../components/donations/DonationEmptyState';
import Button from '../../components/ui/Button';

export default function Donations() {
  const navigate = useNavigate();

  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [bloodGroupFilter, setBloodGroupFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Selected donation for inspection & screening modal
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch all donations
  const fetchDonations = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await donationService.getAll();
      setDonations(res.data || []);
    } catch (err) {
      console.error('Failed to load donations:', err);
      setError(err?.message || 'Unable to retrieve donation records from backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  // Filter donations strictly against returned fields
  const filteredDonations = useMemo(() => {
    return donations.filter((d) => {
      // Search
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesDonor = d.donor_name?.toLowerCase().includes(query);
        const matchesId = `don-${d.donation_id}`.toLowerCase().includes(query) ||
          String(d.donation_id).includes(query);
        const matchesBlood = d.blood_group?.toLowerCase().includes(query);

        if (!matchesDonor && !matchesId && !matchesBlood) return false;
      }

      // Blood Group filter
      if (bloodGroupFilter !== 'ALL' && d.blood_group !== bloodGroupFilter) {
        return false;
      }

      // Screening status filter
      if (statusFilter !== 'ALL' && d.screening_status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [donations, searchTerm, bloodGroupFilter, statusFilter]);

  const hasActiveFilters =
    Boolean(searchTerm.trim()) ||
    bloodGroupFilter !== 'ALL' ||
    statusFilter !== 'ALL';

  const handleResetFilters = () => {
    setSearchTerm('');
    setBloodGroupFilter('ALL');
    setStatusFilter('ALL');
  };

  // Open inspection modal
  const handleSelectDonation = (donation) => {
    setSelectedDonation(donation);
    setIsModalOpen(true);
  };

  // Handle live status update from modal
  const handleStatusUpdated = (donationId, newStatus) => {
    setDonations((prev) =>
      prev.map((d) =>
        d.donation_id === donationId ? { ...d, screening_status: newStatus } : d
      )
    );
    if (selectedDonation && selectedDonation.donation_id === donationId) {
      setSelectedDonation((prev) => ({ ...prev, screening_status: newStatus }));
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header Bar with Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface-white rounded-[22px] p-6 lg:p-7 border border-border-card shadow-card-clean">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-brand-blood-light border border-brand-blood/20 text-brand-blood text-[11px] font-semibold tracking-wide">
            <Droplet className="w-3.5 h-3.5" />
            <span>Intake &amp; Screening Operations</span>
          </div>
          <h1 className="text-2xl font-bold text-text-main tracking-tight">
            Donation Operations
          </h1>
          <p className="text-xs sm:text-sm text-text-muted">
            Record blood collections and manage laboratory screening verification
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="md"
            icon={RefreshCw}
            onClick={fetchDonations}
            disabled={loading}
            className="hover:border-brand-blood/40"
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="md"
            icon={PlusCircle}
            onClick={() => navigate('/donations/add')}
            className="bg-brand-blood hover:bg-brand-blood-dark text-white shadow-active-nav"
          >
            Record Donation
          </Button>
        </div>
      </div>

      {/* 2. Overview Strip (Calculated from real API data) */}
      <DonationStats donations={donations} />

      {/* 3. Filter Toolbar */}
      <DonationFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        bloodGroupFilter={bloodGroupFilter}
        onBloodGroupChange={setBloodGroupFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        onResetFilters={handleResetFilters}
        totalCount={donations.length}
        filteredCount={filteredDonations.length}
      />

      {/* 4. Main Table / Empty State / Skeleton */}
      {loading ? (
        <div className="bg-surface-white rounded-[22px] border border-border-card shadow-card-clean overflow-hidden">
          <DonationSkeleton />
        </div>
      ) : error ? (
        /* Error State */
        <div className="bg-surface-white rounded-[22px] p-12 border border-border-card shadow-card-clean text-center space-y-4 max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-full bg-rose-50 border border-rose-200 text-brand-blood flex items-center justify-center mx-auto">
            <ServerCrash className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-text-main">
              Backend Unavailable
            </h3>
            <p className="text-xs text-text-muted leading-relaxed">
              {error}
            </p>
            <p className="text-[11px] text-text-muted opacity-80 pt-1">
              Check that the BloodCare server is running at <code className="font-mono text-brand-blood">http://localhost:5000</code>
            </p>
          </div>
          <Button
            variant="primary"
            size="md"
            icon={RefreshCw}
            onClick={fetchDonations}
            className="bg-brand-blood hover:bg-brand-blood-dark text-white shadow-active-nav"
          >
            Retry Connection
          </Button>
        </div>
      ) : filteredDonations.length === 0 ? (
        /* Empty State */
        <div className="bg-surface-white rounded-[22px] border border-border-card shadow-card-clean overflow-hidden">
          <DonationEmptyState
            isFiltered={hasActiveFilters}
            onResetFilters={handleResetFilters}
          />
        </div>
      ) : (
        /* Real Table */
        <DonationTable
          donations={filteredDonations}
          onSelectDonation={handleSelectDonation}
        />
      )}

      {/* 5. Detail & Screening Inspection Modal */}
      {isModalOpen && selectedDonation && (
        <DonationDetailModal
          donation={selectedDonation}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onStatusUpdated={handleStatusUpdated}
        />
      )}
    </div>
  );
}
