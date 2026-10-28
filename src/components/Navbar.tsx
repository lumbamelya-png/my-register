import React from 'react';
import { ShieldCheck, Play, Pause } from 'lucide-react';
import { ClassSession } from '../types/register';

interface NavbarProps {
  currentTab: 'projector' | 'student' | 'roster' | 'simulator' | 'logs';
  onSelectTab: (tab: 'projector' | 'student' | 'roster' | 'simulator' | 'logs') => void;
  session: ClassSession;
  onToggleActive: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  session,
  onToggleActive,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href="#projector"
            onClick={(e) => {
              e.preventDefault();
              onSelectTab('projector');
            }}
            className="flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900 whitespace-nowrap group"
          >
            <span className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-mono font-bold text-sm group-hover:bg-indigo-600 transition-colors">
              mr
            </span>
            <span>my register</span>
          </a>
        </div>

        {/* Zone 2: Clean single-line navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button
            onClick={() => onSelectTab('projector')}
            className={`whitespace-nowrap pb-0.5 border-b-2 transition-colors cursor-pointer ${
              currentTab === 'projector'
                ? 'border-slate-900 text-slate-900 font-semibold'
                : 'border-transparent hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            Projector Screen
          </button>

          <button
            onClick={() => onSelectTab('student')}
            className={`whitespace-nowrap pb-0.5 border-b-2 transition-colors cursor-pointer ${
              currentTab === 'student'
                ? 'border-slate-900 text-slate-900 font-semibold'
                : 'border-transparent hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            Student Check-In
          </button>

          <button
            onClick={() => onSelectTab('roster')}
            className={`whitespace-nowrap pb-0.5 border-b-2 transition-colors cursor-pointer ${
              currentTab === 'roster'
                ? 'border-slate-900 text-slate-900 font-semibold'
                : 'border-transparent hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            Attendance Roster
          </button>

          <button
            onClick={() => onSelectTab('simulator')}
            className={`whitespace-nowrap pb-0.5 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              currentTab === 'simulator'
                ? 'border-slate-900 text-slate-900 font-semibold'
                : 'border-transparent hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Anti-Capture Lab</span>
          </button>

          <button
            onClick={() => onSelectTab('logs')}
            className={`whitespace-nowrap pb-0.5 border-b-2 transition-colors cursor-pointer ${
              currentTab === 'logs'
                ? 'border-slate-900 text-slate-900 font-semibold'
                : 'border-transparent hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            Security Audit
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onToggleActive}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 transition-all whitespace-nowrap shrink-0 shadow-sm ${
              session.active
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-slate-700 hover:bg-slate-800 text-white'
            }`}
            title={session.active ? 'Click to pause register' : 'Click to resume register'}
          >
            {session.active ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Register Open</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>Register Paused</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Mobile nav strip */}
      <div className="md:hidden flex items-center justify-around px-2 py-2 border-t border-slate-100 bg-slate-50 text-xs font-medium text-slate-600 overflow-x-auto">
        <button
          onClick={() => onSelectTab('projector')}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${currentTab === 'projector' ? 'bg-white text-slate-900 font-bold shadow-xs' : ''}`}
        >
          Projector
        </button>
        <button
          onClick={() => onSelectTab('student')}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${currentTab === 'student' ? 'bg-white text-slate-900 font-bold shadow-xs' : ''}`}
        >
          Scan QR
        </button>
        <button
          onClick={() => onSelectTab('roster')}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${currentTab === 'roster' ? 'bg-white text-slate-900 font-bold shadow-xs' : ''}`}
        >
          Roster
        </button>
        <button
          onClick={() => onSelectTab('simulator')}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${currentTab === 'simulator' ? 'bg-white text-slate-900 font-bold shadow-xs' : ''}`}
        >
          Lab
        </button>
        <button
          onClick={() => onSelectTab('logs')}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${currentTab === 'logs' ? 'bg-white text-slate-900 font-bold shadow-xs' : ''}`}
        >
          Audit
        </button>
      </div>
    </header>
  );
};
