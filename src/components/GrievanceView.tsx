import React, { useState } from 'react';
import {
  MessageSquare,
  CheckCircle2,
  Clock,
  Send,
  HelpCircle,
  ShieldAlert,
  UserCheck,
  X
} from 'lucide-react';
import { Grievance } from '../types';
import { api } from '../services/api';

interface GrievanceViewProps {
  grievances: Grievance[];
  onRefresh: () => void;
}

export const GrievanceView: React.FC<GrievanceViewProps> = ({ grievances, onRefresh }) => {
  const [showModal, setShowModal] = useState(false);
  const [category, setCategory] = useState<Grievance['category']>('PASSBOOK_ERROR');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.lodgeGrievance({
        category,
        subject,
        description,
      });
      setShowModal(false);
      setSubject('');
      setDescription('');
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const categoryNames: Record<Grievance['category'], string> = {
    CLAIM_SETTLEMENT: 'Claim Settlement Delay / Rejection',
    PASSBOOK_ERROR: 'Passbook or Contribution Discrepancy',
    TRANSFER_ISSUE: 'PF Transfer Issue (Form 13)',
    EMPLOYER_DEFAULT: 'Employer Non-Remittance of EPF',
    OTHER: 'Other Scheme / Member Assistance',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">EPFiGMS Grievance Portal</h2>
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
              SLA Resolution 7 Days
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Lodge disputes regarding claims, passbook entries, or employer non-deposits with direct APFC officer escalation.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 text-white text-xs font-semibold transition flex items-center gap-2 shadow-sm cursor-pointer"
        >
          <Send className="w-4 h-4 text-emerald-400 dark:text-white" />
          <span>Lodge Grievance</span>
        </button>
      </div>

      {/* Grievances List */}
      <div className="space-y-3">
        {grievances.map((g) => (
          <div
            key={g.id}
            className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 transition-colors"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">{g.registrationNumber}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {categoryNames[g.category]}
                </span>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                g.status === 'RESOLVED'
                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
              }`}>
                {g.status.replace(/_/g, ' ')}
              </span>
            </div>

            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">{g.subject}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">{g.description}</p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700/60 text-xs flex flex-wrap items-center justify-between gap-2">
              <span className="text-slate-600 dark:text-slate-300">
                Assigned APFC: <strong className="text-slate-900 dark:text-white">{g.assignedOfficer || 'Central Field Desk'}</strong>
              </span>
              <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                Registered: {new Date(g.registeredAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Lodge Grievance */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white transition-colors">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Lodge EPFiGMS Grievance</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Grievance Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="PASSBOOK_ERROR">Passbook or Contribution Discrepancy</option>
                  <option value="CLAIM_SETTLEMENT">Claim Settlement Delay / Rejection</option>
                  <option value="TRANSFER_ISSUE">PF Transfer Issue (Form 13)</option>
                  <option value="EMPLOYER_DEFAULT">Employer Non-Remittance</option>
                  <option value="OTHER">Other Assistance</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Brief summary of issue"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Detailed Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Provide wage months, amount, or claim ID references..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
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
                  {submitting ? 'Registering...' : 'Register Grievance Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
