import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  UploadCloud,
  FileCheck,
  TrendingDown,
  RefreshCw,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Building,
  Info
} from 'lucide-react';
import { ContributionRecord } from '../types';
import { api } from '../services/api';

interface ContributionsViewProps {
  contributions: ContributionRecord[];
  onRefresh: () => void;
}

export const ContributionsView: React.FC<ContributionsViewProps> = ({
  contributions,
  onRefresh,
}) => {
  const [showSimulateModal, setShowSimulateModal] = useState(false);
  const [wageMonth, setWageMonth] = useState('2026-08');
  const [epfWages, setEpfWages] = useState(65000);
  const [employeeShare, setEmployeeShare] = useState(7800);
  const [employerShare, setEmployerShare] = useState(2470);
  const [pensionShare, setPensionShare] = useState(1250);
  const [simulating, setSimulating] = useState(false);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [notificationMsg, setNotificationMsg] = useState<{ type: 'success' | 'warning'; text: string } | null>(null);

  const mismatches = contributions.filter((c) => c.status === 'MISMATCH');

  const handleSimulateECR = async (e: React.FormEvent) => {
    e.preventDefault();
    setSimulating(true);
    setNotificationMsg(null);
    try {
      const res = await api.simulateEcrUpload({
        wageMonth,
        epfWages: Number(epfWages),
        epsWages: Math.min(Number(epfWages), 15000),
        employeeShare: Number(employeeShare),
        employerShare: Number(employerShare),
        pensionShare: Number(pensionShare),
      });

      if (res.isMismatch) {
        setNotificationMsg({
          type: 'warning',
          text: `ECR uploaded. Intelligent Reconciliation Engine flagged a variance in ${wageMonth}! Mismatch event dispatched to RabbitMQ.`,
        });
      } else {
        setNotificationMsg({
          type: 'success',
          text: `ECR for ${wageMonth} perfectly matched statutory statutory formula! Credited to member ledger.`,
        });
      }
      setShowSimulateModal(false);
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSimulating(false);
    }
  };

  const handleResolveMismatch = async (recordId: string) => {
    setResolvingId(recordId);
    try {
      const res = await api.resolveMismatch(recordId, 'Employer paid supplementary arrears challan via payment gateway.');
      setNotificationMsg({
        type: 'success',
        text: res.message || 'Discrepancy successfully resolved!',
      });
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setResolvingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Reconciliation Engine Header Banner */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Intelligent Contribution Reconciliation</h2>
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              EPFO 2.0 Engine
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Automated mathematical comparison between employer-submitted electronic challans and statutory wage schedules (EPF 12% + EPS 8.33% with wage ceiling caps).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSimulateModal(true)}
            className="px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 text-white text-xs font-semibold transition flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <UploadCloud className="w-4 h-4 text-emerald-400 dark:text-white" />
            <span>Simulate Employer ECR</span>
          </button>
        </div>
      </div>

      {notificationMsg && (
        <div
          className={`p-4 rounded-xl text-xs font-medium border flex items-center justify-between ${
            notificationMsg.type === 'warning'
              ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200'
              : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/60 text-emerald-900 dark:text-emerald-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {notificationMsg.type === 'warning' ? (
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            )}
            <span>{notificationMsg.text}</span>
          </div>
          <button onClick={() => setNotificationMsg(null)} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* Flagged Mismatches Section */}
      {mismatches.length > 0 && (
        <div className="bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <div>
              <h3 className="font-bold text-amber-950 dark:text-amber-200 text-sm">
                Flagged Contribution Discrepancies ({mismatches.length})
              </h3>
              <p className="text-xs text-amber-700 dark:text-amber-400">
                Action required by employer or field officer to reconcile variances.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {mismatches.map((m) => {
              const diff = m.expectedTotal - m.receivedTotal;
              return (
                <div
                  key={m.id}
                  className="bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-800/80 rounded-xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white text-sm">Wage Month: {m.wageMonth}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                        Variance: ₹{diff} Underpaid
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      <strong>Reason:</strong> {m.mismatchReason || 'Employer EPF share under-deposited.'}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 dark:text-slate-400 font-mono pt-1">
                      <span>Expected: ₹{m.expectedTotal.toLocaleString('en-IN')}</span>
                      <span>Received: ₹{m.receivedTotal.toLocaleString('en-IN')}</span>
                      <span>Challan: {m.ecrChallanNo}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleResolveMismatch(m.id)}
                      disabled={resolvingId === m.id}
                      className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{resolvingId === m.id ? 'Reconciling...' : 'Resolve Discrepancy'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Full Monthly Reconciliation Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 dark:text-white text-base">Reconciliation Audit Trail</h3>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">Matched vs Expected Breakdown</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Wage Month</th>
                <th className="py-3 px-4">Statutory Expected</th>
                <th className="py-3 px-4">Actual Deposited</th>
                <th className="py-3 px-4">Variance</th>
                <th className="py-3 px-4">Engine Validation</th>
                <th className="py-3 px-4">ECR Ref</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {contributions.map((c) => {
                const diff = c.expectedTotal - c.receivedTotal;
                return (
                  <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">{c.wageMonth}</td>
                    <td className="py-3 px-4 font-mono text-slate-700 dark:text-slate-300">₹{c.expectedTotal.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 font-mono font-medium text-slate-900 dark:text-white">₹{c.receivedTotal.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 font-mono font-bold">
                      {diff === 0 ? (
                        <span className="text-emerald-600 dark:text-emerald-400">₹0</span>
                      ) : (
                        <span className="text-amber-600 dark:text-amber-400">-₹{diff}</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {c.status === 'MATCHED' ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 text-xs font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          Matched
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400 text-xs font-medium">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                          Variance Alert
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400 dark:text-slate-500">{c.ecrChallanNo}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Simulate Employer ECR Upload */}
      {showSimulateModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 transition-colors">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Simulate Employer ECR Submission</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Test the Reconciliation Engine & Mismatch Alert Pipeline</p>
              </div>
              <button onClick={() => setShowSimulateModal(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleSimulateECR} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Wage Month</label>
                  <input
                    type="text"
                    value={wageMonth}
                    onChange={(e) => setWageMonth(e.target.value)}
                    placeholder="2026-08"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">EPF Gross Wages (₹)</label>
                  <input
                    type="number"
                    value={epfWages}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setEpfWages(v);
                      setEmployeeShare(Math.round(v * 0.12));
                      setEmployerShare(Math.round(v * 0.0367));
                      setPensionShare(1250);
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="font-semibold text-slate-800 dark:text-slate-200 text-[11px]">Simulate Deposited Amounts</div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-600 dark:text-slate-400">Employee (12%)</label>
                    <input
                      type="number"
                      value={employeeShare}
                      onChange={(e) => setEmployeeShare(Number(e.target.value))}
                      className="w-full px-2 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-600 dark:text-slate-400">Employer EPF</label>
                    <input
                      type="number"
                      value={employerShare}
                      onChange={(e) => setEmployerShare(Number(e.target.value))}
                      className="w-full px-2 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-600 dark:text-slate-400">Pension (EPS)</label>
                    <input
                      type="number"
                      value={pensionShare}
                      onChange={(e) => setPensionShare(Number(e.target.value))}
                      className="w-full px-2 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 italic">
                  Tip: Change 'Employer EPF' to a lower value (e.g. ₹1800) to trigger a mismatch event alert!
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSimulateModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={simulating}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{simulating ? 'Submitting ECR...' : 'Submit & Run Engine'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
