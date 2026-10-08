import React from 'react';

export default function IssueSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 pb-2">
        <div className="space-y-2">
          <div className="h-7 w-48 bg-slate-200 rounded-lg" />
          <div className="h-4 w-72 bg-slate-100 rounded" />
        </div>
        <div className="flex gap-2.5">
          <div className="h-9 w-24 bg-slate-200 rounded-xl" />
        </div>
      </div>

      {/* Stats cards skeleton */}
      <div className="bg-surface-white rounded-2xl border border-border-card p-5 space-y-4">
        <div className="h-4 w-40 bg-slate-200 rounded" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-slate-100 rounded-xl border border-border-card/50" />
          ))}
        </div>
      </div>

      {/* Filter toolbar skeleton */}
      <div className="h-14 bg-surface-white rounded-2xl border border-border-card" />

      {/* Table skeleton */}
      <div className="bg-surface-white rounded-2xl border border-border-card p-4 space-y-3">
        <div className="h-10 bg-slate-100 rounded-xl" />
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-14 bg-slate-50 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
