import React, { useState, useEffect } from 'react';
import { 
  Building2, PlusCircle, Clock, CheckCircle2, AlertTriangle, 
  Send, Droplet, RefreshCw, AlertCircle, X, Loader2
} from 'lucide-react';
import { dashboardService, requestService, bloodGroupService } from '../../services/api';

export default function HospitalDashboard({ user }) {
  const [data, setData] = useState(null);
  const [bloodGroups, setBloodGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // New Request Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState('1');
  const [quantity, setQuantity] = useState(1);
  const [urgency, setUrgency] = useState('Critical');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState('');

  const fetchHospitalData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [dashRes, bgRes] = await Promise.all([
        dashboardService.getHospitalDashboard(),
        bloodGroupService.getAll()
      ]);

      if (dashRes && dashRes.success) {
        setData(dashRes.data);
      } else {
        setError(dashRes.message || 'Failed to fetch hospital portal data');
      }

      if (bgRes && bgRes.success) {
        setBloodGroups(bgRes.data);
        if (bgRes.data.length > 0) setSelectedGroup(String(bgRes.data[0].blood_group_id));
      }
    } catch (err) {
      setError(typeof err === 'string' ? err : err.message || 'Error loading dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitalData();
  }, []);

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setSubmitSuccess('');
      const res = await requestService.create({
        hospital_id: data?.hospital?.hospital_id || user?.hospital_id,
        blood_group_id: parseInt(selectedGroup, 10),
        quantity_required: parseInt(quantity, 10),
        urgency
      });

      if (res && res.success) {
        setSubmitSuccess('Requisition submitted successfully! Tracking in real-time below.');
        setTimeout(() => {
          setIsModalOpen(false);
          setSubmitSuccess('');
        }, 1200);
        await fetchHospitalData();
      }
    } catch (err) {
      alert(`Requisition error: ${err.message || err}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-32 bg-white rounded-3xl border border-[#EFEBE4]" />
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
        <h3 className="text-base font-semibold text-gray-900">Failed to load Hospital Portal</h3>
        <p className="text-xs text-gray-500">{error}</p>
        <button
          onClick={fetchHospitalData}
          className="px-4 py-2 bg-[#181415] text-white text-xs font-semibold rounded-xl inline-flex items-center gap-2"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  const { hospital, stats, requests, dispatches, stock_availability } = data;

  return (
    <div className="space-y-6">
      {/* Hospital Portal Hero Banner */}
      <div className="bg-[#102A43] text-white rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm border border-blue-900/40">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-medium border border-blue-500/30">
            <Building2 className="w-3.5 h-3.5" />
            <span>Healthcare Partner Portal</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            {hospital?.name || user?.name || 'Hospital Requisition Desk'}
          </h1>
          <p className="text-xs sm:text-sm text-blue-100/70 max-w-xl">
            {hospital?.address} • Emergency Contact: <span className="text-white font-medium">{hospital?.contact}</span>
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-3 rounded-2xl bg-[#C52233] hover:bg-[#A61C2E] text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-[#C52233]/40 transition-all cursor-pointer shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Raise Blood Requisition</span>
        </button>
      </div>

      {/* Requisition Status Counter Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#EFEBE4] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-[#7E7678] block">Total Hospital Requests</span>
            <span className="text-2xl font-bold text-[#181415] mt-1 block">{stats.total_requests}</span>
            <span className="text-[11px] text-[#7E7678]">All historical submissions</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#EFEBE4] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-[#7E7678] block">Active / In Progress</span>
            <span className="text-2xl font-bold text-amber-600 mt-1 block">{stats.pending_requests}</span>
            <span className="text-[11px] text-amber-600 font-medium">Under processing & cross-match</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#EFEBE4] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-[#7E7678] block">Fulfilled & Dispatched</span>
            <span className="text-2xl font-bold text-emerald-600 mt-1 block">{stats.completed_requests}</span>
            <span className="text-[11px] text-emerald-600 font-medium">Successfully received units</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Two Column Section: Live Request Tracker & Stock Availability Guide */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Requisitions List & Tracking (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-[#EFEBE4] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#181415]">Live Requisitions Tracker</h2>
              <p className="text-xs text-[#7E7678]">Real-time status updates from request to blood bank issue</p>
            </div>
            <span className="text-xs font-semibold px-3 py-1 bg-[#FAF8F5] border border-[#EFEBE4] rounded-lg text-[#181415]">
              {requests?.length || 0} Records
            </span>
          </div>

          <div className="divide-y divide-[#EFEBE4]">
            {requests && requests.length > 0 ? (
              requests.map((r) => {
                const isCompleted = r.status === 'Completed';
                const isApproved = r.status === 'Approved';
                const isRejected = r.status === 'Rejected';

                return (
                  <div key={r.request_id} className="py-4 space-y-2.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2.5">
                        <span className="font-bold text-sm text-[#181415]">Requisition #{r.request_id}</span>
                        <span className="px-2 py-0.5 rounded-md bg-red-100 text-[#C52233] font-bold text-xs">
                          {r.quantity_required} x {r.blood_group}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          r.urgency === 'Critical' ? 'bg-red-100 text-red-800' :
                          r.urgency === 'Urgent' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {r.urgency}
                        </span>
                      </div>
                      <span className="text-[#7E7678] text-[11px]">Requested: {r.request_date}</span>
                    </div>

                    {/* Visual 3-Stage Progress Tracker */}
                    <div className="grid grid-cols-3 gap-2 text-center text-[10px] pt-1">
                      <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200">
                        ✓ 1. Submitted
                      </div>
                      <div className={`p-1.5 rounded-lg font-semibold border ${
                        isRejected ? 'bg-red-50 text-red-800 border-red-200' :
                        (isApproved || isCompleted) ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                        'bg-amber-50 text-amber-800 border-amber-200 animate-pulse'
                      }`}>
                        {isRejected ? '✗ Rejected' : (isApproved || isCompleted) ? '✓ 2. Approved' : '⏳ 2. Under Review'}
                      </div>
                      <div className={`p-1.5 rounded-lg font-semibold border ${
                        isCompleted ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                        'bg-gray-50 text-gray-400 border-gray-200'
                      }`}>
                        {isCompleted ? '✓ 3. Dispatched & Received' : '○ 3. Awaiting Dispatch'}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-[#7E7678] py-6 text-center">No requisitions submitted yet. Click above to raise one.</p>
            )}
          </div>
        </div>

        {/* Real-Time Stock Availability Indicator (1 col) */}
        <div className="bg-white rounded-3xl border border-[#EFEBE4] p-6 shadow-xs space-y-4">
          <div>
            <h2 className="text-base font-bold text-[#181415]">Blood Bank Stock Guide</h2>
            <p className="text-xs text-[#7E7678]">Live available inventory in central refrigeration</p>
          </div>

          <div className="space-y-2 pt-1">
            {stock_availability?.map((s) => {
              const statusColor = s.available_units === 0 ? 'bg-red-500' :
                                  s.available_units < 3 ? 'bg-amber-500' : 'bg-emerald-500';
              const statusText = s.available_units === 0 ? 'Depleted' :
                                 s.available_units < 3 ? 'Limited Supply' : 'Abundant';

              return (
                <div key={s.blood_group} className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EFEBE4] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${statusColor}`} />
                    <span className="font-bold text-[#181415]">{s.blood_group}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-[#181415] block">{s.available_units} Units</span>
                    <span className="text-[10px] text-[#7E7678]">{statusText}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Dispatched Units Archive */}
      <div className="bg-white rounded-3xl border border-[#EFEBE4] p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Send className="w-4 h-4 text-emerald-600" />
          <h2 className="text-base font-bold text-[#181415]">Fulfilled Units Received (Audit Trail)</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {dispatches && dispatches.length > 0 ? (
            dispatches.map((d) => (
              <div key={d.issue_id} className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-200/60 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#181415]">Unit #{d.unit_id}</span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                    {d.blood_group}
                  </span>
                </div>
                <p className="text-[11px] text-[#7E7678]">For Requisition #{d.request_id}</p>
                <p className="text-[10px] text-[#7E7678]">Dispatched: {d.issue_date} • By: {d.issued_by_name || 'Staff'}</p>
              </div>
            ))
          ) : (
            <p className="text-xs text-[#7E7678] py-4 col-span-full text-center">No units dispatched yet.</p>
          )}
        </div>
      </div>

      {/* Raise Blood Requisition Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-xl border border-[#EFEBE4] animate-in fade-in-50 zoom-in-95 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#EFEBE4]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#C52233] text-white flex items-center justify-center">
                  <Droplet className="w-4 h-4 fill-white" />
                </div>
                <h3 className="font-bold text-base text-[#181415]">Raise Blood Requisition</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {submitSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{submitSuccess}</span>
              </div>
            )}

            <form onSubmit={handleCreateRequest} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-[#181415] mb-1">Required Blood Group</label>
                <select
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-[#DCD5CB] bg-white text-[#181415] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#C52233]"
                >
                  {bloodGroups.map((bg) => (
                    <option key={bg.blood_group_id} value={bg.blood_group_id}>
                      {bg.group_name} Blood
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-[#181415] mb-1">Quantity (Units Required)</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                  className="w-full h-10 px-3 rounded-xl border border-[#DCD5CB] bg-white text-[#181415] text-xs focus:outline-none focus:ring-2 focus:ring-[#C52233]"
                />
              </div>

              <div>
                <label className="block font-medium text-[#181415] mb-1">Clinical Urgency</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Normal', 'Urgent', 'Critical'].map((u) => (
                    <button
                      key={u}
                      type="button"
                      onClick={() => setUrgency(u)}
                      className={`py-2 px-2 rounded-xl font-bold border text-center transition-all ${
                        urgency === u
                          ? u === 'Critical' ? 'bg-red-600 text-white border-red-600' :
                            u === 'Urgent' ? 'bg-amber-500 text-white border-amber-500' :
                            'bg-blue-600 text-white border-blue-600'
                          : 'bg-[#FAF8F5] text-[#555] border-[#EFEBE4]'
                      }`}
                    >
                      {u}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-[#7E7678] hover:bg-[#FAF8F5] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-[#C52233] hover:bg-[#A61C2E] text-white font-bold flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  <span>Submit Request</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

