import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LecturerProjectorView } from './components/LecturerProjectorView';
import { StudentScannerView } from './components/StudentScannerView';
import { AttendanceRoster } from './components/AttendanceRoster';
import { AttackSimulator } from './components/AttackSimulator';
import { SecurityAuditLogs } from './components/SecurityAuditLogs';
import { registerStore } from './services/registerStore';
import { ClassSession } from './types/register';
import {
  ShieldCheck,
  Smartphone,
  Monitor,
  BookOpen,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'projector' | 'student' | 'roster' | 'simulator' | 'logs'>('projector');
  const [, setTick] = useState<number>(0);

  // Subscribe to real-time store changes (including BroadcastChannel from other tabs/windows)
  useEffect(() => {
    const unsubscribe = registerStore.subscribe(() => {
      setTick((t) => t + 1);
    });
    return unsubscribe;
  }, []);

  const session = registerStore.getCurrentSession();
  const sessions = registerStore.getSessions();
  const students = registerStore.getStudents();
  const records = registerStore.getRecordsForSession(session.id);
  const logs = registerStore.getLogsForSession(session.id);

  const handleToggleSessionActive = () => {
    registerStore.updateSessionSettings(session.id, { active: !session.active });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* 3-Zone Top Bar Contract */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        session={session}
        onToggleActive={handleToggleSessionActive}
      />

      {/* Course Context Ribbon */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-500 uppercase tracking-wider text-[11px]">
              Active Class:
            </span>
            <select
              value={session.id}
              onChange={(e) => registerStore.setCurrentSession(e.target.value)}
              className="font-medium bg-slate-100 border border-slate-200 rounded-md px-2.5 py-1 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-400 cursor-pointer"
            >
              {sessions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.courseCode}: {s.courseTitle} ({s.room})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-4 text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-slate-700 font-mono tabular-nums">
                {records.length}
              </span>
              <span>of {students.length} signed</span>
            </div>
            <span aria-hidden="true">·</span>
            <div className="flex items-center gap-1 text-emerald-700 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Anti-Capture Protection Enforced</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main View Area */}
      <main className="flex-1">
        {currentTab === 'projector' && (
          <LecturerProjectorView
            session={session}
            records={records}
            totalStudents={students.length}
            onOpenStudentView={() => setCurrentTab('student')}
            onSelectTab={setCurrentTab}
          />
        )}

        {currentTab === 'student' && (
          <StudentScannerView
            session={session}
            onSelectTab={setCurrentTab}
          />
        )}

        {currentTab === 'roster' && (
          <AttendanceRoster
            session={session}
            students={students}
            records={records}
          />
        )}

        {currentTab === 'simulator' && (
          <AttackSimulator session={session} />
        )}

        {currentTab === 'logs' && (
          <SecurityAuditLogs
            session={session}
            logs={logs}
          />
        )}
      </main>

      {/* Quiet Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">my register</span>
            <span aria-hidden="true">·</span>
            <span>Cryptographic Anti-Capture Attendance Verification</span>
          </div>

          <div className="flex items-center gap-4 text-slate-500">
            <button
              onClick={() => setCurrentTab('simulator')}
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              Anti-Capture Lab
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setCurrentTab('roster')}
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              Attendance Roster
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setCurrentTab('projector')}
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              Projector Mode
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
