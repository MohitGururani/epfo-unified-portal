import React from 'react';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Mail,
  Smartphone,
  CheckCheck,
  ShieldAlert
} from 'lucide-react';
import { AppNotification } from '../types';
import { api } from '../services/api';

interface NotificationsViewProps {
  notifications: AppNotification[];
  onRefresh: () => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({
  notifications,
  onRefresh,
}) => {
  const handleMarkAllRead = async () => {
    await api.markNotificationsRead();
    onRefresh();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Notification Center</h2>
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              Multi-Channel Dispatch
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time event alerts triggered by Reconciliation Engine & Claim Workers (In-App, SMS, and Email).
          </p>
        </div>

        <button
          onClick={handleMarkAllRead}
          className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition flex items-center gap-2 cursor-pointer"
        >
          <CheckCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Mark All as Read</span>
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.map((n) => {
          const isMismatch = n.type === 'CONTRIBUTION_MISMATCH';
          const isApproved = n.type === 'CLAIM_APPROVED';

          return (
            <div
              key={n.id}
              className={`p-5 rounded-2xl border transition shadow-sm space-y-2 ${
                !n.read
                  ? isMismatch
                    ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800/70'
                    : 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800/70'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isMismatch ? (
                    <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  )}
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">{n.title}</h3>
                  {!n.read && (
                    <span className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-400"></span>
                  )}
                </div>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                  {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} •{' '}
                  {new Date(n.createdAt).toLocaleDateString()}
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pl-6">{n.message}</p>

              {/* Delivery Channels */}
              <div className="flex flex-wrap items-center gap-4 pl-6 pt-1 text-[11px] text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  In-App Notification: <strong className="text-slate-700 dark:text-slate-300">Delivered</strong>
                </span>
                <span className="flex items-center gap-1">
                  <Smartphone className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                  SMS: <strong className="text-slate-700 dark:text-slate-300">Simulated CDAC Gateway</strong>
                </span>
                <span className="flex items-center gap-1">
                  <Mail className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                  Email: <strong className="text-slate-700 dark:text-slate-300">NIC Gov Mail</strong>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
