import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  CreditCard,
  FileCheck,
  Plus,
  RefreshCw,
  X
} from 'lucide-react';
import { KYCRecord } from '../types';
import { api } from '../services/api';

interface KycViewProps {
  kycRecords: KYCRecord[];
  onRefresh: () => void;
}

export const KycView: React.FC<KycViewProps> = ({ kycRecords, onRefresh }) => {
  const [showModal, setShowModal] = useState(false);
  const [docType, setDocType] = useState<KYCRecord['documentType']>('PAN');
  const [docNumber, setDocNumber] = useState('');
  const [nameOnDoc, setNameOnDoc] = useState('Ramesh Kumar Verma');
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.updateKYC(docType, docNumber, nameOnDoc);
      setShowModal(false);
      setDocNumber('');
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const docNames: Record<KYCRecord['documentType'], string> = {
    AADHAAR: 'Aadhaar Card (UIDAI CIDR)',
    PAN: 'Income Tax PAN Card (NSDL/ITD)',
    BANK_ACCOUNT: 'Bank Account & IFSC (NPCI Penny Drop)',
    PASSPORT: 'Indian Passport (MEA)',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Member KYC Management</h2>
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              UIDAI & NPCI Linked
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Seed and verify KYC credentials for seamless online claim auto-settlement.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 text-white text-xs font-semibold transition flex items-center gap-2 shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4 text-emerald-400 dark:text-white" />
          <span>Update / Seed KYC</span>
        </button>
      </div>

      {/* KYC Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {kycRecords.map((item) => (
          <div
            key={item.id}
            className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 relative overflow-hidden transition-colors"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 tracking-wide uppercase">
                  {item.documentType}
                </span>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">{docNames[item.documentType]}</h3>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 ${
                  item.verified
                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                }`}
              >
                {item.verified ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                <span>{item.status}</span>
              </span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700/60 text-xs space-y-1 font-mono">
              <div className="text-slate-500 dark:text-slate-400 text-[10px]">Document Reference</div>
              <div className="font-bold text-slate-900 dark:text-white text-sm">{item.documentNumber}</div>
              <div className="text-slate-600 dark:text-slate-300 text-[11px] pt-1">Name: {item.nameOnDoc}</div>
            </div>

            <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between pt-1">
              <span>
                {item.verifiedAt ? `Verified on ${new Date(item.verifiedAt).toLocaleDateString()}` : 'Verification Pending'}
              </span>
              <span className="text-emerald-700 dark:text-emerald-400 font-semibold">Government CIDR Validated</span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Seed KYC */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white transition-colors">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Seed & Verify KYC Document</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Document Type</label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="PAN">PAN Card</option>
                  <option value="BANK_ACCOUNT">Bank Account & IFSC</option>
                  <option value="AADHAAR">Aadhaar (UIDAI)</option>
                  <option value="PASSPORT">Passport</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Document Number / Account Details</label>
                <input
                  type="text"
                  value={docNumber}
                  onChange={(e) => setDocNumber(e.target.value)}
                  placeholder="e.g. ABCDE1234F or 002910100049281"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Name as on Document</label>
                <input
                  type="text"
                  value={nameOnDoc}
                  onChange={(e) => setNameOnDoc(e.target.value)}
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
                  disabled={loading}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer transition"
                >
                  {loading ? 'Validating with Gateway...' : 'Verify & Link Document'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
