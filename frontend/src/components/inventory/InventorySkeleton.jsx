import React from 'react';

export default function InventorySkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Hero skeleton */}
      <div className="bg-surface-white rounded-[22px] border border-border-card p-6 lg:p-7 shadow-card-clean">
        <div className="flex flex-col lg:flex-row justify-between gap-6">
          <div className="space-y-3 max-w-md w-full">
            <div className="h-5 w-32 bg-[#F0EAE6] rounded-full" />
            <div className="h-12 w-48 bg-[#F0EAE6] rounded-xl" />
            <div className="h-4 w-64 bg-[#F7F3F1] rounded-md" />
            <div className="h-8 w-80 bg-[#F0EAE6] rounded-xl" />
          </div>
          <div className="grid grid-cols-3 gap-3 w-full lg:w-96">
            <div className="h-24 bg-[#F0EAE6] rounded-xl" />
            <div className="h-24 bg-[#F0EAE6] rounded-xl" />
            <div className="h-24 bg-[#F0EAE6] rounded-xl" />
          </div>
        </div>
      </div>

      {/* Matrix skeleton */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="h-6 w-48 bg-[#F0EAE6] rounded-md" />
          <div className="h-6 w-32 bg-[#F0EAE6] rounded-md" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="bg-surface-white rounded-2xl border border-border-card p-5 h-48 space-y-4 shadow-card-clean">
              <div className="flex justify-between">
                <div className="w-10 h-10 rounded-xl bg-[#F0EAE6]" />
                <div className="w-16 h-6 rounded-full bg-[#F0EAE6]" />
              </div>
              <div className="h-8 w-24 bg-[#F0EAE6] rounded-lg" />
              <div className="grid grid-cols-3 gap-1.5 pt-2">
                <div className="h-8 bg-[#F7F3F1] rounded-lg" />
                <div className="h-8 bg-[#F7F3F1] rounded-lg" />
                <div className="h-8 bg-[#F7F3F1] rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Table skeleton */}
      <div className="bg-surface-white rounded-2xl border border-border-card p-6 shadow-card-clean space-y-4">
        <div className="h-6 w-56 bg-[#F0EAE6] rounded-md" />
        <div className="h-10 w-full bg-[#F7F3F1] rounded-xl" />
        <div className="space-y-2 pt-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 w-full bg-[#F0EAE6] rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
