import React, { useState } from 'react';
import {
  Users,
  CheckCircle2,
  Plus,
  ShieldCheck,
  Percent,
  Calendar,
  UserCheck,
  X
} from 'lucide-react';
import { Nomination } from '../types';
import { api } from '../services/api';

interface NominationViewProps {
  nominations: Nomination[];
  onRefresh: () => void;
}

export const NominationView: React.FC<NominationViewProps> = ({ nominations, onRefresh }) => {
  const [showModal, setShowModal] = useState(false);
  const [nomineeName, setNomineeName] = useState('');
  const [relationship, setRelationship] = useState('SPOUSE');
  const [dateOfBirth, setDateOfBirth] = useState('1995-06-15');
  const [sharePercentage, setSharePercentage] = useState(100);
  const [aadhaarLast4, setAadhaarLast4] = useState('5521');
  const [submitting, setSubmitting] = useState(false);

  const totalAllocated = nominations.reduce((sum, n) => sum + n.sharePercentage, 0);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.addNomination({
        nomineeName,
        relationship,
        dateOfBirth,
        sharePercentage: Number(sharePercentage),
        isMinor: false,
        aadhaarLast4,
        eSigned: true,
      });
      setShowModal(false);
      setNomineeName('');
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
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">e-Nomination (EPF & EPS)</h2>
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              Aadhaar e-Sign Active
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Digital nomination declaration with family details and percentage share allocation.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 text-white text-xs font-semibold transition flex items-center gap-2 shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4 text-emerald-400 dark:text-white" />
          <span>Add Family Nominee</span>
        </button>
      </div>

      {/* Nominees Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {nominations.map((nom) => (
          <div
            key={nom.id}
            className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 relative transition-colors"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  Relationship: {nom.relationship}
                </span>
                <h3 className="font-bold text-slate-900 dark:text-white text-base mt-0.5">{nom.nomineeName}</h3>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{nom.sharePercentage}%</span>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">EPF Share</div>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700/60 text-xs space-y-1">
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Date of Birth:</span>
                <span className="font-medium text-slate-900 dark:text-white">{nom.dateOfBirth}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Aadhaar UID:</span>
                <span className="font-mono text-slate-900 dark:text-white">XXXX-XXXX-{nom.aadhaarLast4}</span>
              </div>
              {nom.guardianName && (
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>Guardian:</span>
                  <span className="font-medium text-slate-900 dark:text-white">{nom.guardianName}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Aadhaar OTP e-Signed
              </span>
              <span>Submitted: {new Date(nom.submittedAt).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Add Nominee */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white transition-colors">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Add Nominee (e-Nomination)</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Nominee Full Name</label>
                <input
                  type="text"
                  value={nomineeName}
                  onChange={(e) => setNomineeName(e.target.value)}
                  placeholder="e.g. Pooja Verma"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Relationship</label>
                  <select
                    value={relationship}
                    onChange={(e) => setRelationship(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="SPOUSE">Spouse</option>
                    <option value="SON">Son</option>
                    <option value="DAUGHTER">Daughter</option>
                    <option value="MOTHER">Mother</option>
                    <option value="FATHER">Father</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Share Percentage (%)</label>
                  <input
                    type="number"
                    value={sharePercentage}
                    onChange={(e) => setSharePercentage(Number(e.target.value))}
                    min={1}
                    max={100}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Aadhaar Last 4 Digits</label>
                  <input
                    type="text"
                    value={aadhaarLast4}
                    onChange={(e) => setAadhaarLast4(e.target.value)}
                    maxLength={4}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                </div>
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
                  {submitting ? 'Signing e-Nomination...' : 'e-Sign & Register'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
