import React, { useState } from 'react';
import {
  ShieldCheck,
  Bell,
  UserCheck,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  Moon,
  Sun,
  Building2,
  LayoutDashboard,
  Wallet,
  Scale,
  FileText,
  BadgeCheck,
  ArrowRightLeft,
  Users,
  MessageSquareWarning,
  Menu
} from 'lucide-react';
import { User, Role, AppNotification } from '../types';
import { AppLogo } from './AppLogo';

interface NavbarProps {
  user: User | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onSwitchRole: (role: Role) => void;
  unreadCount: number;
  notifications: AppNotification[];
  onOpenNotifications: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenAuthModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  activeTab,
  setActiveTab,
  onSwitchRole,
  unreadCount,
  notifications,
  onOpenNotifications,
  darkMode,
  onToggleDarkMode,
  onOpenArchitectureModal,
}) => {
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showMobileNavDropdown, setShowMobileNavDropdown] = useState(false);

  const roleLabels: Record<Role, { title: string; color: string; badge: string }> = {
    EMPLOYEE: { title: 'Member (Employee)', color: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-300', badge: 'UAN Member' },
    EMPLOYER: { title: 'Employer Portal', color: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-300', badge: 'Establishment' },
    OFFICER: { title: 'EPFO APFC Officer', color: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-300', badge: 'Field Officer' },
    ADMIN: { title: 'System DevOps / Admin', color: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-300', badge: 'Admin Gateway' },
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'pf', label: 'Passbook & Balance', icon: Wallet },
    { id: 'contributions', label: 'Reconciliation', icon: Scale },
    { id: 'claims', label: 'Online Claims', icon: FileText },
    { id: 'kyc', label: 'KYC Services', icon: BadgeCheck },
    { id: 'transfer', label: 'PF Transfer', icon: ArrowRightLeft },
    { id: 'nomination', label: 'e-Nomination', icon: Users },
    { id: 'grievance', label: 'EPFiGMS', icon: MessageSquareWarning },
  ];

  const currentNav = navItems.find((item) => item.id === activeTab) || navItems[0];
  const CurrentIcon = currentNav.icon;

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      {/* Top Bar for Gov ID, Night Mode & Role Switcher */}
      <div className="bg-slate-900 dark:bg-slate-950 text-slate-200 text-xs px-3 sm:px-8 py-1.5 flex flex-wrap justify-between items-center gap-2 border-b border-slate-800">
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="flex items-center gap-1.5 font-medium tracking-wide text-slate-100 text-[11px] sm:text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            EPFO 2.0 • Unified Portal
          </span>
          <span className="hidden md:inline text-slate-500">|</span>
          <span className="hidden md:inline text-slate-400 text-[11px]">Ministry of Labour & Employment, Govt. of India</span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">

          {/* Day / Night Mode Segmented Switch */}
          <div className="flex items-center bg-slate-950/90 p-0.5 rounded-lg border border-slate-800 text-[11px]">
            <button
              type="button"
              onClick={() => {
                if (darkMode) onToggleDarkMode();
              }}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-md transition font-medium cursor-pointer ${
                !darkMode
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-xs font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Day Mode (Light theme)"
            >
              <Sun className={`w-3 h-3 ${!darkMode ? 'text-amber-400' : 'text-slate-400'}`} />
              <span>Day</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (!darkMode) onToggleDarkMode();
              }}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-md transition font-medium cursor-pointer ${
                darkMode
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-xs font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Night Mode (Dark theme)"
            >
              <Moon className={`w-3 h-3 ${darkMode ? 'text-blue-400' : 'text-slate-400'}`} />
              <span>Night</span>
            </button>
          </div>

          {/* Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-1 sm:gap-1.5 text-slate-300 hover:text-white transition py-0.5 px-1.5 sm:px-2 rounded hover:bg-slate-800 cursor-pointer text-[11px] sm:text-xs"
            >
              <UserCheck className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Role: </span>
              <strong className="text-white font-semibold">{user?.role}</strong>
              <ChevronDown className="w-3 h-3" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-1 w-56 bg-slate-800 border border-slate-700 rounded-xl shadow-xl py-1 z-50 text-slate-200 text-xs overflow-hidden">
                <div className="px-3 py-1.5 border-b border-slate-700 text-slate-400 font-medium">
                  Switch Active Role (Demo Mode)
                </div>
                {(['EMPLOYEE', 'EMPLOYER', 'OFFICER', 'ADMIN'] as Role[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      onSwitchRole(r);
                      setShowRoleMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-700 transition cursor-pointer ${
                      user?.role === r ? 'text-emerald-400 font-semibold bg-slate-700/50' : ''
                    }`}
                  >
                    <span>{roleLabels[r].title}</span>
                    {user?.role === r && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Portal Identity */}
          <div className="flex items-center gap-3 cursor-pointer select-none" onClick={() => setActiveTab('dashboard')}>
            <AppLogo size={38} />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">EPFO 2.0</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  Unified Portal
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">Employees' Provident Fund Organisation</p>
            </div>
          </div>

          {/* User Header Profile & Notification Center */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifMenu(!showNotifMenu);
                  if (!showNotifMenu) onOpenNotifications();
                }}
                className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 relative transition cursor-pointer"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifMenu && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-3 z-50">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <h4 className="font-semibold text-slate-800 dark:text-white text-sm">Notifications ({unreadCount} new)</h4>
                    <button
                      onClick={() => {
                        setActiveTab('notifications');
                        setShowNotifMenu(false);
                      }}
                      className="text-xs text-emerald-700 dark:text-emerald-400 hover:underline font-medium cursor-pointer"
                    >
                      View All
                    </button>
                  </div>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-72 overflow-y-auto mt-2">
                    {notifications.slice(0, 4).map((n) => (
                      <div key={n.id} className="py-2 text-xs">
                        <div className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-200">
                          {n.type === 'CONTRIBUTION_MISMATCH' ? (
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                          )}
                          <span>{n.title}</span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5">{n.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Profile & Account Button */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuthModal ? onOpenAuthModal() : setActiveTab('profile')}
                className="flex items-center gap-2 pl-2 sm:pl-2.5 pr-2.5 sm:pr-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer text-left"
                title="Manage Profile, Login or Register New User"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <div className="hidden sm:block">
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight max-w-[130px] truncate">{user?.name}</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">UAN: {user?.uan?.slice(-4) ? `•••• ${user.uan.slice(-4)}` : 'Demo'}</div>
                </div>
              </button>

              <button
                onClick={() => onOpenAuthModal && onOpenAuthModal()}
                className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-medium transition cursor-pointer"
                title="Switch user account or register new profile"
              >
                <UserCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="hidden sm:inline">Switch / Sign In</span>
                <span className="sm:hidden inline">Switch</span>
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Navigation Tabs (Hidden on Mobile) */}
        <nav className="hidden sm:flex space-x-1 sm:space-x-2 overflow-x-auto pb-2 scrollbar-none text-xs sm:text-sm">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-3.5 py-2 rounded-xl font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/70'
                }`}
              >
                <Icon className="w-4 h-4 opacity-80" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Mobile Navigation Dropdown Form (Visible ONLY on Mobile) */}
        <div className="sm:hidden pb-3 pt-1">
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowMobileNavDropdown(!showMobileNavDropdown)}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium text-xs shadow-xs"
            >
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-lg bg-emerald-600 text-white">
                  <CurrentIcon className="w-3.5 h-3.5" />
                </div>
                <div className="text-left">
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">Active Section</div>
                  <div className="font-semibold text-xs text-slate-900 dark:text-white">{currentNav.label}</div>
                </div>
              </div>
              <div className="flex items-center gap-1 text-slate-500">
                <span className="text-[11px]">Change</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showMobileNavDropdown ? 'rotate-180' : ''}`} />
              </div>
            </button>

            {showMobileNavDropdown && (
              <div className="absolute left-0 right-0 mt-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl py-1.5 z-50 divide-y divide-slate-100 dark:divide-slate-800 max-h-80 overflow-y-auto">
                <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Select Portal View
                </div>
                <div className="py-1">
                  {navItems.map((item) => {
                    const isActive = activeTab === item.id;
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          setShowMobileNavDropdown(false);
                        }}
                        className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer text-xs ${
                          isActive
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-semibold'
                            : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
                          <span>{item.label}</span>
                        </div>
                        {isActive && <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

