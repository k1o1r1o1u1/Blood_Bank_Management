import React, { useState, useEffect } from 'react';
import { 
  Heart, Droplet, Calendar, Award, CheckCircle2, Clock, 
  AlertTriangle, RefreshCw, AlertCircle, ShieldCheck, Sparkles, MapPin, Phone
} from 'lucide-react';
import { dashboardService } from '../../services/api';

export default function DonorDashboard({ user }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDonorData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await dashboardService.getDonorDashboard();
      if (res && res.success) {
        setData(res.data);
      } else {
        setError(res.message || 'Failed to fetch donor portal data');
      }
    } catch (err) {
      setError(typeof err === 'string' ? err : err.message || 'Error loading dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonorData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-44 bg-white rounded-3xl border border-[#EFEBE4]" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <div key={i} className="h-28 bg-white rounded-2xl border border-[#EFEBE4]" />)}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 bg-white rounded-3xl border border-red-200 text-center space-y-4">
        <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
        <h3 className="text-base font-semibold text-gray-900">Failed to load Donor Portal</h3>
        <p className="text-xs text-gray-500">{error}</p>
        <button
          onClick={fetchDonorData}
          className="px-4 py-2 bg-[#181415] text-white text-xs font-semibold rounded-xl inline-flex items-center gap-2"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  const { donor, stats, donations } = data;
  const livesImpacted = (stats.total_units_donated || 1) * 3;

  return (
    <div className="space-y-6">
      {/* Urgent Shortage Notice (if donor's group is low) */}
      {stats.is_urgent_shortage && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-red-600 to-[#C52233] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md shadow-red-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="text-sm font-bold">Urgent Blood Shortage: {donor.blood_group} Needed!</h4>
              <p className="text-xs text-white/90">
                Central blood bank inventory has only {stats.blood_group_available_stock} available unit(s) of {donor.blood_group}.
              </p>
            </div>
          </div>
          <span className="text-xs bg-white text-[#C52233] font-bold px-3 py-1.5 rounded-xl shrink-0 text-center">
            {stats.is_eligible ? 'Eligible to Donate Today' : `Next eligible: ${stats.next_eligible_date}`}
          </span>
        </div>
      )}

      {/* Top Section: Digital Donor Card & Eligibility Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Digital Wallet Donor Card (1 col) */}
        <div className="relative rounded-3xl bg-gradient-to-br from-[#1C1315] via-[#2B1E22] to-[#3D141A] text-white p-6 shadow-md border border-[#C52233]/30 overflow-hidden flex flex-col justify-between min-h-[220px]">
          {/* Subtle background blood drop watermark */}
          <Droplet className="absolute -right-6 -bottom-6 w-40 h-40 text-white/5 pointer-events-none" />

          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#C52233] flex items-center justify-center">
                <Heart className="w-3.5 h-3.5 text-white fill-white" />
              </div>
              <span className="text-xs font-bold tracking-wider uppercase text-white/80">BloodCare Donor Pass</span>
            </div>
            <div className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs text-xs font-bold border border-white/15">
              ID #{donor.donor_id}
            </div>
          </div>

          <div className="py-4 relative z-10 flex items-end justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white">{donor.name}</h2>
              <p className="text-xs text-white/70 flex items-center gap-1.5 mt-0.5">
                <Phone className="w-3 h-3" />
                <span>{donor.phone}</span>
              </p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-[#C52233] text-white flex flex-col items-center justify-center shadow-lg shadow-[#C52233]/40 border border-white/20">
              <span className="text-lg font-black leading-none">{donor.blood_group}</span>
              <span className="text-[9px] font-semibold text-white/80 mt-0.5">GROUP</span>
            </div>
          </div>

          <div className="pt-3 border-t border-white/15 flex items-center justify-between text-[11px] text-white/70 relative z-10">
            <span>Volunteer Blood Hero</span>
            <span className="flex items-center gap-1 text-emerald-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Certified Donor</span>
            </span>
          </div>
        </div>

        {/* Eligibility & Impact Counters (2 cols) */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Eligibility Gauge */}
          <div className="bg-white rounded-3xl border border-[#EFEBE4] p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#7E7678]">Donation Eligibility</span>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                stats.is_eligible ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
              }`}>
                {stats.is_eligible ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
              </div>
            </div>

            <div className="my-3">
              {stats.is_eligible ? (
                <div>
                  <span className="text-lg font-bold text-emerald-700 block">Ready to Donate!</span>
                  <p className="text-[11px] text-[#7E7678] mt-1">
                    Your 90-day biological cooldown interval is complete.
                  </p>
                </div>
              ) : (
                <div>
                  <span className="text-2xl font-black text-amber-600 block">{stats.days_until_eligible} Days</span>
                  <p className="text-[11px] text-[#7E7678] mt-1">
                    Cooldown remaining until: <strong className="text-[#181415]">{stats.next_eligible_date}</strong>
                  </p>
                </div>
              )}
            </div>

            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full text-center ${
              stats.is_eligible ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
            }`}>
              {stats.is_eligible ? 'Eligible for Whole Blood' : '90-Day Standard Interval'}
            </span>
          </div>

          {/* Contributions Count */}
          <div className="bg-white rounded-3xl border border-[#EFEBE4] p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#7E7678]">Total Contributions</span>
              <div className="w-8 h-8 rounded-xl bg-rose-50 text-[#C52233] flex items-center justify-center">
                <Droplet className="w-4 h-4" />
              </div>
            </div>

            <div className="my-3">
              <span className="text-3xl font-black text-[#181415] block">{stats.total_units_donated}</span>
              <span className="text-[11px] text-[#7E7678] block mt-0.5">
                Physical whole blood unit(s) donated across {stats.total_donations} session(s)
              </span>
            </div>

            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-rose-50 text-[#C52233] text-center border border-rose-100">
              Last Donation: {donor.last_donation_date || 'N/A'}
            </span>
          </div>

          {/* Estimated Lives Impacted */}
          <div className="bg-white rounded-3xl border border-[#EFEBE4] p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#7E7678]">Lives Impacted</span>
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>

            <div className="my-3">
              <span className="text-3xl font-black text-purple-600 block">~{livesImpacted}</span>
              <span className="text-[11px] text-[#7E7678] block mt-0.5">
                Every unit can be separated into RBCs, Platelets & Plasma to save up to 3 lives.
              </span>
            </div>

            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 text-center border border-purple-100">
              Community Guardian Badge
            </span>
          </div>
        </div>
      </div>

      {/* Donation History Timeline */}
      <div className="bg-white rounded-3xl border border-[#EFEBE4] p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#C52233]" />
            <h2 className="text-base font-bold text-[#181415]">Personal Donation History & Laboratory Screening</h2>
          </div>
          <span className="text-xs text-[#7E7678]">{donations?.length || 0} Sessions Recorded</span>
        </div>

        {donations && donations.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#EFEBE4] text-[#7E7678] uppercase text-[10px] tracking-wider font-semibold">
                  <th className="py-2.5 px-3">Session ID</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Blood Group</th>
                  <th className="py-2.5 px-3">Volume</th>
                  <th className="py-2.5 px-3">Laboratory Screening Status</th>
                  <th className="py-2.5 px-3 text-right">Status Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFEBE4]">
                {donations.map((d) => (
                  <tr key={d.donation_id} className="hover:bg-[#FAF8F5] transition-colors">
                    <td className="py-3 px-3 font-semibold text-[#181415]">#{d.donation_id}</td>
                    <td className="py-3 px-3 text-[#181415]">{d.donation_date}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-md bg-red-100 text-[#C52233] font-bold text-[11px]">
                        {d.blood_group}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-medium">{d.quantity} Unit (350–450 ml)</td>
                    <td className="py-3 px-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        d.screening_status === 'Approved' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                        d.screening_status === 'Pending' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                        'bg-red-100 text-red-800 border-red-200'
                      }`}>
                        {d.screening_status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right text-[11px] text-[#7E7678]">
                      {d.screening_status === 'Approved' ? '✓ Screened & Issued to Inventory' :
                       d.screening_status === 'Pending' ? '⏳ Under Lab Screening' : '✗ Biological Marker Ineligible'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-[#7E7678] bg-[#FAF8F5] rounded-2xl border border-[#EFEBE4]">
            <Heart className="w-8 h-8 text-rose-400 mx-auto mb-2" />
            <p className="font-semibold text-[#181415]">No donation sessions recorded yet.</p>
            <p className="text-[11px] text-[#7E7678] mt-0.5">Visit our central blood bank or an upcoming donation drive to contribute!</p>
          </div>
        )}
      </div>
    </div>
  );
}

