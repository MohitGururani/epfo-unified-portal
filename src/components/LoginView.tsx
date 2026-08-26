import React, { useState } from 'react';
import {
  ShieldCheck,
  UserCheck,
  Building,
  KeyRound,
  ArrowRight,
  Sparkles,
  Lock,
  Smartphone,
  UserPlus,
  LogIn,
  Sun,
  Moon,
  Building2,
  Mail,
  User as UserIcon,
  CreditCard
} from 'lucide-react';
import { Role, User } from '../types';
import { api } from '../services/api';
import { AppLogo } from './AppLogo';

interface LoginViewProps {
  onLogin: (uan: string, role?: Role) => Promise<void>;
  onVerifyOtp: (uan: string, otp: string) => Promise<void>;
  onRegisterSuccess?: (token: string, user: User) => void;
  onContinueAsGuest?: () => void;
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onLogin,
  onVerifyOtp,
  onRegisterSuccess,
  onContinueAsGuest,
  darkMode = false,
  onToggleDarkMode,
}) => {
  const [activeMode, setActiveMode] = useState<'signin' | 'register'>('signin');
  const [uan, setUan] = useState('100982349012');
  const [password, setPassword] = useState('••••••••••••');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Register state
  const [regName, setRegName] = useState('');
  const [regUan, setRegUan] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regRole, setRegRole] = useState<Role>('EMPLOYEE');
  const [regAadhaar, setRegAadhaar] = useState('');
  const [regEmployer, setRegEmployer] = useState('');
  const [regBalance, setRegBalance] = useState('350000');

  const handleInitialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      setOtpSent(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await onVerifyOtp(uan, otp || '123456');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (role: Role, presetUan: string) => {
    setLoading(true);
    setError(null);
    try {
      await onLogin(presetUan, role);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await api.register({
        name: regName,
        uan: regUan || undefined,
        email: regEmail,
        phone: regPhone,
        role: regRole,
        aadhaarNumber: regAadhaar,
        establishmentName: regEmployer,
        initialBalance: Number(regBalance) || 350000,
      });

      setSuccessMsg(`Welcome, ${res.user.name}! Your account has been registered.`);
      if (onRegisterSuccess) {
        onRegisterSuccess(res.token, res.user);
      } else {
        await onLogin(res.user.uan, res.user.role);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 text-slate-900 dark:text-slate-100 relative overflow-hidden transition-colors">
      {/* Top Bar Switcher */}
      {onToggleDarkMode && (
        <div className="absolute top-4 right-4 z-20 flex items-center bg-white/80 dark:bg-slate-900/80 p-0.5 rounded-lg border border-slate-200 dark:border-slate-800 text-[11px] shadow-sm backdrop-blur-sm">
          <button
            type="button"
            onClick={() => {
              if (darkMode) onToggleDarkMode();
            }}
            className={`flex items-center gap-1 px-2 py-1 rounded-md transition font-medium cursor-pointer ${
              !darkMode
                ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40 shadow-xs font-semibold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="Day Mode (Light theme)"
          >
            <Sun className={`w-3 h-3 ${!darkMode ? 'text-amber-500' : 'text-slate-400'}`} />
            <span>Day</span>
          </button>
          <button
            type="button"
            onClick={() => {
              if (!darkMode) onToggleDarkMode();
            }}
            className={`flex items-center gap-1 px-2 py-1 rounded-md transition font-medium cursor-pointer ${
              darkMode
                ? 'bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-500/40 shadow-xs font-semibold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="Night Mode (Dark theme)"
          >
            <Moon className={`w-3 h-3 ${darkMode ? 'text-blue-400' : 'text-slate-400'}`} />
            <span>Night</span>
          </button>
        </div>
      )}

      {/* Visual background blur */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2 relative z-10">
        <div className="flex justify-center">
          <AppLogo size={52} />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">EPFO 2.0 Unified Portal</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Employees' Provident Fund Organisation • Ministry of Labour & Employment
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 py-6 px-6 sm:px-8 shadow-xl rounded-2xl space-y-5 transition-colors">
          
          {/* Mode Tabs: Sign In vs Create Profile */}
          <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              onClick={() => {
                setActiveMode('signin');
                setError(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer ${
                activeMode === 'signin'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Member Sign In</span>
            </button>
            <button
              onClick={() => {
                setActiveMode('register');
                setError(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer ${
                activeMode === 'register'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Create New Profile</span>
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-medium">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-medium">
              {successMsg}
            </div>
          )}

          {/* Tab 1: Sign In */}
          {activeMode === 'signin' && (
            <>
              {!otpSent ? (
                <form onSubmit={handleInitialSubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Universal Account Number (UAN) / Est ID
                    </label>
                    <input
                      type="text"
                      value={uan}
                      onChange={(e) => setUan(e.target.value)}
                      placeholder="Enter 12-digit UAN"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Password / Security PIN</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition shadow-sm flex items-center justify-center gap-2 mt-2 cursor-pointer"
                  >
                    <span>Generate Aadhaar OTP</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleOtpSubmit} className="space-y-4 text-xs">
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                    <span>Simulated OTP sent to Aadhaar linked mobile ending in <strong>3210</strong> (Demo OTP: <strong>123456</strong>)</span>
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Enter 6-Digit OTP</label>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="123456"
                      maxLength={6}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-mono text-center text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="w-1/3 py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs font-medium cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-2/3 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition cursor-pointer"
                    >
                      {loading ? 'Authenticating...' : 'Verify & Enter Portal'}
                    </button>
                  </div>
                </form>
              )}

              {/* Quick Demo Persona Switcher */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">
                  1-Click Demo Profiles
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    onClick={() => handleQuickLogin('EMPLOYEE', '100982349012')}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 transition text-left space-y-0.5 cursor-pointer"
                  >
                    <div className="font-semibold text-emerald-700 dark:text-emerald-400">Ramesh Kumar</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">Employee Member</div>
                  </button>

                  <button
                    onClick={() => handleQuickLogin('EMPLOYER', '200118844332')}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500 transition text-left space-y-0.5 cursor-pointer"
                  >
                    <div className="font-semibold text-blue-700 dark:text-blue-400">TechCorp HR</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">Employer ECR Desk</div>
                  </button>

                  <button
                    onClick={() => handleQuickLogin('OFFICER', '300998877665')}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-amber-500 transition text-left space-y-0.5 cursor-pointer"
                  >
                    <div className="font-semibold text-amber-700 dark:text-amber-400">Sunita Rao, APFC</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">Field Claim Officer</div>
                  </button>

                  <button
                    onClick={() => handleQuickLogin('ADMIN', '400112233445')}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-purple-500 transition text-left space-y-0.5 cursor-pointer"
                  >
                    <div className="font-semibold text-purple-700 dark:text-purple-400">Central Admin</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">Gateway DevOps</div>
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Tab 2: Create New Profile / Register */}
          {activeMode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Full Legal Name *</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Mohit Gururani"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address *</label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Mobile Phone *</label>
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Custom UAN (Optional)</label>
                  <input
                    type="text"
                    value={regUan}
                    onChange={(e) => setRegUan(e.target.value)}
                    placeholder="Auto-generated if blank"
                    maxLength={12}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Aadhaar (Last 4 digits)</label>
                  <input
                    type="text"
                    value={regAadhaar}
                    onChange={(e) => setRegAadhaar(e.target.value)}
                    placeholder="e.g. 8492"
                    maxLength={4}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Portal Role</label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value as Role)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="EMPLOYEE">Member (Employee)</option>
                    <option value="EMPLOYER">Employer / Establishment</option>
                    <option value="OFFICER">EPFO Field Officer</option>
                    <option value="ADMIN">System Administrator</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Initial PF Balance (₹)</label>
                  <input
                    type="number"
                    value={regBalance}
                    onChange={(e) => setRegBalance(e.target.value)}
                    placeholder="350000"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Company / Establishment Name</label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={regEmployer}
                    onChange={(e) => setRegEmployer(e.target.value)}
                    placeholder="e.g. Acme Innovations Pvt Ltd"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition shadow-sm flex items-center justify-center gap-2 mt-3 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>{loading ? 'Creating Profile...' : 'Create Account & Enter Portal'}</span>
              </button>
            </form>
          )}

          {onContinueAsGuest && (
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={onContinueAsGuest}
                className="text-xs text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium cursor-pointer"
              >
                Continue to Portal as Guest →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
