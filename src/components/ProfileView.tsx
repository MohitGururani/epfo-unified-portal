import React from 'react';
import {
  User,
  Building,
  CreditCard,
  ShieldCheck,
  Calendar,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';
import { User as UserType, EmploymentRecord } from '../types';

interface ProfileViewProps {
  user: UserType | null;
  employment: EmploymentRecord[];
}

export const ProfileView: React.FC<ProfileViewProps> = ({ user, employment }) => {
  return (
    <div className="space-y-6">
      {/* Profile Header Card */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 transition-colors">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold text-2xl flex items-center justify-center shadow-md">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{user?.name}</h2>
              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                Verified UAN
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
              Universal Account Number (UAN): <strong className="text-slate-800 dark:text-slate-200">{user?.uan}</strong>
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-300 mt-2">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {user?.email}
              </span>
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                {user?.phone}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Member Details & Demographics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 transition-colors">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm border-b border-slate-100 dark:border-slate-800 pb-2">
            Demographic Information
          </h3>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">
              <span>Member Name:</span>
              <strong className="text-slate-900 dark:text-slate-200">{user?.name}</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">
              <span>Father / Husband Name:</span>
              <strong className="text-slate-900 dark:text-slate-200">Sh. Mahendra Verma</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">
              <span>Date of Birth:</span>
              <strong className="text-slate-900 dark:text-slate-200">14-Nov-1990</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">
              <span>Gender:</span>
              <strong className="text-slate-900 dark:text-slate-200">Male</strong>
            </div>
            <div className="flex justify-between py-1 text-slate-600 dark:text-slate-400">
              <span>Marital Status:</span>
              <strong className="text-slate-900 dark:text-slate-200">Married</strong>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 transition-colors">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm border-b border-slate-100 dark:border-slate-800 pb-2">
            Banking & KYC Summary
          </h3>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">
              <span>Aadhaar Number:</span>
              <strong className="font-mono text-slate-900 dark:text-slate-200">XXXX-XXXX-8921</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">
              <span>PAN Reference:</span>
              <strong className="font-mono text-slate-900 dark:text-slate-200">ABCDE1234F</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">
              <span>Bank Name & IFSC:</span>
              <strong className="font-mono text-slate-900 dark:text-slate-200">HDFC Bank (HDFC0000029)</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">
              <span>Account Number:</span>
              <strong className="font-mono text-slate-900 dark:text-slate-200">002910100049281</strong>
            </div>
            <div className="flex justify-between py-1 text-slate-600 dark:text-slate-400">
              <span>KYC Seeding:</span>
              <strong className="text-emerald-700 dark:text-emerald-400 font-semibold">100% Fully Compliant</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Employment Service History */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 dark:text-white text-base">Employment Service History</h3>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">Establishments: {employment.length}</span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {employment.map((emp) => (
            <div key={emp.id} className="p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">{emp.establishmentName}</h4>
                  {emp.currentEmployer && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                      Current Employer
                    </span>
                  )}
                </div>
                <span className="text-xs font-mono text-slate-500 dark:text-slate-400">Est ID: {emp.establishmentId}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Member ID</span>
                  <div className="font-mono font-medium text-slate-800 dark:text-slate-200 mt-0.5">{emp.memberId}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Date of Joining</span>
                  <div className="font-medium text-slate-800 dark:text-slate-200 mt-0.5">{emp.dateOfJoining}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Date of Exit</span>
                  <div className="font-medium text-slate-800 dark:text-slate-200 mt-0.5">
                    {emp.dateOfExit ? `${emp.dateOfExit} (${emp.exitReason})` : 'Active / Present'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
