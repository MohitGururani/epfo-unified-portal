import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Database,
  Zap,
  Layers,
  Activity,
  Server,
  RefreshCw,
  X,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Shield,
  Clock,
  Terminal
} from 'lucide-react';
import { SystemStats, AuditLog } from '../types';
import { api } from '../services/api';

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({ isOpen, onClose }) => {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'gateway' | 'rabbitmq' | 'redis' | 'database' | 'audit'>('overview');
  const [loading, setLoading] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const s = await api.getSystemStats();
      setStats(s);
      const a = await api.getAuditLogs({ limit: 25 });
      setAuditLogs(a.logs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStats();
      const interval = setInterval(fetchStats, 3000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const hitRate = stats?.redis.stats.hits
    ? Math.round((stats.redis.stats.hits / (stats.redis.stats.hits + stats.redis.stats.misses)) * 100)
    : 85;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 z-50 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-5xl w-full max-h-[90vh] flex flex-col shadow-2xl text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">EPFO 2.0 Unified Architecture Live Hub</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Target Hackathon Architecture
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Gateway • Modular Services • PostgreSQL • Redis Cache • RabbitMQ Worker • Audit Engine
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchStats}
              disabled={loading}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              title="Refresh Stats"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 border-b border-slate-800 px-4 bg-slate-950/30 overflow-x-auto text-xs">
          {[
            { id: 'overview', label: 'System Topology' },
            { id: 'gateway', label: 'API Gateway' },
            { id: 'rabbitmq', label: 'RabbitMQ Queues' },
            { id: 'redis', label: 'Redis Cache' },
            { id: 'database', label: 'PostgreSQL DB' },
            { id: 'audit', label: 'Audit Logs' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2.5 font-medium whitespace-nowrap border-b-2 transition ${
                activeTab === tab.id
                  ? 'border-emerald-400 text-emerald-300 font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-5 overflow-y-auto flex-1 text-xs space-y-5">
          {/* TAB 1: SYSTEM TOPOLOGY */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Architecture Blueprint Diagram */}
              <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 space-y-4">
                <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  Live Request & Data Flow
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-center">
                  {/* Layer 1 */}
                  <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700">
                    <div className="font-bold text-slate-200 text-sm">React Frontend</div>
                    <div className="text-[11px] text-slate-400 mt-1">Single Point Client</div>
                    <div className="mt-2 text-[10px] text-emerald-400 font-mono">Axios / JWT Header</div>
                  </div>

                  {/* Layer 2 */}
                  <div className="p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-700/50">
                    <div className="font-bold text-emerald-300 text-sm">API Gateway</div>
                    <div className="text-[11px] text-slate-400 mt-1">Auth & Rate Limiting</div>
                    <div className="mt-2 text-[10px] text-emerald-400 font-mono">/api/pf, /api/claims</div>
                  </div>

                  {/* Layer 3 */}
                  <div className="p-3.5 rounded-xl bg-blue-950/50 border border-blue-700/50">
                    <div className="font-bold text-blue-300 text-sm">Modular Services</div>
                    <div className="text-[11px] text-slate-400 mt-1">PF, Claim, Recon</div>
                    <div className="mt-2 text-[10px] text-blue-400 font-mono">Business Rules</div>
                  </div>

                  {/* Layer 4 */}
                  <div className="p-3.5 rounded-xl bg-purple-950/50 border border-purple-700/50">
                    <div className="font-bold text-purple-300 text-sm">DB / Cache / Queue</div>
                    <div className="text-[11px] text-slate-400 mt-1">Postgres + Redis + RMQ</div>
                    <div className="mt-2 text-[10px] text-purple-400 font-mono">Async Claim Workers</div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 leading-relaxed bg-slate-900/90 p-3.5 rounded-xl border border-slate-800">
                  <strong className="text-slate-200">Core Architecture Principle:</strong> Frontend communicates solely with the API Gateway. The Gateway dispatches to modular backend services. PostgreSQL holds the permanent 12-table source of truth, Redis caches read-heavy summaries with instant TTL invalidation, and RabbitMQ decouples long-running claim verification workflows.
                </div>
              </div>

              {/* Service Health Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Object.entries(stats?.gateway.servicesStatus || {}).map(([srv, status]) => (
                  <div key={srv} className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/80 flex items-center justify-between">
                    <div className="font-mono text-[11px] text-slate-300">{srv}</div>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                      {status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: API GATEWAY */}
          {activeTab === 'gateway' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-slate-800/60 p-4 rounded-xl border border-slate-700">
                <div>
                  <div className="text-slate-400 text-xs">Total Proxied Requests</div>
                  <div className="text-2xl font-bold text-emerald-400 font-mono mt-0.5">
                    {stats?.gateway.totalRequests || 0}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-slate-400 text-xs">Gateway Status</div>
                  <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-emerald-500/20 text-emerald-300">
                    Routing Active (Port 3000)
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="font-semibold text-slate-300 text-xs">Recent Gateway Request Logs</div>
                <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl overflow-hidden font-mono text-[11px] bg-slate-950">
                  {stats?.gateway.recentLogs.map((log) => (
                    <div key={log.id} className="p-2.5 flex items-center justify-between hover:bg-slate-900 transition">
                      <div className="flex items-center gap-3">
                        <span className={`px-1.5 py-0.5 rounded font-bold text-[10px] ${
                          log.method === 'POST' ? 'bg-blue-500/20 text-blue-300' : 'bg-emerald-500/20 text-emerald-300'
                        }`}>
                          {log.method}
                        </span>
                        <span className="text-slate-300">{log.path}</span>
                      </div>
                      <div className="flex items-center gap-4 text-slate-500">
                        <span className="text-emerald-400 font-bold">{log.status}</span>
                        <span>{log.responseTimeMs}ms</span>
                        <span className="text-[10px]">{new Date(log.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: RABBITMQ */}
          {activeTab === 'rabbitmq' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700">
                  <div className="text-slate-400 text-[11px]">Published Messages</div>
                  <div className="text-xl font-bold font-mono text-emerald-400 mt-1">{stats?.rabbitmq.stats.messagesPublished}</div>
                </div>
                <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700">
                  <div className="text-slate-400 text-[11px]">Acked (Settled)</div>
                  <div className="text-xl font-bold font-mono text-blue-400 mt-1">{stats?.rabbitmq.stats.messagesAcked}</div>
                </div>
                <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700">
                  <div className="text-slate-400 text-[11px]">Active Claim Workers</div>
                  <div className="text-xl font-bold font-mono text-purple-400 mt-1">{stats?.rabbitmq.stats.activeWorkersCount}</div>
                </div>
                <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700">
                  <div className="text-slate-400 text-[11px]">Dead Letter Queue</div>
                  <div className="text-xl font-bold font-mono text-amber-400 mt-1">{stats?.rabbitmq.stats.deadLetterCount}</div>
                </div>
              </div>

              {/* Queues Breakdown */}
              <div className="space-y-2">
                <div className="font-semibold text-slate-300 text-xs">Declared RabbitMQ Exchanges & Queues</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {stats?.rabbitmq.queues.map((q) => (
                    <div key={q.name} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-emerald-300 text-xs">{q.name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">Durable</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1">
                        <span>Queued: <strong className="text-slate-200">{q.readyCount}</strong></span>
                        <span>Processing: <strong className="text-blue-400">{q.processingCount}</strong></span>
                        <span>Completed: <strong className="text-emerald-400">{q.completedCount}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Jobs */}
              <div className="space-y-2">
                <div className="font-semibold text-slate-300 text-xs">Recent Queue Jobs & Payloads</div>
                <div className="space-y-1.5 font-mono text-[11px]">
                  {stats?.rabbitmq.recentJobs.map((j) => (
                    <div key={j.id} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">{j.id}</span>
                        <span className="text-slate-500">[{j.queue}]</span>
                        <span className="text-slate-300">{JSON.stringify(j.payload)}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        j.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-blue-500/20 text-blue-300 animate-pulse'
                      }`}>
                        {j.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: REDIS CACHE */}
          {activeTab === 'redis' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700">
                  <div className="text-slate-400 text-[11px]">Cache Hits</div>
                  <div className="text-xl font-bold font-mono text-emerald-400 mt-1">{stats?.redis.stats.hits}</div>
                </div>
                <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700">
                  <div className="text-slate-400 text-[11px]">Cache Misses</div>
                  <div className="text-xl font-bold font-mono text-amber-400 mt-1">{stats?.redis.stats.misses}</div>
                </div>
                <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700">
                  <div className="text-slate-400 text-[11px]">Hit Ratio</div>
                  <div className="text-xl font-bold font-mono text-purple-400 mt-1">{hitRate}%</div>
                </div>
                <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700">
                  <div className="text-slate-400 text-[11px]">Active Keys in RAM</div>
                  <div className="text-xl font-bold font-mono text-blue-400 mt-1">{stats?.redis.activeKeys.length}</div>
                </div>
              </div>

              {/* Active Redis Keys */}
              <div className="space-y-2">
                <div className="font-semibold text-slate-300 text-xs">Active Cached Keys & TTL Expiry</div>
                <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl overflow-hidden font-mono text-[11px] bg-slate-950">
                  {stats?.redis.activeKeys.map((k) => (
                    <div key={k.key} className="p-3 flex items-center justify-between hover:bg-slate-900 transition">
                      <div className="flex items-center gap-3">
                        <span className="text-emerald-400 font-bold">{k.key}</span>
                        <span className="text-slate-500 text-[10px]">({k.type}, {k.sizeBytes} B)</span>
                      </div>
                      <div className="text-slate-400 text-xs">
                        TTL: <strong className="text-amber-400">{k.ttl !== null ? `${k.ttl}s` : 'PERSIST'}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: DATABASE ENTITIES */}
          {activeTab === 'database' && (
            <div className="space-y-4">
              <div className="font-semibold text-slate-300 text-xs">
                PostgreSQL Schema Tables & Live Record Counts (12 Core Entities)
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Object.entries(stats?.postgres.tableCounts || {}).map(([table, count]) => (
                  <div key={table} className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700 space-y-1">
                    <div className="text-slate-400 text-[11px] font-mono">{table}</div>
                    <div className="text-xl font-bold font-mono text-emerald-400">{count} rows</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: AUDIT LOGS */}
          {activeTab === 'audit' && (
            <div className="space-y-3">
              <div className="font-semibold text-slate-300 text-xs">
                Immutable Security & Transaction Audit Trail
              </div>

              <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl overflow-hidden font-mono text-[11px] bg-slate-950">
                {auditLogs.map((log) => (
                  <div key={log.id} className="p-3 hover:bg-slate-900 transition space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          log.result === 'SUCCESS' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                        }`}>
                          {log.action}
                        </span>
                        <span className="text-slate-300 font-semibold">{log.entity} ({log.entityId})</span>
                        <span className="text-slate-500 text-[10px]">by {log.userRole}</span>
                      </div>
                      <span className="text-slate-500 text-[10px]">
                        {new Date(log.timestamp).toLocaleTimeString()} • {log.ipAddress}
                      </span>
                    </div>
                    <p className="text-slate-400 text-[11px] font-sans">{log.details}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
