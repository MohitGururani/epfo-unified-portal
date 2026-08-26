import React, { useState } from 'react';
import {
  ArrowRightLeft,
  CheckCircle2,
  Clock,
  Building,
  ShieldCheck,
  Send,
  ArrowRight,
  X
} from 'lucide-react';
import { TransferRequest } from '../types';
import { api } from '../services/api';

interface TransferViewProps {
  transfers: TransferRequest[];
  onRefresh: () => void;
}

export const TransferView: React.FC<TransferViewProps> = ({ transfers, onRefresh }) => {
  const [showModal, setShowModal] = useState(false);
  const [previousEst, setPreviousEst] = useState('Infosys Infotech Ltd (BGBNG0048291000)');
  const [previousMemberId, setPreviousMemberId] = useState('BGBNG00482910000084729');
  const [presentEst, setPresentEst] = useState('TechCorp India Solutions Ltd (DLCPM0019283000)');
  const [presentMemberId, setPresentMemberId] = useState('DLCPM00192830000010928');
  const [attestationThrough, setAttestationThrough] = useState<'PREVIOUS_EMPLOYER' | 'PRESENT_EMPLOYER'>('PRESENT_EMPLOYER');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.submitTransfer({
        previousEstablishment: previousEst,
        previousMemberId,
        presentEstablishment: presentEst,
        presentMemberId,
        attestationThrough,
      });
      setShowModal(false);
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">One Member One EPF Transfer</h2>
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              Form 13 Online
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Transfer accumulated balance & service period seamlessly from previous establishment to current establishment.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 text-white text-xs font-semibold transition flex items-center gap-2 shadow-sm cursor-pointer"
        >
          <Send className="w-4 h-4 text-emerald-400 dark:text-white" />
          <span>New Transfer Request</span>
        </button>
      </div>

      {/* Transfer Requests Ledger */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 dark:text-white text-base">Transfer History & Tracking</h3>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">Requests: {transfers.length}</span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {transfers.map((t) => (
            <div key={t.id} className="p-5 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">{t.trackingId}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    t.status === 'TRANSFER_COMPLETED'
                      ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                      : 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                  }`}>
                    {t.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Applied: {new Date(t.submittedAt).toLocaleDateString()}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700/60 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-400 uppercase font-semibold">Previous Account (Source)</span>
                  <div className="font-semibold text-slate-900 dark:text-white mt-0.5">{t.previousEstablishment}</div>
                  <div className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">{t.previousMemberId}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-400 uppercase font-semibold">Present Account (Destination)</span>
                  <div className="font-semibold text-slate-900 dark:text-white mt-0.5">{t.presentEstablishment}</div>
                  <div className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">{t.presentMemberId}</div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
                <span>Attestation Mode: <strong className="text-slate-800 dark:text-slate-200">{t.attestationThrough.replace(/_/g, ' ')}</strong></span>
                {t.completedAt && (
                  <span className="text-emerald-700 dark:text-emerald-400 font-medium">
                    Credited & Reconciled on {new Date(t.completedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal: New Transfer Request */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white transition-colors">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Submit Transfer (Form 13)</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Previous Establishment & Member ID</label>
                <input
                  type="text"
                  value={previousEst}
                  onChange={(e) => setPreviousEst(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white mb-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
                <input
                  type="text"
                  value={previousMemberId}
                  onChange={(e) => setPreviousMemberId(e.target.value)}
                  placeholder="Previous Member ID"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Present Establishment & Member ID</label>
                <input
                  type="text"
                  value={presentEst}
                  onChange={(e) => setPresentEst(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white mb-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
                <input
                  type="text"
                  value={presentMemberId}
                  onChange={(e) => setPresentMemberId(e.target.value)}
                  placeholder="Present Member ID"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Attestation Through</label>
                <select
                  value={attestationThrough}
                  onChange={(e) => setAttestationThrough(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="PRESENT_EMPLOYER">Present Employer (Recommended)</option>
                  <option value="PREVIOUS_EMPLOYER">Previous Employer</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer transition"
                >
                  {submitting ? 'Submitting...' : 'Submit Form 13 Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
