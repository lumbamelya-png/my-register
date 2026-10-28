import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldAlert,
  Maximize2,
  Minimize2,
  RefreshCw,
  Users,
  CheckCircle2,
  Clock,
  MapPin,
  Sliders,
  ExternalLink,
  Lock,
} from 'lucide-react';
import { AttendanceRecord, ClassSession, QRTokenPayload } from '../types/register';
import { generateQRToken, generateSyncCode, renderQRCodeDataUrl } from '../utils/security';
import { registerStore } from '../services/registerStore';

interface LecturerProjectorViewProps {
  session: ClassSession;
  records: AttendanceRecord[];
  totalStudents: number;
  onOpenStudentView: () => void;
  onSelectTab: (tab: 'projector' | 'student' | 'roster' | 'simulator' | 'logs') => void;
}

export const LecturerProjectorView: React.FC<LecturerProjectorViewProps> = ({
  session,
  records,
  totalStudents,
  onOpenStudentView,
  onSelectTab,
}) => {
  const [currentPayload, setCurrentPayload] = useState<QRTokenPayload | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number>(session.rotationIntervalSec);
  const [syncCode, setSyncCode] = useState<string>(generateSyncCode());
  const [seqCount, setSeqCount] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [recentlyCheckedIn, setRecentlyCheckedIn] = useState<AttendanceRecord[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);

  // Generate new token on rotation
  const rotateToken = () => {
    if (!session.active) return;
    const newSeq = seqCount + 1;
    setSeqCount(newSeq);
    const newSync = generateSyncCode();
    setSyncCode(newSync);
    const payload = generateQRToken(session, newSeq, newSync);
    setCurrentPayload(payload);
    setTimeLeft(session.rotationIntervalSec);

    renderQRCodeDataUrl(payload)
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Failed to generate QR', err));
  };

  // Initial token generation
  useEffect(() => {
    const initialSync = generateSyncCode();
    setSyncCode(initialSync);
    const initialPayload = generateQRToken(session, 1, initialSync);
    setCurrentPayload(initialPayload);
    renderQRCodeDataUrl(initialPayload)
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error(err));
  }, [session.id, session.rotationIntervalSec]);

  // High-precision rotation countdown timer
  useEffect(() => {
    if (!session.active) return;

    const intervalMs = 100;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const next = prev - 0.1;
        if (next <= 0.05) {
          rotateToken();
          return session.rotationIntervalSec;
        }
        return next;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [session.active, session.rotationIntervalSec, seqCount]);

  // Track latest check-ins
  useEffect(() => {
    setRecentlyCheckedIn(records.slice(0, 5));
  }, [records]);

  // Fullscreen handler
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen?.().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const presentCount = records.length;
  const attendancePercent = totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0;
  const progressRatio = Math.max(0, Math.min(1, timeLeft / session.rotationIntervalSec));
  const strokeDashoffset = 100 - progressRatio * 100;

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${
        isFullscreen ? 'bg-slate-950 text-white min-h-screen p-8' : 'py-8'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Session Header Strip */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <span>{session.courseCode}</span>
              <span aria-hidden="true">·</span>
              <span>{session.room}</span>
              <span aria-hidden="true">·</span>
              <span>{session.date}</span>
              <span aria-hidden="true">·</span>
              <span>{session.lecturerName}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-1">
              {session.courseTitle}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5 text-slate-500" />
              <span>Anti-Cheat Parameters</span>
            </button>

            <button
              onClick={toggleFullscreen}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
            >
              {isFullscreen ? (
                <>
                  <Minimize2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>Exit Fullscreen</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>Projector Mode</span>
                </>
              )}
            </button>

            <button
              onClick={onOpenStudentView}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open Student Scanner</span>
            </button>
          </div>
        </div>

        {/* Security Parameters Drawer */}
        {showSettings && (
          <div className="p-6 bg-slate-900 text-slate-100 rounded-xl space-y-4 shadow-lg border border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold text-sm">
                <Lock className="w-4 h-4 text-emerald-400" />
                <span>Anti-Proxy Security Configuration</span>
              </div>
              <button
                onClick={() => setShowSettings(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  QR Token Rotation Interval:
                </label>
                <div className="flex items-center gap-1.5">
                  {[4, 6, 8, 10].map((sec) => (
                    <button
                      key={sec}
                      onClick={() => registerStore.updateSessionSettings(session.id, { rotationIntervalSec: sec })}
                      className={`px-3 py-1.5 text-xs font-mono rounded-md transition-colors ${
                        session.rotationIntervalSec === sec
                          ? 'bg-emerald-500 text-slate-950 font-bold'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {sec}s
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Shorter intervals leave zero time for screenshot forwarding via chat.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Classroom Geofence Radius:
                </label>
                <div className="flex items-center gap-1.5">
                  {[50, 100, 150, 0].map((radius) => (
                    <button
                      key={radius}
                      onClick={() =>
                        registerStore.updateSessionSettings(session.id, {
                          geofenceEnabled: radius > 0,
                          geofenceRadiusMeters: radius || 100,
                        })
                      }
                      className={`px-3 py-1.5 text-xs font-mono rounded-md transition-colors ${
                        (radius === 0 && !session.geofenceEnabled) || (session.geofenceEnabled && session.geofenceRadiusMeters === radius)
                          ? 'bg-emerald-500 text-slate-950 font-bold'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {radius === 0 ? 'Off' : `${radius}m`}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Enforces students are physically inside {session.classroomCoords.name}.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Live Sync Code Challenge:
                </label>
                <button
                  onClick={() =>
                    registerStore.updateSessionSettings(session.id, {
                      requireSyncChallenge: !session.requireSyncChallenge,
                    })
                  }
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    session.requireSyncChallenge
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {session.requireSyncChallenge ? 'Active (Strict Challenge)' : 'Optional (Standard)'}
                </button>
                <p className="text-[11px] text-slate-400 mt-1">
                  Requires entering the 2-digit number pulsing on the podium screen.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Anti-Forwarding Defense Explanation Card */}
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-100 rounded-lg text-amber-800 shrink-0 mt-0.5">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-amber-950">
                Anti-Capture & Forwarding Lockdown Active
              </h2>
              <p className="text-xs text-amber-900 mt-0.5 max-w-3xl leading-relaxed">
                If a student takes a picture or screenshot of this QR code and messages it to an absent peer,
                the token will expire within <strong className="font-mono">{session.rotationIntervalSec} seconds</strong>.
                Forwarded tokens fail immediately with a captured image rejection notice.
              </p>
            </div>
          </div>
          <button
            onClick={() => onSelectTab('simulator')}
            className="px-3.5 py-1.5 text-xs font-semibold text-amber-900 bg-amber-200/80 hover:bg-amber-300/80 rounded-lg transition-colors whitespace-nowrap shrink-0 self-end sm:self-center cursor-pointer"
          >
            Test Forward Attack in Lab →
          </button>
        </div>

        {/* Main Stage Grid: QR Display (65%) & Live Telemetry Deck (35%) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Zone: Crisp High-Resolution Dynamic QR Display */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden">
            {/* Top Bar above QR */}
            <div className="w-full flex items-center justify-between pb-6 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Live Attendance Portal
                </span>
              </div>

              {/* Dynamic 2-digit Live Sync Code Badge */}
              <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                  Podium Sync:
                </span>
                <span className="text-base font-mono font-bold text-slate-900 tracking-wider">
                  #{syncCode}
                </span>
              </div>
            </div>

            {/* QR Code Container with Animated Countdown Border */}
            <div className="relative p-6 bg-slate-50 rounded-2xl border border-slate-200/80 shadow-inner flex flex-col items-center">
              {/* Radial Progress Ring around QR */}
              <div className="relative">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="Dynamic Attendance QR Code"
                    className="w-72 h-72 sm:w-80 sm:h-80 object-contain rounded-xl bg-white p-2 shadow-xs transition-opacity duration-200"
                  />
                ) : (
                  <div className="w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center text-slate-400 font-mono text-xs">
                    Generating dynamic security token...
                  </div>
                )}
              </div>

              {/* Expiration Progress Bar & Timer */}
              <div className="w-full mt-5 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span className="font-medium flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Token validity</span>
                  </span>
                  <span className="font-mono font-bold tabular-nums text-slate-900">
                    {timeLeft.toFixed(1)}s remaining
                  </span>
                </div>

                {/* Smooth Progress Bar */}
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-100 ease-linear rounded-full ${
                      timeLeft < 2.0 ? 'bg-rose-500' : timeLeft < 3.5 ? 'bg-amber-500' : 'bg-emerald-600'
                    }`}
                    style={{ width: `${(timeLeft / session.rotationIntervalSec) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Subtext instruction */}
            <div className="mt-6 space-y-1">
              <p className="text-base font-semibold text-slate-900">
                Point your smartphone camera at the screen to sign
              </p>
              <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                <span>Micro-Nonce #{seqCount}</span>
                <span aria-hidden="true">·</span>
                <span>Max scan window: {session.rotationIntervalSec}s</span>
                <span aria-hidden="true">·</span>
                <span>One student per device</span>
              </div>
            </div>
          </div>

          {/* Right Zone: Attendance Stats & Live Check-in Stream */}
          <div className="lg:col-span-5 space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500">Present</span>
                  <Users className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-bold font-mono tabular-nums text-slate-900">
                    {presentCount}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    / {totalStudents} enrolled
                  </span>
                </div>
                <div className="mt-3 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                    style={{ width: `${attendancePercent}%` }}
                  />
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500">Attendance Rate</span>
                  <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-bold font-mono tabular-nums text-slate-900">
                    {attendancePercent}%
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-500">
                  <span>{totalStudents - presentCount} pending</span>
                </div>
              </div>
            </div>

            {/* Classroom Geofence & Integrity Status */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                <span className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-500" />
                  <span>Physical Venue Verification</span>
                </span>
                <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  {session.geofenceEnabled ? `${session.geofenceRadiusMeters}m Geofence` : 'Disabled'}
                </span>
              </div>
              <p className="text-xs text-slate-600">
                {session.classroomCoords.name}
              </p>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Anti-Proxy Device Lock</span>
                <span className="font-medium text-slate-700">1 Student : 1 Device</span>
              </div>
            </div>

            {/* Live Check-in Feed */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-slate-500 animate-spin" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Live Check-In Stream
                  </h3>
                </div>
                <button
                  onClick={() => onSelectTab('roster')}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                >
                  View Full Roster ({presentCount}) →
                </button>
              </div>

              <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                {recentlyCheckedIn.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400">
                    Awaiting first student check-in...
                  </div>
                ) : (
                  recentlyCheckedIn.map((rec) => (
                    <div
                      key={rec.id}
                      className="px-5 py-3.5 flex items-center justify-between hover:bg-slate-50/80 transition-colors"
                    >
                      <div className="space-y-0.5">
                        <div className="text-sm font-semibold text-slate-900">
                          {rec.studentName}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span className="font-mono">{rec.studentNumber}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono tabular-nums">{rec.checkInTime}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="flex items-center justify-end gap-1 text-xs font-semibold text-emerald-700">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Verified</span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          freshness: {rec.tokenAgeSec}s
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
