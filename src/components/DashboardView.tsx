import React from 'react';
import {
  Wallet,
  TrendingUp,
  AlertOctagon,
  ArrowRight,
  ShieldCheck,
  FileText,
  Send,
  Users,
  MessageSquare,
  Database,
  Zap,
  Building2,
  ArrowUpRight,
  Award
} from 'lucide-react';
import { PFAccountBalance, Claim, ContributionRecord, User } from '../types';
import { RetirementWealthChart } from './RetirementWealthChart';

interface DashboardViewProps {
  user: User | null;
  balance: PFAccountBalance | null;
  claims: Claim[];
  contributions: ContributionRecord[];
  mismatchCount: number;
  onNavigate: (tab: string) => void;
  onRefreshBalance: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  balance,
  claims,
  contributions,
  mismatchCount,
  onNavigate,
  onRefreshBalance,
}) => {
  const totalBalance = balance?.totalBalance || 743400;
  const employeeShare = balance?.employeeShare || 424180;
  const employerShare = balance?.employerShare || 136820;
  const pensionFund = balance?.pensionFund || 182400;

  return (
    <div className="space-y-6">
      {/* Top Banner with Member Identification & Live Architecture Indicator */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden border border-slate-800 dark:border-slate-800">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                KYC Compliant (Aadhaar & Bank Linked)
              </span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                UAN: {user?.uan || '100982349012'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Welcome back, {user?.name || 'Ramesh Kumar'}
            </h1>
            <p className="text-slate-300 text-sm mt-1 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-slate-400" />
              Establishment: <strong>TechCorp India Solutions Ltd</strong> (DLCPM0019283000)
            </p>
          </div>

          {/* Quick Balance Hero Action */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('claims')}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-sm transition shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>File Online Claim</span>
            </button>
            <button
              onClick={() => onNavigate('pf')}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm border border-slate-700 transition flex items-center gap-2 cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>Download Passbook</span>
            </button>
          </div>
        </div>

        {/* Ledger & Session Status Line */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Ledger Status: <strong className="text-slate-200">Active & Verified</strong>
            </span>
            <span className="flex items-center gap-1.5 text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Security: <strong className="text-slate-200">256-Bit Encrypted Session</strong>
            </span>
          </div>
          <button
            onClick={onRefreshBalance}
            className="text-slate-400 hover:text-emerald-400 transition font-medium flex items-center gap-1 cursor-pointer"
          >
            <span>Sync Ledger</span>
          </button>
        </div>
      </div>

      {/* Mismatch Alert Banner (Reconciliation Engine Demo) */}
      {mismatchCount > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl p-4 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertOctagon className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-amber-900 dark:text-amber-200 text-sm">
                Contribution Reconciliation Engine Alert: {mismatchCount} Discrepancy Flagged
              </h4>
              <p className="text-xs text-amber-700 dark:text-amber-400/90 mt-0.5 leading-relaxed">
                The automatic reconciliation engine compared employer-submitted ECR against statutory wage rules and detected a variance in June 2026.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('contributions')}
            className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold transition whitespace-nowrap flex items-center gap-1 cursor-pointer"
          >
            <span>View Mismatch</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Balance Grid Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total PF Balance */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium mb-2">
            <span>Total Accumulation</span>
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            ₹{totalBalance.toLocaleString('en-IN')}
          </div>
          <div className="mt-2 text-[11px] text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>Interest @ 8.25% p.a. (FY 2025-26)</span>
          </div>
        </div>

        {/* Employee Share */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium mb-2">
            <span>Employee Share (EE)</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-slate-700 dark:text-slate-300">12% Wages</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            ₹{employeeShare.toLocaleString('en-IN')}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
            57.1% of total provident balance
          </div>
        </div>

        {/* Employer Share */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium mb-2">
            <span>Employer Share (ER)</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-slate-700 dark:text-slate-300">3.67% EPF</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            ₹{employerShare.toLocaleString('en-IN')}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
            Matched with monthly ECR deposits
          </div>
        </div>

        {/* Pension Fund */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium mb-2">
            <span>Pension Fund (EPS)</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-slate-700 dark:text-slate-300">8.33% EPS</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            ₹{pensionFund.toLocaleString('en-IN')}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
            Eligible for Form 10C / Scheme Cert.
          </div>
        </div>
      </div>

      {/* Two Column Section: Retirement Wealth Trajectory Chart + Quick Services */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Retirement Wealth Trajectory Chart (Replaced Asynchronous Claim Status per user request) */}
        <div className="lg:col-span-2">
          <RetirementWealthChart />
        </div>

        {/* Quick Services Navigation */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Quick Services</h3>
            <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
              <Award className="w-3.5 h-3.5" /> Instant STP
            </span>
          </div>

          <div className="space-y-2">
            {[
              { id: 'claims', title: 'File Online Claim', desc: 'Form 31 Advance / Form 19', icon: Send, color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40' },
              { id: 'transfer', title: 'One Member One PF Transfer', desc: 'Transfer previous member ID balance', icon: ArrowUpRight, color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40' },
              { id: 'nomination', title: 'e-Nomination Filing', desc: 'Aadhaar e-Sign family nominees', icon: Users, color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40' },
              { id: 'kyc', title: 'KYC Document Linking', desc: 'Bank account, PAN, Passport', icon: ShieldCheck, color: 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40' },
              { id: 'grievance', title: 'Lodge EPFiGMS Grievance', desc: 'Fast turnaround dispute resolution', icon: MessageSquare, color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40' },
            ].map((srv) => {
              const Icon = srv.icon;
              return (
                <button
                  key={srv.id}
                  onClick={() => onNavigate(srv.id)}
                  className="w-full p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition text-left flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${srv.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white">{srv.title}</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{srv.desc}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition transform group-hover:translate-x-0.5" />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
