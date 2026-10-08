import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeartHandshake, Send, ArrowRight } from 'lucide-react';
import { formatShortDate } from '../../utils/inventoryHelpers';

const SCREENING_BADGE = {
  Approved: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  Pending:  'bg-amber-50 text-amber-700 border border-amber-200',
  Rejected: 'bg-rose-50 text-brand-blood border border-rose-200',
};

export default function ActivityPanel({ recentDonations = [], recentIssues = [] }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('donations');

  const donationFeed = recentDonations.map((d) => ({
    id:         `don-${d.donation_id}`,
    label:      d.donor_name,
    sub:        `${d.quantity} unit${d.quantity !== 1 ? 's' : ''} • ${formatShortDate(d.donation_date)}`,
    badge:      d.screening_status,
    bloodGroup: d.blood_group,
  }));

  const issueFeed = recentIssues.map((i) => ({
    id:         `iss-${i.issue_id}`,
    label:      i.hospital_name,
    sub:        `Unit #${i.unit_id} • ${formatShortDate(i.issue_date)}`,
    badge:      'Dispatched',
    bloodGroup: i.blood_group,
  }));

  const currentFeed = activeTab === 'donations' ? donationFeed : issueFeed;

  return (
    <aside className="space-y-6">
      {/* Activity Feed Card */}
      <div className="bg-surface-white rounded-[22px] p-6 border border-border-card shadow-card-clean space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border-card">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-brand-blood-light flex items-center justify-center text-brand-blood shrink-0">
              {activeTab === 'donations' ? (
                <HeartHandshake className="w-4 h-4" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </div>
            <div>
              <h3 className="text-sm font-bold text-text-main">Recent Activity</h3>
              <p className="text-[11px] text-text-muted">Real-time intakes &amp; hospital issues</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate(activeTab === 'donations' ? '/donations' : '/issues')}
            className="text-xs font-semibold text-brand-blood hover:underline flex items-center gap-1"
          >
            <span>All</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Tab Switcher: Donations vs Issues */}
        <div className="flex items-center p-1 bg-workspace-bg rounded-xl border border-border-card">
          <button
            type="button"
            onClick={() => setActiveTab('donations')}
            className={`flex-1 py-1 text-xs font-semibold rounded-lg transition-all duration-150 ${
              activeTab === 'donations'
                ? 'bg-brand-blood text-white shadow-xs'
                : 'text-text-muted hover:text-text-main'
            }`}
          >
            Donations ({recentDonations.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('issues')}
            className={`flex-1 py-1 text-xs font-semibold rounded-lg transition-all duration-150 ${
              activeTab === 'issues'
                ? 'bg-brand-blood text-white shadow-xs'
                : 'text-text-muted hover:text-text-main'
            }`}
          >
            Dispatches ({recentIssues.length})
          </button>
        </div>

        {/* Feed List */}
        <div className="space-y-2.5">
          {currentFeed.length === 0 ? (
            <p className="text-xs text-text-muted text-center py-6">
              {activeTab === 'donations'
                ? 'No recent donations recorded.'
                : 'No recent blood issues recorded.'}
            </p>
          ) : (
            currentFeed.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-xl bg-workspace-bg border border-border-card/80 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-7 h-7 rounded-lg bg-[#FCE8EB] text-brand-blood font-bold flex items-center justify-center text-xs shrink-0">
                    {item.bloodGroup}
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold text-text-main truncate leading-tight">
                      {item.label}
                    </p>
                    <p className="text-[11px] text-text-muted leading-tight">
                      {item.sub}
                    </p>
                  </div>
                </div>

                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-semibold shrink-0 ${
                    item.badge === 'Dispatched'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : SCREENING_BADGE[item.badge] ?? SCREENING_BADGE.Pending
                  }`}
                >
                  {item.badge}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </aside>
  );
}
