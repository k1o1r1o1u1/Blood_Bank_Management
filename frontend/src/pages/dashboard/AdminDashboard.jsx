import React, { useState, useEffect } from 'react';
import { 
  Users, Droplet, Building2, Send, AlertTriangle, Clock, 
  Shield, CheckCircle2, ChevronRight, RefreshCw, AlertCircle
} from 'lucide-react';
import { dashboardService } from '../../services/api';

export default function AdminDashboard({ user }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await dashboardService.getAdminDashboard();
      if (res && res.success) {
        setData(res.data);
      } else {
        setError(res.message || 'Failed to fetch admin metrics');
      }
    } catch (err) {
      setError(typeof err === 'string' ? err : err.message || 'Error loading dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-32 bg-white rounded-3xl border border-[#EFEBE4]" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-28 bg-white rounded-2xl border border-[#EFEBE4]" />)}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 bg-white rounded-3xl border border-red-200 text-center space-y-4">
        <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
        <h3 className="text-base font-semibold text-gray-900">Failed to load Admin Dashboard</h3>
        <p className="text-xs text-gray-500">{error}</p>
        <button
          onClick={fetchAdminData}
          className="px-4 py-2 bg-[#181415] text-white text-xs font-semibold rounded-xl inline-flex items-center gap-2"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  const { kpis, expiring_units, inventory, staff, recent_issues } = data;

  return (
    <div className="space-y-6">
      {/* Executive Welcome Hero */}
      <div className="bg-[#181415] text-white rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-medium border border-purple-500/30">
            <Shield className="w-3.5 h-3.5" />
            <span>Administrator Control Center</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            Welcome back, {user?.name || 'Director'}
          </h1>
          <p className="text-xs sm:text-sm text-[#A89F91] max-w-xl">
            System-wide operational oversight: audit logs, cold-chain storage health, staff privileges, and compliance tracking.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={fetchAdminData}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-medium flex items-center gap-2 transition-colors border border-white/10"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Live Data</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {[
          { label: 'Total Donors', value: kpis.total_donors, icon: Users, color: 'text-rose-600', bg: 'bg-rose-50' },
          { label: 'Total Units', value: kpis.total_units, icon: Droplet, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Available Stock', value: kpis.available_units, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Pending Requisitions', value: kpis.pending_requests, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Partner Hospitals', value: kpis.total_hospitals, icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Dispatched Issues', value: kpis.total_issues, icon: Send, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white p-4 rounded-2xl border border-[#EFEBE4] shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-medium text-[#7E7678] truncate">{stat.label}</span>
                <div className={`w-7 h-7 rounded-lg ${stat.bg} ${stat.color} flex items-center justify-center`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <span className="text-xl sm:text-2xl font-bold text-[#181415] tracking-tight">{stat.value}</span>
            </div>
          );
        })}
      </div>

      {/* Two Column Section: Cold Inventory Matrix & Critical Warnings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cold Storage Matrix (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-[#EFEBE4] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#181415]">Cold-Chain Blood Inventory Matrix</h2>
              <p className="text-xs text-[#7E7678]">Real-time stock breakdown across all 8 ABO/Rh blood groups</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-[#FAF8F5] border border-[#EFEBE4] rounded-lg text-[#181415]">
              8 Groups Monitored
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {inventory?.map((item) => (
              <div key={item.blood_group_id} className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EFEBE4] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-[#C52233]">{item.blood_group}</span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    item.available_units === 0 ? 'bg-red-100 text-red-700' :
                    item.available_units < 3 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {item.available_units === 0 ? 'Depleted' : `${item.available_units} Ready`}
                  </span>
                </div>
                <div className="text-[11px] text-[#7E7678] space-y-0.5">
                  <div className="flex justify-between">
                    <span>Reserved:</span>
                    <span className="font-medium text-[#181415]">{item.reserved_units || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Issued:</span>
                    <span className="font-medium text-[#181415]">{item.issued_units || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Expired:</span>
                    <span className="font-medium text-[#181415]">{item.expired_units || 0}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Expiring Units & Critical Alerts (1 col) */}
        <div className="bg-white rounded-3xl border border-[#EFEBE4] p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-amber-600">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <h2 className="text-base font-bold text-[#181415]">Expiring Soon (7 Days)</h2>
          </div>
          <p className="text-xs text-[#7E7678]">Units reaching the 42-day whole blood expiration threshold</p>

          <div className="space-y-2.5 pt-1">
            {expiring_units && expiring_units.length > 0 ? (
              expiring_units.map((u) => (
                <div key={u.unit_id} className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/60 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-[#181415]">Unit #{u.unit_id} ({u.blood_group})</span>
                    <span className="text-[11px] text-[#7E7678] block">Expires on: {u.expiry_date}</span>
                  </div>
                  <span className="px-2 py-1 rounded-lg bg-amber-100 text-amber-800 font-bold text-[10px]">
                    {u.days_left === 0 ? 'Expires Today' : `${u.days_left}d left`}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-xs text-[#7E7678] bg-[#FAF8F5] rounded-2xl border border-[#EFEBE4]">
                <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
                <span>Zero units expiring in the next 7 days</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Staff Management & System Audits */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Staff Accounts */}
        <div className="bg-white rounded-3xl border border-[#EFEBE4] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-purple-600" />
              <h2 className="text-base font-bold text-[#181415]">Staff Team & Access Roles</h2>
            </div>
            <span className="text-xs text-[#7E7678]">{staff?.length || 0} Accounts</span>
          </div>

          <div className="divide-y divide-[#EFEBE4]">
            {staff?.map((s) => (
              <div key={s.staff_id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-[#181415]">{s.name}</span>
                  <span className="text-[#7E7678] block text-[11px]">{s.email} • {s.phone || 'No phone'}</span>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                  s.role === 'Admin' 
                    ? 'bg-purple-100 text-purple-800 border-purple-200' 
                    : 'bg-teal-100 text-teal-800 border-teal-200'
                }`}>
                  {s.role}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Atomic Blood Dispatches (Audit Trail) */}
        <div className="bg-white rounded-3xl border border-[#EFEBE4] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Send className="w-4 h-4 text-blue-600" />
              <h2 className="text-base font-bold text-[#181415]">Recent Dispatches (Audit Trail)</h2>
            </div>
            <span className="text-xs text-[#7E7678]">ACID Transactions</span>
          </div>

          <div className="divide-y divide-[#EFEBE4]">
            {recent_issues && recent_issues.length > 0 ? (
              recent_issues.map((issue) => (
                <div key={issue.issue_id} className="py-3 flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <span className="font-semibold text-[#181415]">{issue.hospital_name}</span>
                    <span className="text-[11px] text-[#7E7678] block">
                      Unit #{issue.unit_id} ({issue.blood_group}) • Issued by: {issue.issued_by_name || 'Staff'}
                    </span>
                  </div>
                  <span className="text-[11px] font-medium text-[#7E7678] bg-[#FAF8F5] px-2.5 py-1 rounded-lg border border-[#EFEBE4]">
                    {issue.issue_date}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-[#7E7678] py-4 text-center">No blood dispatches recorded yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

