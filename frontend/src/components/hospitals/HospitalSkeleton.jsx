import React from 'react';

export default function HospitalSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <div className="h-7 w-36 bg-[#F0EAE6] rounded-lg" />
          <div className="h-4 w-64 bg-[#F7F3F1] rounded-md" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-24 bg-[#F0EAE6] rounded-xl" />
          <div className="h-9 w-32 bg-[#F0EAE6] rounded-xl" />
        </div>
      </div>

      {/* Summary card skeleton */}
      <div className="bg-surface-white rounded-[22px] border border-border-card p-5 h-20 shadow-card-clean flex items-center gap-6">
        <div className="h-10 w-32 bg-[#F0EAE6] rounded-xl" />
        <div className="h-4 w-px bg-[#F0EAE6]" />
        <div className="h-4 w-48 bg-[#F7F3F1] rounded-md" />
      </div>

      {/* Search bar skeleton */}
      <div className="bg-surface-white rounded-2xl border border-border-card p-4 h-14 shadow-card-clean" />

      {/* Table rows skeleton */}
      <div className="bg-surface-white rounded-2xl border border-border-card shadow-card-clean overflow-hidden">
        <div className="p-4 border-b border-border-card h-12 bg-workspace-bg/40" />
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="p-4 border-b border-border-card last:border-0 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#F0EAE6] flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-48 bg-[#F0EAE6] rounded-md" />
              <div className="h-3 w-64 bg-[#F7F3F1] rounded-md" />
            </div>
            <div className="h-3 w-28 bg-[#F7F3F1] rounded-md" />
            <div className="h-3 w-40 bg-[#F7F3F1] rounded-md hidden md:block" />
            <div className="flex gap-2 flex-shrink-0">
              <div className="h-7 w-14 bg-[#F0EAE6] rounded-lg" />
              <div className="h-7 w-7 bg-[#F0EAE6] rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
