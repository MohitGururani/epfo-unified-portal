import React, { useState, useEffect } from 'react';
import {
  X,
  LogIn,
  UserPlus,
  ArrowRight,
  Smartphone,
  Building2,
  User as UserIcon,
  CheckCircle2,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { Role, User } from '../types';
import { api } from '../services/api';
import { AppLogo } from './AppLogo';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onLogin: (uan: string, role?: Role) => Promise<void>;
  onVerifyOtp: (uan: string, otp: string) => Promise<void>;
  onRegisterSuccess: (token: string, user: User) => void;
  onLogout: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLogin,
  onVerifyOtp,
  onRegisterSuccess,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'signin' | 'register' | 'switch'>('signin');
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
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (!otpSent) {
        setOtpSent(true);
      } else {
        await onVerifyOtp(uan, otp || '123456');
        onClose();
      }
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
      onClose();
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

      setSuccessMsg(`Welcome, ${res.user.name}! Profile created.`);
      onRegisterSuccess(res.token, res.user);
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
     <div
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden transition-colors"
      >
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center gap-2.5">
            <AppLogo size={34} />
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Account Management</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">EPFO 2.0 Unified Authentication</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Active Account Bar */}
        {currentUser && (
          <div className="px-6 py-2.5 bg-emerald-50/50 dark:bg-emerald-950/20 border-b border-emerald-100 dark:border-emerald-900/40 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">
                {currentUser.name.charAt(0)}
              </div>
              <div>
                <span className="font-semibold text-slate-900 dark:text-white">{currentUser.name}</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 ml-1.5 font-mono">({currentUser.role})</span>
              </div>
            </div>
            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="text-[11px] font-semibold text-red-600 dark:text-red-400 hover:underline cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="p-6 space-y-4">
          <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs">
            <button
              onClick={() => {
                setActiveTab('signin');
                setError(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-1.5 font-semibold rounded-lg flex items-center justify-center gap-1 transition cursor-pointer ${
                activeTab === 'signin'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('register');
                setError(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-1.5 font-semibold rounded-lg flex items-center justify-center gap-1 transition cursor-pointer ${
                activeTab === 'register'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Create Profile</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('switch');
                setError(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-1.5 font-semibold rounded-lg flex items-center justify-center gap-1 transition cursor-pointer ${
                activeTab === 'switch'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Demo Accounts</span>
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

          {/* TAB 1: Sign In */}
          {activeTab === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-3.5 text-xs">
              {!otpSent ? (
                <>
                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Universal Account Number (UAN)
                    </label>
                    <input
                      type="text"
                      value={uan}
                      onChange={(e) => setUan(e.target.value)}
                      placeholder="12-digit UAN"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-sm flex items-center justify-center gap-2 cursor-pointer mt-2"
                  >
                    <span>Request Aadhaar OTP</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </>
              ) : (
                <>
                  <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                    <span>Demo OTP sent to linked phone. (Use: <strong>123456</strong>)</span>
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Enter 6-Digit OTP</label>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="123456"
                      maxLength={6}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-mono text-center text-base tracking-widest focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>

                  <div className="flex gap-2 pt-1">
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
                      className="w-2/3 py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer"
                    >
                      {loading ? 'Verifying...' : 'Verify & Enter'}
                    </button>
                  </div>
                </>
              )}
            </form>
          )}

          {/* TAB 2: Create Profile */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3 text-xs max-h-[60vh] overflow-y-auto pr-1">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="e.g. Priya Sharma"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Email *</label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="user@epf.in"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Mobile *</label>
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="+91 9876543210"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Role</label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value as Role)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="EMPLOYEE">Member (Employee)</option>
                    <option value="EMPLOYER">Employer (HR)</option>
                    <option value="OFFICER">EPFO Officer</option>
                    <option value="ADMIN">System Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Initial Balance (₹)</label>
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
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Company / Establishment</label>
                <input
                  type="text"
                  value={regEmployer}
                  onChange={(e) => setRegEmployer(e.target.value)}
                  placeholder="e.g. Apex Global Tech"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-sm flex items-center justify-center gap-2 cursor-pointer mt-3"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{loading ? 'Creating...' : 'Register Profile & Log In'}</span>
              </button>
            </form>
          )}

          {/* TAB 3: Demo Persona Switcher */}
          {activeTab === 'switch' && (
            <div className="space-y-2 text-xs">
              <p className="text-slate-500 dark:text-slate-400 text-[11px] mb-2">
                Click any persona below to immediately log in and explore their dashboard views:
              </p>

              <button
                onClick={() => handleQuickLogin('EMPLOYEE', '100982349012')}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 transition text-left flex items-center justify-between cursor-pointer"
              >
                <div>
                  <div className="font-semibold text-emerald-700 dark:text-emerald-400">Ramesh Kumar</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">Employee Member (UAN: 100982349012)</div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">Member</span>
              </button>

              <button
                onClick={() => handleQuickLogin('EMPLOYER', '200118844332')}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500 transition text-left flex items-center justify-between cursor-pointer"
              >
                <div>
                  <div className="font-semibold text-blue-700 dark:text-blue-400">TechCorp India HR Desk</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">Establishment ECR & Challans</div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">Employer</span>
              </button>

              <button
                onClick={() => handleQuickLogin('OFFICER', '300998877665')}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-amber-500 transition text-left flex items-center justify-between cursor-pointer"
              >
                <div>
                  <div className="font-semibold text-amber-700 dark:text-amber-400">Sunita Rao, APFC</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">Field Claim Review Officer</div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">Officer</span>
              </button>

              <button
                onClick={() => handleQuickLogin('ADMIN', '400112233445')}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-purple-500 transition text-left flex items-center justify-between cursor-pointer"
              >
                <div>
                  <div className="font-semibold text-purple-700 dark:text-purple-400">Central Gateway DevOps</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">System Monitoring & Logs</div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300">Admin</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
