import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { PassbookView } from './components/PassbookView';
import { ContributionsView } from './components/ContributionsView';
import { ClaimsView } from './components/ClaimsView';
import { KycView } from './components/KycView';
import { TransferView } from './components/TransferView';
import { NominationView } from './components/NominationView';
import { GrievanceView } from './components/GrievanceView';
import { NotificationsView } from './components/NotificationsView';
import { ProfileView } from './components/ProfileView';
import { ArchitectureModal } from './components/ArchitectureModal';
import { LoginView } from './components/LoginView';
import { AuthModal } from './components/AuthModal';
import { api, setAuthToken, getAuthToken } from './services/api';
import {
  User,
  Role,
  PFAccountBalance,
  ContributionRecord,
  Claim,
  KYCRecord,
  EmploymentRecord,
  Nomination,
  TransferRequest,
  Grievance,
  AppNotification
} from './types';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true); // Logged in with default user by default for fast preview
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [showArchModal, setShowArchModal] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('epfo_night_mode');
    if (saved !== null) {
      return saved === 'true';
    }
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Sync dark class on html root element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('epfo_night_mode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('epfo_night_mode', 'false');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  // Core Data States
  const [balance, setBalance] = useState<PFAccountBalance | null>(null);
  const [contributions, setContributions] = useState<ContributionRecord[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [kycRecords, setKycRecords] = useState<KYCRecord[]>([]);
  const [employment, setEmployment] = useState<EmploymentRecord[]>([]);
  const [nominations, setNominations] = useState<Nomination[]>([]);
  const [transfers, setTransfers] = useState<TransferRequest[]>([]);
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  // Load all initial data from Unified Gateway
  const loadData = async () => {
    try {
      // 1. Auth & Me
      const meRes = await api.getMe();
      if (meRes?.user) setUser(meRes.user);

      // 2. PF & Contributions
      const [bal, contr, clms, kyc, emp, noms, trfs, grvs, notifs] = await Promise.all([
        api.getBalance().catch(() => null),
        api.getContributions().catch(() => ({ contributions: [] })),
        api.getClaims().catch(() => []),
        api.getKYC().catch(() => ({ records: [] })),
        api.getEmploymentHistory().catch(() => []),
        api.getNominations().catch(() => []),
        api.getTransfers().catch(() => []),
        api.getGrievances().catch(() => []),
        api.getNotifications().catch(() => ({ notifications: [], unreadCount: 0 })),
      ]);

      if (bal) setBalance(bal);
      if (contr?.contributions) setContributions(contr.contributions);
      if (Array.isArray(clms)) setClaims(clms);
      if (kyc?.records) setKycRecords(kyc.records);
      if (Array.isArray(emp)) setEmployment(emp);
      if (Array.isArray(noms)) setNominations(noms);
      if (Array.isArray(trfs)) setTransfers(trfs);
      if (Array.isArray(grvs)) setGrievances(grvs);
      if (notifs?.notifications) {
        setNotifications(notifs.notifications);
        setUnreadCount(notifs.unreadCount);
      }
    } catch (err) {
      console.error('Failed to load portal data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLogin = async (uan: string, role?: Role) => {
    try {
      const res = await api.login(uan, role);
      setAuthToken(res.token);
      setUser(res.user);
      setIsAuthenticated(true);
      await loadData().catch(() => {});
    } catch (e) {
      console.error('Error during handleLogin:', e);
      throw e;
    }
  };

  const handleRegisterSuccess = async (token: string, newUser: User) => {
    setAuthToken(token);
    setUser(newUser);
    setIsAuthenticated(true);
    await loadData();
  };

  const handleLogout = () => {
    setAuthToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  const handleVerifyOtp = async (uan: string, otp: string) => {
    const res = await api.verifyOtp(uan, otp);
    setAuthToken(res.token);
    setUser(res.user);
    setIsAuthenticated(true);
    await loadData().catch(() => {});
    } catch (e) {
      console.error('Error during handleVerifyOtp:', e);
      throw e;
    }
  };

  const handleSwitchRole = async (role: Role) => {
    try {
      const res = await api.switchRole(role);
      setAuthToken(res.token);
      setUser(res.user);
      await loadData().catch(() => {});
    } catch (e) {
      console.error('Error during handleSwitchRole:', e);
    }
  };

  if (!isAuthenticated) {
    return (
      <LoginView
        onLogin={handleLogin}
        onVerifyOtp={handleVerifyOtp}
        onRegisterSuccess={handleRegisterSuccess}
        onContinueAsGuest={() => setIsAuthenticated(true)}
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
      />
    );
  }

  const mismatchCount = contributions.filter((c) => c.status === 'MISMATCH').length;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans flex flex-col antialiased selection:bg-emerald-500 selection:text-white transition-colors duration-200">
      {/* Navigation Header */}
      <Navbar
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSwitchRole={handleSwitchRole}
        unreadCount={unreadCount}
        notifications={notifications}
        onOpenNotifications={() => setActiveTab('notifications')}
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
        onOpenAuthModal={() => setShowAuthModal(true)}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">
        {activeTab === 'dashboard' && (
          <DashboardView
            user={user}
            balance={balance}
            claims={claims}
            contributions={contributions}
            mismatchCount={mismatchCount}
            onNavigate={setActiveTab}
            onRefreshBalance={loadData}
          />
        )}

        {activeTab === 'pf' && (
          <PassbookView
            balance={balance}
            contributions={contributions}
            employment={employment}
          />
        )}

        {activeTab === 'contributions' && (
          <ContributionsView
            contributions={contributions}
            onRefresh={loadData}
          />
        )}

        {activeTab === 'claims' && (
          <ClaimsView
            claims={claims}
            user={user}
            balance={balance}
            onRefresh={loadData}
          />
        )}

        {activeTab === 'kyc' && (
          <KycView
            kycRecords={kycRecords}
            onRefresh={loadData}
          />
        )}

        {activeTab === 'transfer' && (
          <TransferView
            transfers={transfers}
            onRefresh={loadData}
          />
        )}

        {activeTab === 'nomination' && (
          <NominationView
            nominations={nominations}
            onRefresh={loadData}
          />
        )}

        {activeTab === 'grievance' && (
          <GrievanceView
            grievances={grievances}
            onRefresh={loadData}
          />
        )}

        {activeTab === 'notifications' && (
          <NotificationsView
            notifications={notifications}
            onRefresh={loadData}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileView
            user={user}
            employment={employment}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 mt-12 text-xs text-slate-500 dark:text-slate-400 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <strong className="text-slate-700 dark:text-slate-200">EPFO 2.0 Unified Portal</strong> • Employees' Provident Fund Organisation, India.
          </div>
          <div className="flex items-center gap-4 text-slate-400 dark:text-slate-500">
            <span>24x7 Digital Service Delivery</span>
            <span>•</span>
            <span>Govt. of India Standard</span>
          </div>
        </div>
      </footer>

      {/* Authentication & Profile Creation Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        currentUser={user}
        onLogin={handleLogin}
        onVerifyOtp={handleVerifyOtp}
        onRegisterSuccess={handleRegisterSuccess}
        onLogout={handleLogout}
      />

      {/* Live System Architecture Inspector Modal */}
      <ArchitectureModal
        isOpen={showArchModal}
        onClose={() => setShowArchModal(false)}
      />
    </div>
  );
}
