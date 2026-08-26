import React, { useState } from 'react';
import {
  FileText,
  Printer,
  Calendar,
  Building,
  CheckCircle2,
  TrendingUp,
  CreditCard,
  Layers,
  ArrowDownLeft,
  ArrowUpRight
} from 'lucide-react';
import { PFAccountBalance, ContributionRecord, EmploymentRecord } from '../types';

interface PassbookViewProps {
  balance: PFAccountBalance | null;
  contributions: ContributionRecord[];
  employment: EmploymentRecord[];
}

export const PassbookView: React.FC<PassbookViewProps> = ({
  balance,
  contributions,
  employment,
}) => {
  const [selectedFY, setSelectedFY] = useState('2025-2026');
  const [selectedMemberId, setSelectedMemberId] = useState('DLCPM00192830000010928');

  const totalEE = balance?.employeeShare || 424180;
  const totalER = balance?.employerShare || 136820;
  const totalEPS = balance?.pensionFund || 182400;
  const totalSum = balance?.totalBalance || 743400;
  const interestEarned = Math.round(totalSum * 0.0825);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Passbook Controls & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Member Passbook</h2>
            <span className="px-2 py-0.5 rounded text-xs font-mono bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              Verified Ledger
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Electronic Passbook issued under Section 6 of EPF Act, 1952
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Member ID Selector */}
          <select
            value={selectedMemberId}
            onChange={(e) => setSelectedMemberId(e.target.value)}
            className="px-3 py-2 text-xs font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="DLCPM00192830000010928">TechCorp (DLCPM0019283000)</option>
            <option value="BGBNG00482910000084729">Infosys (BGBNG0048291000)</option>
          </select>

          {/* Financial Year Selector */}
          <select
            value={selectedFY}
            onChange={(e) => setSelectedFY(e.target.value)}
            className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="2025-2026">FY 2025 - 2026</option>
            <option value="2024-2025">FY 2024 - 2025</option>
            <option value="2023-2024">FY 2023 - 2024</option>
          </select>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 text-white text-xs font-medium transition flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>

      {/* Passbook Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 dark:bg-slate-950 text-white p-5 rounded-2xl shadow-sm border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Closing Balance (Net)</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">₹{totalSum.toLocaleString('en-IN')}</div>
          <div className="mt-2 text-[11px] text-slate-300 dark:text-slate-400">As on {new Date().toLocaleDateString('en-IN')}</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Employee Share (EE)</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">₹{totalEE.toLocaleString('en-IN')}</div>
          <div className="mt-2 text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">100% Withdrawable on eligibility</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Employer Share (ER)</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">₹{totalER.toLocaleString('en-IN')}</div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">Statutory 3.67% contribution</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Projected Annual Interest</div>
          <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 mt-1">+₹{interestEarned.toLocaleString('en-IN')}</div>
          <div className="mt-2 text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">@ 8.25% p.a. compound</div>
        </div>
      </div>

      {/* Passbook Transaction Ledger */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Monthly Wage & Contribution Ledger</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Verified through Electronic Challan cum Return (ECR)</p>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            Records: {contributions.length}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Wage Month</th>
                <th className="py-3 px-4">EPF Wages (₹)</th>
                <th className="py-3 px-4">Employee Share (12%)</th>
                <th className="py-3 px-4">Employer Share (3.67%)</th>
                <th className="py-3 px-4">Pension Fund (8.33%)</th>
                <th className="py-3 px-4">Total Deposited</th>
                <th className="py-3 px-4">ECR Challan Ref</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {contributions.map((row) => (
                <tr key={row.id} className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition ${row.status === 'MISMATCH' ? 'bg-amber-50/50 dark:bg-amber-950/20' : ''}`}>
                  <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                    {row.wageMonth}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-700 dark:text-slate-300">
                    ₹{row.epfWages.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-medium text-emerald-700 dark:text-emerald-400">
                    ₹{row.employeeShare.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-medium text-blue-700 dark:text-blue-400">
                    ₹{row.employerShare.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-medium text-purple-700 dark:text-purple-400">
                    ₹{row.pensionShare.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                    ₹{row.receivedTotal.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                    {row.ecrChallanNo}
                  </td>
                  <td className="py-3.5 px-4">
                    {row.status === 'MATCHED' ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                        Credited
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                        Variance ₹{row.expectedTotal - row.receivedTotal}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
