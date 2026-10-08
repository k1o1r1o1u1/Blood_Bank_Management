import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AppShell from '../components/layout/AppShell';
import Sidebar from '../components/layout/Sidebar';
import MobileSidebar from '../components/layout/MobileSidebar';
import Header from '../components/layout/Header';

export default function DashboardLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <AppShell>
      <div className="flex w-full flex-1 min-h-full overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block shrink-0">
          <Sidebar
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          />
        </div>

        {/* Mobile Sidebar Drawer */}
        <MobileSidebar
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        />

        {/* Right Main Application Area */}
        <div className="flex flex-col flex-1 min-w-0 bg-workspace-bg">
          <Header onOpenMobileMenu={() => setIsMobileMenuOpen(true)} />

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 bg-workspace-bg">
            <div className="max-w-[1400px] mx-auto w-full">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </AppShell>
  );
}
