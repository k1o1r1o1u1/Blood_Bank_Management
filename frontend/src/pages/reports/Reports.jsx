import React from 'react';
import {
  Droplet,
  HeartHandshake,
  Clock,
  AlertCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Cell,
} from 'recharts';

export default function Reports() {
  // Sparkline data for Total Blood Inventory
  const sparklineData = [
    { value: 1800 },
    { value: 2100 },
    { value: 1950 },
    { value: 2400 },
    { value: 2300 },
    { value: 2750 },
    { value: 2850 },
  ];

  // Inventory by blood group data
  const inventoryData = [
    { group: 'A+', units: 1420, color: '#D95364' },
    { group: 'A-', units: 1580, color: '#C84859' },
    { group: 'B+', units: 1080, color: '#BC3A4D' },
    { group: 'B-', units: 580, color: '#A92F41' },
    { group: 'AB+', units: 1180, color: '#9B1D30' },
    { group: 'AB-', units: 920, color: '#881829' },
    { group: 'O+', units: 1560, color: '#681120' },
    { group: 'O-', units: 1820, color: '#4D0A16' },
  ];

  // Recent Requests & Transfusions table data
  const transfusionsData = [
    { bloodType: 'A+', type: 'Confirmed', date: '07/2/2022', transfusion: 'A+', status: 'Transfered' },
    { bloodType: 'A-', type: 'Confirmed', date: '07/2/2022', transfusion: 'A-', status: 'Transfered' },
    { bloodType: 'B+', type: 'Confirmed', date: '07/2/2022', transfusion: 'B+', status: 'Transfered' },
    { bloodType: 'B-', type: 'Confirmed', date: '07/2/2022', transfusion: 'B-', status: 'Transfered' },
    { bloodType: 'AB+', type: 'Confirmed', date: '07/1/2023', transfusion: 'AB-', status: 'Transfered' },
    { bloodType: 'AB-', type: 'Confirmed', date: '12/1/2023', transfusion: 'O+', status: 'Transfered' },
    { bloodType: 'O+', type: 'Confirmed', date: '07/2/2022', transfusion: 'O-', status: 'Transfered' },
  ];

  return (
    <div className="space-y-6">
      {/* 4 Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {/* Card 1: Total Blood Inventory */}
        <div className="bg-surface-white rounded-[22px] p-6 border border-border-card shadow-card-clean flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-start justify-between">
            <h2 className="text-sm font-semibold text-text-main leading-snug max-w-[130px]">
              Total Blood Inventory (Units)
            </h2>
            <div className="w-8 h-8 rounded-full bg-brand-blood-light flex items-center justify-center text-brand-blood shrink-0">
              <Droplet className="w-4 h-4 fill-brand-blood" />
            </div>
          </div>

          <div className="mt-4">
            <span className="text-3xl lg:text-4xl font-bold text-text-main tracking-tight">
              2,850
            </span>
          </div>

          {/* Sparkline wave */}
          <div className="h-14 -mx-6 -mb-6 mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparklineData}>
                <defs>
                  <linearGradient id="bloodWave" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C52233" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#C52233" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#C52233"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#bloodWave)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Card 2: Recent Donations */}
        <div className="bg-surface-white rounded-[22px] p-6 border border-border-card shadow-card-clean flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <h2 className="text-sm font-semibold text-text-main leading-snug max-w-[140px]">
              Recent Donations (This Week)
            </h2>
            <div className="w-8 h-8 rounded-full bg-brand-blood-light flex items-center justify-center text-brand-blood shrink-0">
              <HeartHandshake className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-6">
            <span className="text-3xl lg:text-4xl font-bold text-text-main tracking-tight">
              115
            </span>
          </div>
        </div>

        {/* Card 3: Pending Crossmatch Requests */}
        <div className="bg-surface-white rounded-[22px] p-6 border border-border-card shadow-card-clean flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <h2 className="text-sm font-semibold text-text-main leading-snug max-w-[150px]">
              Pending Crossmatch Requests
            </h2>
            <div className="w-8 h-8 rounded-full bg-brand-blood-light flex items-center justify-center text-brand-blood shrink-0">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-6">
            <span className="text-3xl lg:text-4xl font-bold text-text-main tracking-tight">
              22
            </span>
          </div>
        </div>

        {/* Card 4: Critical Low Alerts */}
        <div className="bg-surface-white rounded-[22px] p-6 border border-border-card shadow-card-clean flex flex-col justify-between">
          <div className="flex items-start justify-between mb-3">
            <h2 className="text-sm font-semibold text-text-main leading-snug">
              Critical Low Alerts
            </h2>
            <div className="w-8 h-8 rounded-full bg-brand-blood flex items-center justify-center text-white shrink-0 shadow-xs">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>

          <div className="space-y-1.5 mt-1">
            <div className="flex items-center justify-between px-3 py-1 rounded-lg bg-[#FBE7EA] text-xs">
              <span className="font-semibold text-brand-blood">O-</span>
              <span className="font-semibold text-brand-blood">3 units</span>
            </div>
            <div className="flex items-center justify-between px-3 py-1 rounded-lg bg-[#FBE7EA] text-xs">
              <span className="font-semibold text-brand-blood">AB-</span>
              <span className="font-semibold text-brand-blood">1 unit</span>
            </div>
            <div className="flex items-center justify-between px-3 py-1 rounded-lg bg-[#FBE7EA] text-xs">
              <span className="font-semibold text-brand-blood">AB-</span>
              <span className="font-semibold text-brand-blood">1 unit</span>
            </div>
            <div className="flex items-center justify-between px-3 py-1 rounded-lg bg-[#FBE7EA] text-xs">
              <span className="font-semibold text-brand-blood">O-</span>
              <span className="font-semibold text-brand-blood">1 unit</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom 2 Large Cards: Chart + Transfusions Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left: Blood Group Inventory Status Chart */}
        <div className="bg-surface-white rounded-[22px] p-6 border border-border-card shadow-card-clean flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-semibold text-text-main">
              Blood Group Inventory Status
            </h3>
            <div className="w-8 h-8 rounded-full bg-brand-blood-light flex items-center justify-center text-brand-blood shrink-0">
              <Droplet className="w-4 h-4 fill-brand-blood" />
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={inventoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EFEBE4" />
                <XAxis
                  dataKey="group"
                  tickLine={false}
                  axisLine={{ stroke: '#EFEBE4' }}
                  tick={{ fill: '#7E7678', fontSize: 12, fontWeight: 500 }}
                />
                <YAxis
                  ticks={[0, 500, 1000, 1500, 2000]}
                  domain={[0, 2000]}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#7E7678', fontSize: 11 }}
                />
                <RechartsTooltip
                  cursor={{ fill: 'rgba(0,0,0,0.03)' }}
                  contentStyle={{
                    backgroundColor: '#1C1315',
                    borderRadius: '12px',
                    color: '#FFFFFF',
                    border: 'none',
                    fontSize: '12px',
                    padding: '8px 12px',
                  }}
                  itemStyle={{ color: '#FFFFFF' }}
                />
                <Bar dataKey="units" radius={[6, 6, 0, 0]} maxBarSize={32}>
                  {inventoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Recent Requests & Transfusions */}
        <div className="bg-surface-white rounded-[22px] p-6 border border-border-card shadow-card-clean flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-text-main">
              Recent Requests & Transfusions
            </h3>
            <div className="w-8 h-8 rounded-full bg-brand-blood-light flex items-center justify-center text-brand-blood shrink-0">
              <Droplet className="w-4 h-4 fill-brand-blood" />
            </div>
          </div>

          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border-card text-text-muted font-semibold">
                  <th className="pb-3 pt-1">Blood type</th>
                  <th className="pb-3 pt-1">Type</th>
                  <th className="pb-3 pt-1">Date</th>
                  <th className="pb-3 pt-1">Transfusion</th>
                  <th className="pb-3 pt-1">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-card/60">
                {transfusionsData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-workspace-bg/50 transition-colors">
                    <td className="py-2.5">
                      <span className="inline-block px-2.5 py-0.5 rounded-md bg-[#FCE8EB] text-brand-blood font-semibold text-[11px]">
                        {row.bloodType}
                      </span>
                    </td>
                    <td className="py-2.5 text-text-main font-medium">{row.type}</td>
                    <td className="py-2.5 text-text-muted">{row.date}</td>
                    <td className="py-2.5 text-text-main font-medium">{row.transfusion}</td>
                    <td className="py-2.5 text-text-muted">{row.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
