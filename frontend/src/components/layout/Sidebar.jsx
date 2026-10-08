import React from 'react';
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
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import Avatar from '../ui/Avatar';
import Tooltip from '../ui/Tooltip';

export default function Sidebar({
  isCollapsed = false,
  onToggleCollapse,
}) {
  const navSections = [
    {
      title: 'OVERVIEW',
      items: [
        { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
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

  return (
    <aside
      className={`relative h-full bg-sidebar-dark text-white flex flex-col justify-between transition-all duration-300 ease-in-out shrink-0 select-none ${
        isCollapsed ? 'w-[76px]' : 'w-[240px]'
      }`}
      aria-label="Main Navigation"
    >
      {/* Top Header / Branding */}
      <div>
        <div className="h-[76px] flex items-center px-4 border-b border-border-sidebar">
          <div className="flex items-center gap-3 w-full">
            {/* Logo: Circular crimson blood drop */}
            <div className="w-9 h-9 rounded-full bg-brand-blood flex items-center justify-center shrink-0 shadow-sm shadow-brand-blood/40">
              <Droplet className="w-5 h-5 text-white fill-white" />
            </div>

            {!isCollapsed && (
              <div className="flex flex-col overflow-hidden">
                <span className="font-semibold text-base tracking-tight text-white leading-tight">
                  BloodCare
                </span>
                <span className="text-[11px] text-[#8E8688] font-normal truncate leading-tight">
                  Blood Bank System
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Groups */}
        <nav className="p-3 space-y-4 overflow-y-auto max-h-[calc(100vh-190px)]">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-1">
              {!isCollapsed ? (
                <div className="px-3 py-1 text-[10px] font-semibold text-[#7A7274] tracking-wider">
                  {section.title}
                </div>
              ) : (
                <div className="h-2" />
              )}

              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `group relative flex items-center h-11 rounded-xl transition-all duration-150 ${
                        isCollapsed ? 'justify-center px-0' : 'px-3.5 gap-3'
                      } ${
                        isActive
                          ? 'bg-brand-blood text-white font-medium shadow-active-nav'
                          : 'text-[#B8B0B2] hover:text-white hover:bg-white/[0.06]'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <Tooltip content={isCollapsed ? item.label : null} position="right">
                        <div className="flex items-center gap-3">
                          <Icon
                            className={`w-5 h-5 shrink-0 transition-transform duration-150 ${
                              isActive ? 'text-white' : 'text-[#8E8688] group-hover:text-white'
                            }`}
                          />
                          {!isCollapsed && (
                            <span className="text-sm tracking-tight truncate">
                              {item.label}
                            </span>
                          )}
                        </div>
                      </Tooltip>
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* Sidebar Footer / Admin Section */}
      <div className="p-3 border-t border-border-sidebar space-y-2">
        <div
          className={`flex items-center rounded-xl p-2.5 bg-white/[0.03] border border-border-sidebar ${
            isCollapsed ? 'justify-center' : 'justify-between'
          }`}
        >
          <div className="flex items-center gap-2.5 overflow-hidden">
            <Avatar name="Admin" size="sm" status="online" className="shrink-0 ring-1 ring-white/20" />
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-white leading-tight truncate">
                  Admin
                </span>
                <span className="text-[10px] text-[#8E8688] leading-tight truncate">
                  Administrator
                </span>
              </div>
            )}
          </div>

          {!isCollapsed && (
            <button
              type="button"
              className="p-1.5 text-[#8E8688] hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              title="Settings"
              aria-label="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Collapse Toggle Link */}
        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="w-full flex items-center justify-center py-1.5 text-[#8E8688] hover:text-white transition-colors text-xs gap-1.5"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-3.5 h-3.5" />
                <span className="text-[11px] font-medium">Collapse</span>
              </>
            )}
          </button>
        )}
      </div>
    </aside>
  );
}
