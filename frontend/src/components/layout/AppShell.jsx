import React from 'react';

export default function AppShell({ children }) {
  return (
    <div className="min-h-screen bg-canvas-outer flex items-center justify-center p-0 sm:p-4 lg:p-6 select-none">
      <div className="w-full max-w-[1520px] min-h-screen sm:min-h-[calc(100vh-2rem)] lg:min-h-[calc(100vh-3rem)] bg-workspace-bg sm:rounded-[28px] border-0 sm:border border-white/10 shadow-none sm:shadow-workspace-frame overflow-hidden flex flex-col">
        {children}
      </div>
    </div>
  );
}
