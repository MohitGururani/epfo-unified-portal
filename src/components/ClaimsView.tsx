import React, { useState, useEffect } from 'react';
import {
  Send,
  CheckCircle2,
  Clock,
  AlertCircle,
  Cpu,
  Layers,
  ChevronRight,
  ShieldCheck,
  Building,
  RefreshCw,
  Sparkles,
  ArrowRight,
  UserCheck,
  CreditCard
} from 'lucide-react';
import { Claim, ClaimType, ClaimStatus, User, PFAccountBalance } from '../types';
import { api } from '../services/api';

interface ClaimsViewProps {
  claims: Claim[];
  user: User | null;
  balance: PFAccountBalance | null;
  onRefresh: () => void;
}

export const ClaimsView: React.FC<ClaimsViewProps> = ({
  claims,
  user,
  balance,
  onRefresh,
}) => {
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(claims[0]?.id || null);
  const [showNewClaimModal, setShowNewClaimModal] = useState(false);
  const [claimType, setClaimType] = useState<ClaimType>('FORM_31');
  const [purpose, setPurpose] = useState('Medical Treatment for Family Member');
  const [amountRequested, setAmountRequested] = useState(75000);
  const [bankAccount, setBankAccount] = useState('002910100049281');
  const [ifscCode, setIfscCode] = useState('HDFC0000029');
  const [submitting, setSubmitting] = useState(false);
  const [autoPolling, setAutoPolling] = useState(true);

  const selectedClaim = claims.find((c) => c.id === selectedClaimId) || claims[0];

  // Auto-poll active claims when worker is processing
  useEffect(() => {
    if (!autoPolling) return;
    const interval = setInterval(() => {
      const isAnyActive = claims.some((c) => !['COMPLETED', 'REJECTED'].includes(c.status));
      if (isAnyActive) {
        onRefresh();
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [autoPolling, claims, onRefresh]);

  const handleSubmitClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.submitClaim({
        claimType,
        purpose,
        amountRequested: Number(amountRequested),
        bankAccount,
        ifscCode,
      });

      setShowNewClaimModal(false);
      setSelectedClaimId(res.claimId);
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOfficerAction = async (action: 'APPROVE' | 'REJECT') => {
    if (!selectedClaim) return;
    try {
      await api.officerClaimAction(selectedClaim.id, action, 'Manual override endorsed by EPFO APFC Field Officer.', 'Officer S. Rao (APFC)');
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Workflow Stages Definition (Step 9)
  const workflowStages: { key: ClaimStatus; label: string; desc: string }[] = [
    { key: 'SUBMITTED', label: 'Claim Submitted', desc: 'Online portal registration & queued on RabbitMQ' },
    { key: 'VALIDATING', label: 'Demographic Validation', desc: 'Aadhaar CIDR & UAN demographic format matching' },
    { key: 'KYC_VERIFICATION', label: 'KYC & Bank NPCI Check', desc: 'Penny-drop bank IFSC & active PAN validation' },
    { key: 'ELIGIBILITY_CHECK', label: 'Eligibility & Rules Check', desc: 'Service tenure, balance sufficiency & reason audit' },
    { key: 'EPFO_REVIEW', label: 'EPFO Officer Review', desc: 'APFC officer digital sign-off / Auto-settlement' },
    { key: 'APPROVED', label: 'Claim Approved', desc: 'Settlement sanction order issued' },
    { key: 'PAYMENT_INITIATED', label: 'Payment Mandate Dispatched', desc: 'NEFT credit instruction sent to RBI clearinghouse' },
    { key: 'COMPLETED', label: 'Settlement Completed', desc: 'Funds credited to beneficiary account with UTR' },
  ];

  const getStageIndex = (status: ClaimStatus) => {
    if (status === 'REJECTED') return -1;
    return workflowStages.findIndex((s) => s.key === status);
  };

  const currentStageIndex = selectedClaim ? getStageIndex(selectedClaim.status) : 0;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Online Claims & Workflow Engine</h2>
            <span className="px-2 py-0.5 rounded text-xs font-mono bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              RabbitMQ Async Engine
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Decoupled claim processing via message queue workers & transparent multi-stage verification.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onRefresh}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
            title="Refresh Claim Status"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowNewClaimModal(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>File New Claim</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Claims List + Live Workflow Tracker */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Claims List */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Your Claims ({claims.length})</h3>
            <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">Live Worker Sync</span>
          </div>

          <div className="space-y-2.5">
            {claims.map((c) => {
              const isSelected = selectedClaim?.id === c.id;
              const isFinished = c.status === 'COMPLETED';
              const isRejected = c.status === 'REJECTED';

              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedClaimId(c.id)}
                  className={`p-4 rounded-xl border transition cursor-pointer text-left ${
                    isSelected
                      ? 'bg-slate-900 dark:bg-emerald-950/40 text-white border-slate-900 dark:border-emerald-600 shadow-md'
                      : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[11px] font-mono font-bold ${isSelected ? 'text-emerald-400' : 'text-slate-700 dark:text-slate-300'}`}>
                      {c.id}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isSelected
                          ? isFinished
                            ? 'bg-emerald-500/30 text-emerald-300'
                            : isRejected
                            ? 'bg-red-500/30 text-red-300'
                            : 'bg-amber-500/30 text-amber-300 animate-pulse'
                          : isFinished
                          ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300'
                          : isRejected
                          ? 'bg-red-100 dark:bg-red-950/70 text-red-800 dark:text-red-300'
                          : 'bg-blue-100 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300 animate-pulse'
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>

                  <h4 className={`text-xs font-semibold mt-1.5 line-clamp-1 ${isSelected ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                    {c.claimTypeName}
                  </h4>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/20 dark:border-slate-800 text-[11px]">
                    <span className="font-bold">₹{c.amountRequested.toLocaleString('en-IN')}</span>
                    <span className={isSelected ? 'text-slate-400' : 'text-slate-500 dark:text-slate-400'}>
                      {new Date(c.submittedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed Asynchronous State Machine & Status Timeline */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6 transition-colors">
          {selectedClaim ? (
            <>
              {/* Claim Overview Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-slate-900 dark:text-white">{selectedClaim.id}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      selectedClaim.status === 'COMPLETED'
                        ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300'
                        : selectedClaim.status === 'REJECTED'
                        ? 'bg-red-100 dark:bg-red-950/70 text-red-800 dark:text-red-300'
                        : 'bg-blue-100 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300'
                    }`}>
                      {selectedClaim.status}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">{selectedClaim.claimTypeName}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Purpose: {selectedClaim.purpose} • Bank: {selectedClaim.bankAccount} ({selectedClaim.ifscCode})
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <div className="text-xs text-slate-500 dark:text-slate-400">Sanctioned Amount</div>
                  <div className="text-xl font-bold text-slate-900 dark:text-white">
                    ₹{(selectedClaim.amountApproved || selectedClaim.amountRequested).toLocaleString('en-IN')}
                  </div>
                  {selectedClaim.workerJobId && (
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">
                      Job: {selectedClaim.workerJobId}
                    </div>
                  )}
                </div>
              </div>

              {/* Live Asynchronous State Machine Progress Bar */}
              <div className="space-y-3 bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wide">
                      RabbitMQ Claim Workflow Engine
                    </h4>
                  </div>
                  {currentStageIndex >= 0 && currentStageIndex < workflowStages.length - 1 && (
                    <span className="text-[11px] font-medium text-blue-700 dark:text-blue-400 animate-pulse flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400"></span>
                      Active Background Pipeline Running...
                    </span>
                  )}
                </div>

                {/* Stepper Timeline Grid */}
                <div className="space-y-4 pt-2">
                  {workflowStages.map((stage, idx) => {
                    const isPassed = currentStageIndex > idx;
                    const isCurrent = currentStageIndex === idx;
                    const isPending = currentStageIndex < idx;

                    return (
                      <div key={stage.key} className="flex items-start gap-3 relative">
                        {/* Connecting line */}
                        {idx < workflowStages.length - 1 && (
                          <div
                            className={`absolute left-3.5 top-7 bottom-0 w-0.5 -mb-4 ${
                              isPassed ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'
                            }`}
                          />
                        )}

                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 z-10 transition-colors ${
                            isPassed
                              ? 'bg-emerald-600 text-white'
                              : isCurrent
                              ? 'bg-blue-600 text-white ring-4 ring-blue-100 dark:ring-blue-900/40 animate-pulse'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          {isPassed ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                        </div>

                        <div className="flex-1 text-xs">
                          <div className="flex items-center justify-between">
                            <span
                              className={`font-semibold ${
                                isPassed
                                  ? 'text-emerald-950 dark:text-emerald-300'
                                  : isCurrent
                                  ? 'text-blue-900 dark:text-blue-300 font-bold'
                                  : 'text-slate-400 dark:text-slate-500'
                              }`}
                            >
                              {stage.label}
                            </span>
                            {isCurrent && (
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-semibold">
                                IN PROCESS
                              </span>
                            )}
                          </div>
                          <p className={`text-[11px] mt-0.5 ${isPending ? 'text-slate-400 dark:text-slate-500' : 'text-slate-600 dark:text-slate-400'}`}>
                            {stage.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Status Audit Trail Log */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                  Claim Status Transition History ({selectedClaim.statusHistory.length} Events)
                </h4>

                <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden text-xs">
                  {selectedClaim.statusHistory.map((item) => (
                    <div key={item.id} className="p-3.5 bg-white dark:bg-slate-900/60 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                            {item.status}
                          </span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200 text-[11px]">{item.performedBy}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed pl-1">{item.comment}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Officer Review Actions (for Demo / APFC Officer role) */}
              {(user?.role === 'OFFICER' || user?.role === 'ADMIN') && !['COMPLETED', 'REJECTED'].includes(selectedClaim.status) && (
                <div className="bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/50 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="text-xs">
                    <span className="font-bold text-purple-950 dark:text-purple-300">APFC Officer Review Desk:</span>
                    <p className="text-purple-800 dark:text-purple-400">Endorse digital signature approval or reject claim application.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOfficerAction('APPROVE')}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold cursor-pointer"
                    >
                      Approve Claim
                    </button>
                    <button
                      onClick={() => handleOfficerAction('REJECT')}
                      className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold cursor-pointer"
                    >
                      Reject Claim
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-slate-500 dark:text-slate-400 text-sm">
              Select or submit a claim to inspect its state machine.
            </div>
          )}
        </div>
      </div>

      {/* Modal: File New Claim */}
      {showNewClaimModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 transition-colors">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">File Online PF Claim</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Asynchronous processing via RabbitMQ Worker</p>
              </div>
              <button onClick={() => setShowNewClaimModal(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitClaim} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Claim Form Type</label>
                <select
                  value={claimType}
                  onChange={(e) => setClaimType(e.target.value as ClaimType)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="FORM_31">Form 31 — Advance / Partial Withdrawal (Illness, Housing, Education)</option>
                  <option value="FORM_19">Form 19 — Final PF Settlement (Post Exit / Superannuation)</option>
                  <option value="FORM_10C">Form 10C — Scheme Certificate / Pension Withdrawal Benefit</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Purpose / Reason</label>
                <input
                  type="text"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="e.g. Medical Treatment for self/family"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Amount Requested (₹)</label>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Max Available: ₹{(balance?.totalBalance || 743400).toLocaleString('en-IN')}
                  </span>
                </div>
                <input
                  type="number"
                  value={amountRequested}
                  onChange={(e) => setAmountRequested(Number(e.target.value))}
                  min={1000}
                  max={balance?.totalBalance || 1000000}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono font-bold text-sm focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="font-semibold text-slate-800 dark:text-slate-200 text-xs flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  Verified Disbursal Account (NPCI Linked)
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-500 dark:text-slate-400">Bank Account</label>
                    <input
                      type="text"
                      value={bankAccount}
                      onChange={(e) => setBankAccount(e.target.value)}
                      className="w-full px-2 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 dark:text-slate-400">IFSC Code</label>
                    <input
                      type="text"
                      value={ifscCode}
                      onChange={(e) => setIfscCode(e.target.value)}
                      className="w-full px-2 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono text-[11px]"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewClaimModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitting ? 'Enqueueing Job...' : 'Submit & Enqueue'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
