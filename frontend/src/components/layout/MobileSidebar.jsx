import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Droplet,
  Building2,
  Package,
  ClipboardList,
  Send,
  BarChart3,
  X,
  Settings,
} from 'lucide-react';
import Avatar from '../ui/Avatar';

export default function MobileSidebar({
  isOpen = false,
  onClose,
}) {
  if (!isOpen) return null;

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user')) || { role: 'Admin', name: 'Admin' };
    } catch {
      return { role: 'Admin', name: 'Admin' };
    }
  });

  const role = user.role || 'Admin';

  let navSections = [];
  if (role === 'Hospital') {
    navSections = [
      {
        title: 'HOSPITAL PORTAL',
        items: [
          { label: 'Requisition Desk', path: '/dashboard', icon: LayoutDashboard },
          { label: 'Blood Requests', path: '/requests', icon: ClipboardList },
          { label: 'Raise Requisition', path: '/requests/add', icon: Send },
        ],
      },
      {
        title: 'INVENTORY REFERENCE',
        items: [
          { label: 'Available Stock', path: '/inventory', icon: Package },
        ],
      },
    ];
  } else if (role === 'Donor') {
    navSections = [
      {
        title: 'DONOR PORTAL',
        items: [
          { label: 'Donor Pass', path: '/dashboard', icon: LayoutDashboard },
          { label: 'My Donations', path: '/donations', icon: Droplet },
        ],
      },
      {
        title: 'COMMUNITY',
        items: [
          { label: 'Blood Stock Levels', path: '/inventory', icon: Package },
        ],
      },
    ];
  } else if (role === 'Staff') {
    navSections = [
      {
        title: 'OVERVIEW',
        items: [
          { label: 'Workstation', path: '/dashboard', icon: LayoutDashboard },
        ],
      },
      {
        title: 'CLINICAL INTAKE',
        items: [
          { label: 'Donors', path: '/donors', icon: Users },
          { label: 'Donations & Screening', path: '/donations', icon: Droplet },
        ],
      },
      {
        title: 'DISPATCH',
        items: [
          { label: 'Inventory Matrix', path: '/inventory', icon: Package },
          { label: 'Hospital Requests', path: '/requests', icon: ClipboardList },
          { label: 'Issue Blood', path: '/issues', icon: Send },
        ],
      },
    ];
  } else {
    // Admin (Full Access)
    navSections = [
      {
        title: 'OVERVIEW',
        items: [
          { label: 'Admin Dashboard', path: '/dashboard', icon: LayoutDashboard },
        ],
      },
      {
        title: 'MANAGEMENT',
        items: [
          { label: 'Donors', path: '/donors', icon: Users },
          { label: 'Donations', path: '/donations', icon: Droplet },
          { label: 'Hospitals', path: '/hospitals', icon: Building2 },
        ],
      },
      {
        title: 'OPERATIONS',
        items: [
          { label: 'Inventory', path: '/inventory', icon: Package },
          { label: 'Requests', path: '/requests', icon: ClipboardList },
          { label: 'Issues', path: '/issues', icon: Send },
        ],
      },
      {
        title: 'ANALYTICS',
        items: [
          { label: 'Reports', path: '/reports', icon: BarChart3 },
        ],
      },
    ];
  }

  return (
    <div className="fixed inset-0 z-50 flex lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside className="relative flex flex-col justify-between w-[280px] max-w-[85vw] h-full bg-sidebar-dark text-white shadow-2xl z-10 select-none animate-in slide-in-from-left duration-200">
        <div>
          {/* Header */}
          <div className="h-[76px] flex items-center justify-between px-5 border-b border-border-sidebar">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-brand-blood flex items-center justify-center shrink-0 shadow-sm shadow-brand-blood/40">
                <Droplet className="w-5 h-5 text-white fill-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-base text-white leading-tight">BloodCare</span>
                <span className="text-[11px] text-[#8E8688] leading-tight">{role} Portal</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close menu"
              className="p-2 text-[#8E8688] hover:text-white rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav List */}
          <nav className="p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-160px)]">
            {navSections.map((section) => (
              <div key={section.title} className="space-y-1">
                <div className="px-3 py-1 text-[10px] font-semibold text-[#7A7274] tracking-wider">
                  {section.title}
                </div>
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `flex items-center gap-3 h-11 px-3.5 rounded-xl transition-all duration-150 ${
                          isActive
                            ? 'bg-brand-blood text-white font-medium shadow-active-nav'
                            : 'text-[#B8B0B2] hover:text-white hover:bg-white/[0.06]'
                        }`
                      }
                    >
                      <Icon className="w-5 h-5 shrink-0" />
                      <span className="text-sm tracking-tight truncate">{item.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* User Card */}
        <div className="p-4 border-t border-border-sidebar">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-white/[0.03] border border-border-sidebar">
            <Avatar name={user.name || 'User'} size="sm" status="online" className="shrink-0" />
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-white leading-tight truncate">{user.name || 'User'}</span>
              <span className="text-[10px] text-[#8E8688] leading-tight truncate">{role}</span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
