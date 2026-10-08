import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  Bell,
  ChevronDown,
  User,
  Settings,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import SearchInput from '../ui/SearchInput';
import Avatar from '../ui/Avatar';

export default function Header({ onOpenMobileMenu }) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Route title mapping
  const getPageInfo = (path) => {
    if (path.startsWith('/donors/add')) return { title: 'Add New Donor', category: 'DONORS' };
    if (path.startsWith('/donors/')) return { title: 'Donor Profile', category: 'DONORS' };
    if (path.startsWith('/donors')) return { title: 'Donors Directory', category: 'MANAGEMENT' };
    if (path.startsWith('/donations/add')) return { title: 'Record Donation', category: 'DONATIONS' };
    if (path.startsWith('/donations')) return { title: 'Donations & Screening', category: 'MANAGEMENT' };
    if (path.startsWith('/inventory')) return { title: 'Blood Inventory', category: 'OPERATIONS' };
    if (path.startsWith('/hospitals/add')) return { title: 'Register Hospital', category: 'HOSPITALS' };
    if (path.startsWith('/hospitals')) return { title: 'Hospital Partners', category: 'MANAGEMENT' };
    if (path.startsWith('/requests/')) return { title: 'Blood Request Details', category: 'REQUESTS' };
    if (path.startsWith('/requests')) return { title: 'Blood Requests', category: 'OPERATIONS' };
    if (path.startsWith('/issues')) return { title: 'Blood Issuance', category: 'OPERATIONS' };
    if (path.startsWith('/reports')) return { title: 'Analytics & Reports', category: 'ANALYTICS' };
    return { title: 'Dashboard Overview', category: 'OVERVIEW' };
  };

  const pageInfo = getPageInfo(location.pathname);

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <header className="h-[76px] px-6 lg:px-8 bg-workspace-bg border-b border-border-card flex items-center justify-between shrink-0 sticky top-0 z-20">
      {/* Left: Mobile Toggle & Breadcrumb / Page Title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="p-2 -ml-2 text-text-muted hover:text-text-main rounded-xl lg:hidden focus:outline-none"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted hidden sm:inline">
            {pageInfo.category}
          </span>
          <span className="text-text-muted/50 hidden sm:inline text-xs">/</span>
          <h1 className="text-base sm:text-lg font-semibold text-text-main tracking-tight leading-tight">
            {pageInfo.title}
          </h1>
        </div>
      </div>

      {/* Right Controls: Search, Notifications, Profile */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Search Input with shortcut */}
        <div className="hidden md:block w-64 lg:w-76">
          <SearchInput
            placeholder="Search records, units..."
            shortcut="⌘ K"
            className="border-border-card bg-surface-white"
          />
        </div>

        {/* Notifications Icon with count 3 badge */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            aria-label="View notifications"
            className="relative p-2.5 rounded-xl text-text-muted hover:text-text-main hover:bg-black/[0.03] transition-colors"
          >
            <Bell className="w-5 h-5" />
          </button>

          {/* Notifications Popover */}
          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-surface-white rounded-2xl shadow-card-clean border border-border-card p-4 z-50 animate-in fade-in-50 zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-border-card">
                <span className="text-xs font-semibold text-text-main uppercase tracking-wider">
                  Notifications
                </span>
                <span className="text-[11px] text-text-muted">
                  0 unread
                </span>
              </div>
              <div className="py-6 text-center text-xs text-text-muted space-y-1">
                <p className="font-semibold text-text-main">No unread notifications</p>
                <p className="text-[11px] text-text-muted">
                  Real-time operational alerts will appear here as events occur.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setProfileOpen(!profileOpen)}
            aria-expanded={profileOpen}
            className="flex items-center gap-2.5 pl-1.5 pr-2 py-1 rounded-xl hover:bg-black/[0.03] transition-all duration-150 select-none"
          >
            <Avatar name="Admin" size="sm" status="online" className="bg-[#1C1315] text-white ring-1 ring-border-card" />
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-semibold text-text-main leading-tight">Admin</span>
              <span className="text-[10px] text-text-muted leading-tight">Hospital Sys</span>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-text-muted transition-transform duration-150 ${profileOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Profile Dropdown */}
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-surface-white rounded-2xl shadow-card-clean border border-border-card p-1.5 z-50 animate-in fade-in-50 zoom-in-95">
              <div className="px-3 py-2 border-b border-border-card mb-1">
                <p className="text-xs font-semibold text-text-main">Administrator</p>
                <p className="text-[11px] text-text-muted truncate">admin@bloodbank.org</p>
              </div>

              <button
                type="button"
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-text-main hover:bg-workspace-bg rounded-lg transition-colors text-left"
              >
                <User className="w-3.5 h-3.5 text-text-muted" />
                <span>My Profile</span>
              </button>

              <button
                type="button"
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-text-main hover:bg-workspace-bg rounded-lg transition-colors text-left"
              >
                <Settings className="w-3.5 h-3.5 text-text-muted" />
                <span>Settings</span>
              </button>

              <button
                type="button"
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-text-main hover:bg-workspace-bg rounded-lg transition-colors text-left"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-text-muted" />
                <span>Security & Audits</span>
              </button>

              <div className="h-[1px] bg-border-card my-1" />

              <button
                type="button"
                onClick={handleLogout}
                aria-label="Log out"
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-brand-blood hover:bg-brand-blood-light rounded-lg transition-colors text-left"
              >
                <LogOut className="w-3.5 h-3.5 text-brand-blood" />
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
