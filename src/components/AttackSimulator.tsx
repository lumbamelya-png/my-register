import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Clock,
  Send,
  AlertTriangle,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Smartphone,
  MapPin,
  Flame,
} from 'lucide-react';
import { ClassSession } from '../types/register';
import { createTokenSignature } from '../utils/security';
import { registerStore } from '../services/registerStore';

interface AttackSimulatorProps {
  session: ClassSession;
}

interface SimulationStep {
  timeSec: number;
  label: string;
  status: 'pending' | 'active' | 'completed' | 'failed';
  detail: string;
}

export const AttackSimulator: React.FC<AttackSimulatorProps> = ({ session }) => {
  const [delaySec, setDelaySec] = useState<number>(22); // Default 22 seconds for screenshot forwarding
  const [distanceMeters, setDistanceMeters] = useState<number>(1500); // 1.5 km away in bed
  const [isSameDevice, setIsSameDevice] = useState<boolean>(false);
  const [simState, setSimState] = useState<'idle' | 'running' | 'completed'>('idle');
  const [simSteps, setSimSteps] = useState<SimulationStep[]>([]);
  const [verdict, setVerdict] = useState<{
    blocked: boolean;
    reason: string;
    attackName: string;
  } | null>(null);

  const runAttackSimulation = (scenarioType: 'forwarded_photo' | 'legit_scan' | 'geofence_cheat' | 'buddy_punch') => {
    setSimState('running');
    setVerdict(null);

    let testDelay = delaySec;
    let testDistance = distanceMeters;
    let testSameDevice = isSameDevice;

    if (scenarioType === 'legit_scan') {
      testDelay = 1.8;
      testDistance = 14;
      testSameDevice = false;
    } else if (scenarioType === 'forwarded_photo') {
      testDelay = 24.5;
      testDistance = 25;
      testSameDevice = false;
    } else if (scenarioType === 'geofence_cheat') {
      testDelay = 2.0;
      testDistance = 2800;
      testSameDevice = false;
    } else if (scenarioType === 'buddy_punch') {
      testDelay = 2.1;
      testDistance = 12;
      testSameDevice = true;
    }

    const steps: SimulationStep[] = [
      {
        timeSec: 0.0,
        label: 'T+0.0s: Podium Screen Generation',
        status: 'active',
        detail: `Lecturer screen renders dynamic QR token #94 with timestamp T=0.`,
      },
      {
        timeSec: 1.2,
        label: 'T+1.2s: Screenshot Captured',
        status: 'pending',
        detail: 'Student in Lecture Hall takes a photo/screenshot of the projected QR code.',
      },
      {
        timeSec: testDelay > 5 ? 7.5 : 1.5,
        label: `T+${(testDelay * 0.4).toFixed(1)}s: Forwarded via WhatsApp`,
        status: 'pending',
        detail: 'Image sent via instant messenger to absent friend outside the classroom.',
      },
      {
        timeSec: testDelay,
        label: `T+${testDelay.toFixed(1)}s: Absent Friend Scans Token`,
        status: 'pending',
        detail: 'Target device opens photo from camera roll and attempts register check-in.',
      },
      {
        timeSec: testDelay + 0.3,
        label: `T+${(testDelay + 0.3).toFixed(1)}s: Cryptographic Verification`,
        status: 'pending',
        detail: 'my register validation engine inspects token age, coordinates, and device fingerprint.',
      },
    ];

    setSimSteps(steps);

    // Animate through steps
    setTimeout(() => {
      setSimSteps((prev) =>
        prev.map((s, idx) => (idx === 0 ? { ...s, status: 'completed' } : idx === 1 ? { ...s, status: 'active' } : s))
      );
    }, 400);

    setTimeout(() => {
      setSimSteps((prev) =>
        prev.map((s, idx) => (idx <= 1 ? { ...s, status: 'completed' } : idx === 2 ? { ...s, status: 'active' } : s))
      );
    }, 900);

    setTimeout(() => {
      setSimSteps((prev) =>
        prev.map((s, idx) => (idx <= 2 ? { ...s, status: 'completed' } : idx === 3 ? { ...s, status: 'active' } : s))
      );
    }, 1400);

    setTimeout(() => {
      setSimSteps((prev) =>
        prev.map((s, idx) => (idx <= 3 ? { ...s, status: 'completed' } : idx === 4 ? { ...s, status: 'active' } : s))
      );
    }, 1900);

    setTimeout(() => {
      // Final Verdict determination
      let isBlocked = false;
      let finalReason = '';
      let attackLabel = '';

      if (testDelay > session.rotationIntervalSec + 2.0) {
        isBlocked = true;
        attackLabel = 'Captured Screenshot Forward Attack';
        finalReason = `BLOCKED BY MICRO-EXPIRATION: Token was received and scanned ${testDelay}s after generation. Maximum allowed TTL is ${session.rotationIntervalSec}s. Screenshot is stale and void.`;
      } else if (session.geofenceEnabled && testDistance > session.geofenceRadiusMeters) {
        isBlocked = true;
        attackLabel = 'Dorm-Room Remote Proxy Attack';
        finalReason = `BLOCKED BY GEOFENCE: Device was measured at ${testDistance}m from lecture hall. Permitted perimeter is ${session.geofenceRadiusMeters}m.`;
      } else if (testSameDevice) {
        isBlocked = true;
        attackLabel = 'Buddy-Punching Device Conflict';
        finalReason = `BLOCKED BY DEVICE BINDING: The physical device fingerprint is already linked to another student. Multi-account signing is rejected.`;
      } else {
        isBlocked = false;
        attackLabel = 'Legitimate In-Person Scan';
        finalReason = `VERIFIED: In-person check-in validated within ${testDelay}s from inside classroom (${testDistance}m).`;
      }

      setSimSteps((prev) =>
        prev.map((s) => ({
          ...s,
          status: isBlocked && s.label.includes('Verification') ? 'failed' : 'completed',
        }))
      );

      setVerdict({
        blocked: isBlocked,
        reason: finalReason,
        attackName: attackLabel,
      });

      setSimState('completed');

      // Log to register security audit trail
      registerStore.addSecurityLog({
        sessionId: session.id,
        timestamp: Date.now(),
        event: isBlocked ? 'EXPIRED_QR_REJECTED' : 'SCAN_VERIFIED',
        studentName: isBlocked ? 'Simulated Proxy Attacker' : 'Simulated In-Class Student',
        details: `[LAB SIMULATION] ${finalReason}`,
        severity: isBlocked ? 'danger' : 'success',
        attemptedDelaySec: testDelay,
      });
    }, 2400);
  };

  return (
    <div className="py-8 max-w-5xl mx-auto px-4 sm:px-6 space-y-8">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <span>Security Laboratory</span>
          <span aria-hidden="true">·</span>
          <span>Anti-Proxy Forensics</span>
          <span aria-hidden="true">·</span>
          <span>Capture Defense Verification</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-1">
          Anti-Capture Security Lab
        </h1>
        <p className="text-sm text-slate-600 mt-1 max-w-3xl">
          Test and demonstrate why taking a picture of the QR code and texting it to absent students
          will not grant them access in <strong>my register</strong>.
        </p>
      </div>

      {/* Preset Scenario Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <button
          onClick={() => runAttackSimulation('forwarded_photo')}
          disabled={simState === 'running'}
          className="p-4 rounded-xl border border-rose-200 bg-white hover:bg-rose-50/50 text-left transition-all shadow-xs cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-950 uppercase tracking-wide">
              Test Attack 1
            </span>
            <Send className="w-4 h-4 text-rose-600" />
          </div>
          <h2 className="text-sm font-bold text-slate-900 mt-1 group-hover:text-rose-950">
            WhatsApp Forward
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Photo snapped in class and texted to friend. Scanned after 24s.
          </p>
        </button>

        <button
          onClick={() => runAttackSimulation('geofence_cheat')}
          disabled={simState === 'running'}
          className="p-4 rounded-xl border border-amber-200 bg-white hover:bg-amber-50/50 text-left transition-all shadow-xs cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-950 uppercase tracking-wide">
              Test Attack 2
            </span>
            <MapPin className="w-4 h-4 text-amber-600" />
          </div>
          <h2 className="text-sm font-bold text-slate-900 mt-1 group-hover:text-amber-950">
            Dorm Proxy Scan
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Fast scan attempt from home 2.8 km away outside geofence.
          </p>
        </button>

        <button
          onClick={() => runAttackSimulation('buddy_punch')}
          disabled={simState === 'running'}
          className="p-4 rounded-xl border border-purple-200 bg-white hover:bg-purple-50/50 text-left transition-all shadow-xs cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-950 uppercase tracking-wide">
              Test Attack 3
            </span>
            <Smartphone className="w-4 h-4 text-purple-600" />
          </div>
          <h2 className="text-sm font-bold text-slate-900 mt-1 group-hover:text-purple-950">
            Buddy-Punching
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            1 student scans twice on 1 phone to sign in a missing friend.
          </p>
        </button>

        <button
          onClick={() => runAttackSimulation('legit_scan')}
          disabled={simState === 'running'}
          className="p-4 rounded-xl border border-emerald-200 bg-white hover:bg-emerald-50/50 text-left transition-all shadow-xs cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-950 uppercase tracking-wide">
              Benchmark
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <h2 className="text-sm font-bold text-slate-900 mt-1 group-hover:text-emerald-950">
            Legitimate Scan
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Student physically in lecture hall scanning live screen in 1.8s.
          </p>
        </button>
      </div>

      {/* Interactive Parameter Control Workbench */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Flame className="w-4 h-4 text-rose-500" />
            <span>Custom Attack Parameter Workbench</span>
          </h2>
          <span className="text-xs text-slate-400 font-mono">
            Active Session TTL: {session.rotationIntervalSec}s
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Slider 1: Forwarding Delay */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-medium text-slate-700">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Elapsed Delay (Capture & Forward):</span>
              </span>
              <span className="font-mono font-bold text-slate-900 tabular-nums">
                {delaySec} seconds
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="60"
              step="1"
              value={delaySec}
              onChange={(e) => setDelaySec(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between text-[11px] text-slate-400 font-mono">
              <span>1s (Instant)</span>
              <span className="text-rose-600 font-bold">TTL threshold: {session.rotationIntervalSec}s</span>
              <span>60s</span>
            </div>
          </div>

          {/* Slider 2: Geographic Distance */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-medium text-slate-700">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>Distance from Lecture Hall:</span>
              </span>
              <span className="font-mono font-bold text-slate-900 tabular-nums">
                {distanceMeters < 1000 ? `${distanceMeters}m` : `${(distanceMeters / 1000).toFixed(1)}km`}
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="5000"
              step="25"
              value={distanceMeters}
              onChange={(e) => setDistanceMeters(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between text-[11px] text-slate-400 font-mono">
              <span>In Room (10m)</span>
              <span className="text-amber-600 font-bold">Geofence: {session.geofenceRadiusMeters}m</span>
              <span>Dorm (5km)</span>
            </div>
          </div>

          {/* Toggle 3: Same physical device */}
          <div className="space-y-2">
            <span className="block text-xs font-medium text-slate-700">
              Device Fingerprint Conflict:
            </span>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsSameDevice(false)}
                className={`flex-1 py-2 text-xs font-medium rounded-lg border transition-colors ${
                  !isSameDevice
                    ? 'bg-slate-900 text-white font-semibold'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Separate Phone
              </button>
              <button
                type="button"
                onClick={() => setIsSameDevice(true)}
                className={`flex-1 py-2 text-xs font-medium rounded-lg border transition-colors ${
                  isSameDevice
                    ? 'bg-purple-900 text-white font-semibold'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Same Phone (Proxy)
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              Simulates signing for someone else on your own phone.
            </p>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-end">
          <button
            onClick={() => runAttackSimulation('forwarded_photo')}
            disabled={simState === 'running'}
            className="px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
          >
            {simState === 'running' ? (
              <>
                <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                <span>Simulating Attack Execution...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>Run Forensic Attack Test</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Execution Timeline and Security Verdict */}
      {simSteps.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Real-Time Attack Execution Trace
          </h2>

          <div className="space-y-3">
            {simSteps.map((step, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-xl border flex items-start justify-between transition-all duration-300 ${
                  step.status === 'failed'
                    ? 'bg-rose-50 border-rose-300 text-rose-950'
                    : step.status === 'completed'
                    ? 'bg-slate-50 border-slate-200 text-slate-900'
                    : step.status === 'active'
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-950 ring-1 ring-indigo-200'
                    : 'bg-white border-slate-100 text-slate-400 opacity-60'
                }`}
              >
                <div className="space-y-1">
                  <div className="text-xs font-bold font-mono">{step.label}</div>
                  <div className="text-xs">{step.detail}</div>
                </div>

                <div className="shrink-0 ml-4 font-mono text-xs">
                  {step.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  {step.status === 'failed' && <XCircle className="w-4 h-4 text-rose-600" />}
                  {step.status === 'active' && <RotateCcw className="w-4 h-4 text-indigo-600 animate-spin" />}
                  {step.status === 'pending' && <span className="text-slate-300">···</span>}
                </div>
              </div>
            ))}
          </div>

          {verdict && (
            <div
              className={`p-5 rounded-xl border ${
                verdict.blocked
                  ? 'bg-rose-950 text-white border-rose-800'
                  : 'bg-emerald-950 text-white border-emerald-800'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="shrink-0 mt-0.5">
                  {verdict.blocked ? (
                    <ShieldCheck className="w-6 h-6 text-rose-400" />
                  ) : (
                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                  )}
                </div>
                <div>
                  <div className="text-xs font-mono uppercase tracking-wider text-slate-300">
                    Forensic Verdict · {verdict.attackName}
                  </div>
                  <div className="text-base font-bold mt-0.5">
                    {verdict.blocked ? 'ATTACK THWARTED: ACCESS DENIED' : 'BENCHMARK SUCCESSFUL'}
                  </div>
                  <p className="text-xs text-slate-200 mt-1 leading-relaxed">
                    {verdict.reason}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Deep-Dive Technical Comparison Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">
            Why Traditional QR Registers Fail vs How "my register" Prevents Access
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Understanding the architectural difference between static attendance systems and dynamic time-decay registers.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-3 px-6">Attack Vector</th>
                <th className="py-3 px-6">Traditional Static QR App</th>
                <th className="py-3 px-6 bg-indigo-50/50 text-indigo-950 font-bold">
                  my register (Anti-Capture Architecture)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr>
                <td className="py-3.5 px-6 font-semibold text-slate-900">
                  Screenshot captured & sent to absent friend
                </td>
                <td className="py-3.5 px-6 text-rose-700">
                  ❌ <strong>Vulnerable:</strong> QR is static for whole lecture. Friend scans photo from bed and is marked present.
                </td>
                <td className="py-3.5 px-6 bg-indigo-50/30 text-emerald-900 font-medium">
                  ✅ <strong>Defeated:</strong> Ephemeral token expires in 6 seconds. Photos take 15–30s to text, arriving permanently voided.
                </td>
              </tr>
              <tr>
                <td className="py-3.5 px-6 font-semibold text-slate-900">
                  Off-campus check-in attempt
                </td>
                <td className="py-3.5 px-6 text-rose-700">
                  ❌ <strong>Vulnerable:</strong> No location verification. Can be claimed anywhere in the world.
                </td>
                <td className="py-3.5 px-6 bg-indigo-50/30 text-emerald-900 font-medium">
                  ✅ <strong>Defeated:</strong> Cryptographic boundary check ensures device is physically inside the classroom.
                </td>
              </tr>
              <tr>
                <td className="py-3.5 px-6 font-semibold text-slate-900">
                  One student signing in for absent friends
                </td>
                <td className="py-3.5 px-6 text-rose-700">
                  ❌ <strong>Vulnerable:</strong> Student logs out and enters friend’s student ID repeatedly on same device.
                </td>
                <td className="py-3.5 px-6 bg-indigo-50/30 text-emerald-900 font-medium">
                  ✅ <strong>Defeated:</strong> 1-to-1 Device Fingerprint binding flags and blocks multi-student scans on single phones.
                </td>
              </tr>
              <tr>
                <td className="py-3.5 px-6 font-semibold text-slate-900">
                  Replay / Token reuse
                </td>
                <td className="py-3.5 px-6 text-rose-700">
                  ❌ <strong>Vulnerable:</strong> URL or QR can be re-accessed indefinitely.
                </td>
                <td className="py-3.5 px-6 bg-indigo-50/30 text-emerald-900 font-medium">
                  ✅ <strong>Defeated:</strong> Ephemeral nonces and sequence counters prevent replay attacks.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
