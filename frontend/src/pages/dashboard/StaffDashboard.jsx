import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Stethoscope, Clock, CheckCircle2, XCircle, AlertTriangle, 
  Droplet, Users, RefreshCw, AlertCircle, ArrowUpRight, PlusCircle, Check
} from 'lucide-react';
import { dashboardService, donationService } from '../../services/api';

export default function StaffDashboard({ user }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchStaffData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await dashboardService.getStaffDashboard();
      if (res && res.success) {
        setData(res.data);
      } else {
        setError(res.message || 'Failed to fetch staff operations queue');
      }
    } catch (err) {
      setError(typeof err === 'string' ? err : err.message || 'Error loading dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffData();
  }, []);

  const handleScreening = async (donationId, status) => {
    try {
      setActionLoading(donationId);
      await donationService.updateScreening(donationId, { screening_status: status });
      await fetchStaffData();
    } catch (err) {
      alert(`Screening update failed: ${err.message || err}`);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-28 bg-white rounded-3xl border border-[#EFEBE4]" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <div key={i} className="h-24 bg-white rounded-2xl border border-[#EFEBE4]" />)}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 bg-white rounded-3xl border border-red-200 text-center space-y-4">
        <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
        <h3 className="text-base font-semibold text-gray-900">Failed to load Staff Operations Queue</h3>
        <p className="text-xs text-gray-500">{error}</p>
        <button
          onClick={fetchStaffData}
          className="px-4 py-2 bg-[#181415] text-white text-xs font-semibold rounded-xl inline-flex items-center gap-2"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  const { summary, pending_screening_queue, active_requests_queue, inventory } = data;

  return (
    <div className="space-y-6">
      {/* Staff Hero Banner */}
      <div className="bg-[#1C2D27] text-white rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm border border-teal-900/40">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-medium border border-teal-500/30">
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Laboratory & Phlebotomy Workstation</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            Hello, {user?.name || 'Staff Member'}
          </h1>
          <p className="text-xs sm:text-sm text-teal-100/70 max-w-xl">
            Live clinical operational queues: process pending screening samples to release blood units, and dispatch available stock to hospital requests.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/donors/add"
            className="px-3.5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-600 text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Onboard Donor</span>
          </Link>
          <Link
            to="/donations/add"
            className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-2 border border-white/20 transition-colors"
          >
            <Droplet className="w-4 h-4 text-teal-300" />
            <span>Record Donation</span>
          </Link>
        </div>
      </div>

      {/* Operational Counter Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#EFEBE4] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-[#7E7678] block">Pending Laboratory Screening</span>
            <span className="text-2xl font-bold text-[#181415] mt-1 block">{summary.pending_screening_count}</span>
            <span className="text-[11px] text-amber-600 font-medium">Requires lab clearance</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#EFEBE4] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-[#7E7678] block">Critical Hospital Requisitions</span>
            <span className="text-2xl font-bold text-[#C52233] mt-1 block">{summary.critical_requests_count}</span>
            <span className="text-[11px] text-[#C52233] font-medium">Emergency priority dispatch</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#EFEBE4] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-[#7E7678] block">Available Unexpired Units</span>
            <span className="text-2xl font-bold text-emerald-600 mt-1 block">{summary.available_units_count}</span>
            <span className="text-[11px] text-emerald-600 font-medium">Ready for immediate issue</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Queue: Laboratory Screening Action Table */}
      <div className="bg-white rounded-3xl border border-[#EFEBE4] p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
              <h2 className="text-base font-bold text-[#181415]">Laboratory Screening Queue (Action Required)</h2>
            </div>
            <p className="text-xs text-[#7E7678] mt-0.5">
              Approving an intake automatically generates cold-chain blood units with a 42-day expiration date
            </p>
          </div>
          <span className="text-xs text-[#7E7678] bg-[#FAF8F5] px-3 py-1 rounded-xl border border-[#EFEBE4] self-start sm:self-auto font-medium">
            {pending_screening_queue?.length || 0} Awaiting Clearance
          </span>
        </div>

        {pending_screening_queue && pending_screening_queue.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#EFEBE4] text-[#7E7678] uppercase text-[10px] tracking-wider font-semibold">
                  <th className="py-2.5 px-3">Donation ID</th>
                  <th className="py-2.5 px-3">Donor Name</th>
                  <th className="py-2.5 px-3">Blood Group</th>
                  <th className="py-2.5 px-3">Collection Date</th>
                  <th className="py-2.5 px-3">Volume</th>
                  <th className="py-2.5 px-3 text-right">Laboratory Decision</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFEBE4]">
                {pending_screening_queue.map((row) => (
                  <tr key={row.donation_id} className="hover:bg-[#FAF8F5] transition-colors">
                    <td className="py-3 px-3 font-semibold text-[#181415]">#{row.donation_id}</td>
                    <td className="py-3 px-3 font-medium text-[#181415]">{row.donor_name}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-md bg-red-100 text-[#C52233] font-bold text-[11px]">
                        {row.blood_group}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-[#7E7678]">{row.donation_date}</td>
                    <td className="py-3 px-3 font-medium">{row.quantity} Unit(s)</td>
                    <td className="py-3 px-3 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          disabled={actionLoading === row.donation_id}
                          onClick={() => handleScreening(row.donation_id, 'Approved')}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                        <button
                          disabled={actionLoading === row.donation_id}
                          onClick={() => handleScreening(row.donation_id, 'Rejected')}
                          className="px-3 py-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-800 font-semibold text-xs flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-[#7E7678] bg-[#FAF8F5] rounded-2xl border border-[#EFEBE4]">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="font-semibold text-[#181415]">All donations have been screened!</p>
            <p className="text-[11px] text-[#7E7678] mt-0.5">No pending laboratory certifications in queue.</p>
          </div>
        )}
      </div>

      {/* Hospital Requisitions Queue & Stock Availability */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hospital Requisitions Awaiting Dispatch (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-[#EFEBE4] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#181415]">Hospital Requisitions Fulfillment Queue</h2>
              <p className="text-xs text-[#7E7678]">Pending & approved requests awaiting blood unit dispatch</p>
            </div>
            <Link
              to="/issues"
              className="text-xs font-semibold text-[#C52233] hover:underline flex items-center gap-1"
            >
              <span>Issue Blood</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-[#EFEBE4]">
            {active_requests_queue && active_requests_queue.length > 0 ? (
              active_requests_queue.map((req) => (
                <div key={req.request_id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#181415]">Request #{req.request_id}</span>
                      <span className="text-[#7E7678]">• {req.hospital_name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-[#7E7678]">
                      <span>Needs: <strong className="text-[#C52233]">{req.quantity_required} x {req.blood_group}</strong></span>
                      <span>•</span>
                      <span>Date: {req.request_date}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      req.urgency === 'Critical' ? 'bg-red-100 text-red-800' :
                      req.urgency === 'Urgent' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {req.urgency}
                    </span>
                    <Link
                      to="/issues"
                      className="px-3 py-1 rounded-lg bg-[#181415] hover:bg-[#333] text-white text-xs font-medium transition-colors"
                    >
                      Dispatch
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-[#7E7678] py-4 text-center">No pending requisitions awaiting fulfillment.</p>
            )}
          </div>
        </div>

        {/* Quick Inventory Availability Guide (1 col) */}
        <div className="bg-white rounded-3xl border border-[#EFEBE4] p-6 shadow-xs space-y-4">
          <div>
            <h2 className="text-base font-bold text-[#181415]">Available Stock Guide</h2>
            <p className="text-xs text-[#7E7678]">Ready-to-issue inventory counts</p>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            {inventory?.map((g) => (
              <div key={g.blood_group} className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EFEBE4] flex items-center justify-between">
                <span className="font-bold text-xs text-[#C52233]">{g.blood_group}</span>
                <span className={`text-xs font-bold ${g.available_units > 0 ? 'text-emerald-700' : 'text-gray-400'}`}>
                  {g.available_units} Units
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

