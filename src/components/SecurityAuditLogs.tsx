import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Info,
  Clock,
  Filter,
  Trash2,
} from 'lucide-react';
import { ClassSession, SecurityAuditLog } from '../types/register';
import { registerStore } from '../services/registerStore';

interface SecurityAuditLogsProps {
  session: ClassSession;
  logs: SecurityAuditLog[];
}

export const SecurityAuditLogs: React.FC<SecurityAuditLogsProps> = ({ session, logs }) => {
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'danger' | 'warning' | 'success'>('all');

  const filteredLogs = logs.filter((log) => {
    if (filterSeverity === 'all') return true;
    return log.severity === filterSeverity;
  });

  const attackBlockedCount = logs.filter((l) => l.severity === 'danger' || l.severity === 'warning').length;
  const verifiedCount = logs.filter((l) => l.severity === 'success').length;

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span>{session.courseCode}</span>
            <span aria-hidden="true">·</span>
            <span>Security Forensics</span>
            <span aria-hidden="true">·</span>
            <span>Tamper & Proxy Prevention Ledger</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-1">
            Real-Time Security Audit Logs
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs text-slate-500 font-mono">
            {attackBlockedCount} proxy attempts intercepted
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Total Security Events</span>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
            {logs.length}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-rose-200 bg-rose-50/30 shadow-xs">
          <span className="text-xs text-rose-800 font-medium">Attacks Intercepted & Blocked</span>
          <div className="text-2xl font-bold font-mono text-rose-700 mt-1">
            {attackBlockedCount}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/30 shadow-xs">
          <span className="text-xs text-emerald-800 font-medium">Legitimate Signatures Verified</span>
          <div className="text-2xl font-bold font-mono text-emerald-700 mt-1">
            {verifiedCount}
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg w-fit">
        <button
          onClick={() => setFilterSeverity('all')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
            filterSeverity === 'all'
              ? 'bg-white text-slate-900 shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          All Events ({logs.length})
        </button>
        <button
          onClick={() => setFilterSeverity('danger')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
            filterSeverity === 'danger'
              ? 'bg-white text-rose-950 shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Captured / Expired QR Blocks ({logs.filter((l) => l.severity === 'danger').length})
        </button>
        <button
          onClick={() => setFilterSeverity('warning')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
            filterSeverity === 'warning'
              ? 'bg-white text-amber-950 shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Geofence Warnings ({logs.filter((l) => l.severity === 'warning').length})
        </button>
        <button
          onClick={() => setFilterSeverity('success')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
            filterSeverity === 'success'
              ? 'bg-white text-emerald-950 shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Verified Presences ({verifiedCount})
        </button>
      </div>

      {/* Audit Log Stream */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs divide-y divide-slate-100">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No security events found under this filter.
          </div>
        ) : (
          filteredLogs.map((log) => {
            const dateStr = new Date(log.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            });

            return (
              <div
                key={log.id}
                className="p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-3 hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="shrink-0 mt-0.5">
                    {log.severity === 'danger' && (
                      <ShieldAlert className="w-5 h-5 text-rose-600" />
                    )}
                    {log.severity === 'warning' && (
                      <AlertTriangle className="w-5 h-5 text-amber-600" />
                    )}
                    {log.severity === 'success' && (
                      <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    )}
                    {log.severity === 'info' && (
                      <Info className="w-5 h-5 text-slate-500" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold font-mono text-slate-900">
                        {log.event}
                      </span>
                      {log.studentName && (
                        <>
                          <span className="text-slate-300">·</span>
                          <span className="text-xs font-medium text-slate-700">
                            {log.studentName} {log.studentNumber && `(${log.studentNumber})`}
                          </span>
                        </>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                      {log.details}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 font-mono text-[11px] text-slate-400 self-end sm:self-start">
                  {dateStr}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
