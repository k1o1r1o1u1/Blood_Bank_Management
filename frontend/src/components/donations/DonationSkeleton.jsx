import React from 'react';

export default function DonationSkeleton() {
  return (
    <div className="p-6 space-y-3.5">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="animate-pulse p-4 rounded-xl bg-workspace-bg border border-border-card/60 flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#E8E2DD]" />
            <div className="space-y-1.5">
              <div className="w-32 h-4 rounded bg-[#E8E2DD]" />
              <div className="w-20 h-3 rounded bg-[#F2EDE9]" />
            </div>
          </div>

          <div className="hidden sm:block w-16 h-4 rounded bg-[#E8E2DD]" />
          <div className="hidden md:block w-20 h-4 rounded bg-[#E8E2DD]" />
          <div className="w-24 h-6 rounded-md bg-[#E8E2DD]" />
          <div className="w-8 h-8 rounded-xl bg-[#E8E2DD]" />
        </div>
      ))}
    </div>
  );
}
