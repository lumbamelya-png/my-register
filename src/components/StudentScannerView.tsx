import React, { useState, useEffect, useRef } from 'react';
import jsQR from 'jsqr';
import confetti from 'canvas-confetti';
import {
  Camera,
  CheckCircle2,
  AlertOctagon,
  MapPin,
  Smartphone,
  RotateCcw,
  UserCheck,
  ShieldCheck,
  ChevronRight,
  Info,
} from 'lucide-react';
import { AttendanceRecord, ClassSession, QRTokenPayload, Student, VerificationResult } from '../types/register';
import { getOrCreateDeviceFingerprint, parseQRPayload, verifyToken } from '../utils/security';
import { registerStore, INITIAL_STUDENTS } from '../services/registerStore';

interface StudentScannerViewProps {
  session: ClassSession;
  onSelectTab: (tab: 'projector' | 'student' | 'roster' | 'simulator' | 'logs') => void;
}

export const StudentScannerView: React.FC<StudentScannerViewProps> = ({ session, onSelectTab }) => {
  const [selectedStudent, setSelectedStudent] = useState<Student>(INITIAL_STUDENTS[3]); // Mateo Rossi by default
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [syncInput, setSyncInput] = useState<string>('');
  const [simulatedDistance, setSimulatedDistance] = useState<number>(15); // 15 meters by default (in class)
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);

  // Verification outcome state
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [verifiedRecord, setVerifiedRecord] = useState<AttendanceRecord | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Check if current student already signed in for this session
  useEffect(() => {
    const existing = registerStore
      .getRecordsForSession(session.id)
      .find((r) => r.studentNumber === selectedStudent.studentNumber);
    if (existing) {
      setVerifiedRecord(existing);
      setVerificationResult({
        success: true,
        tokenAgeSec: existing.tokenAgeSec,
        distanceMeters: existing.distanceMeters,
      });
    } else {
      setVerifiedRecord(null);
      setVerificationResult(null);
    }
  }, [selectedStudent, session.id]);

  // Start WebRTC Camera
  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setIsCameraActive(true);
        scanFrameLoop();
      }
    } catch (err: unknown) {
      console.warn('Camera error or permission denied:', err);
      setCameraError(
        'Unable to access physical camera. You can use the Quick Test Simulator or upload a photo below to test verification.'
      );
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Frame processing loop using jsqr
  const scanFrameLoop = () => {
    if (!videoRef.current || !canvasRef.current || videoRef.current.readyState !== videoRef.current.HAVE_ENOUGH_DATA) {
      animationFrameId.current = requestAnimationFrame(scanFrameLoop);
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'dontInvert',
    });

    if (code && code.data) {
      handleScannedData(code.data);
      return; // Stop loop once detected
    }

    animationFrameId.current = requestAnimationFrame(scanFrameLoop);
  };

  // Evaluate scanned QR data
  const handleScannedData = (rawText: string) => {
    setIsEvaluating(true);
    stopCamera();

    const payload = parseQRPayload(rawText);
    if (!payload) {
      setVerificationResult({
        success: false,
        code: 'INVALID_TOKEN',
        reason: 'Unrecognized barcode format. Please point your camera directly at the "my register" podium screen.',
      });
      setIsEvaluating(false);
      return;
    }

    processPayload(payload, 'live_camera');
  };

  const processPayload = (
    payload: QRTokenPayload,
    method: 'live_camera' | 'direct_token' = 'live_camera'
  ) => {
    const deviceFp = getOrCreateDeviceFingerprint();
    const existingRecords = registerStore.getRecordsForSession(session.id);

    // Simulated or real coordinates
    const studentCoords = {
      lat: session.classroomCoords.lat + (simulatedDistance / 111320),
      lng: session.classroomCoords.lng,
    };

    const outcome = verifyToken(
      payload,
      session,
      studentCoords,
      deviceFp,
      existingRecords,
      selectedStudent.studentNumber,
      syncInput
    );

    setVerificationResult(outcome);
    setIsEvaluating(false);

    if (outcome.success) {
      // Trigger confetti celebration
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#059669', '#10b981', '#34d399', '#6366f1'],
        });
      } catch {}

      const checkInRecord = registerStore.addAttendanceRecord({
        sessionId: session.id,
        studentId: selectedStudent.id,
        studentName: selectedStudent.name,
        studentNumber: selectedStudent.studentNumber,
        checkInTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        checkInTimestamp: Date.now(),
        tokenAgeSec: outcome.tokenAgeSec || 1.2,
        distanceMeters: outcome.distanceMeters ?? simulatedDistance,
        deviceFingerprint: deviceFp,
        status: 'verified',
        verificationMethod: method,
      });

      setVerifiedRecord(checkInRecord);

      registerStore.addSecurityLog({
        sessionId: session.id,
        timestamp: Date.now(),
        event: 'SCAN_VERIFIED',
        studentName: selectedStudent.name,
        studentNumber: selectedStudent.studentNumber,
        details: `Clean in-person check-in · Token freshness: ${outcome.tokenAgeSec}s · Distance: ${outcome.distanceMeters ?? simulatedDistance}m`,
        severity: 'success',
      });
    } else {
      // Log security event for audit
      const eventType =
        outcome.code === 'EXPIRED_FORWARD'
          ? 'EXPIRED_QR_REJECTED'
          : outcome.code === 'GEOFENCE_FAIL'
          ? 'GEOFENCE_VIOLATION'
          : outcome.code === 'DUPLICATE_DEVICE'
          ? 'DUPLICATE_DEVICE_BLOCKED'
          : 'EXPIRED_QR_REJECTED';

      registerStore.addSecurityLog({
        sessionId: session.id,
        timestamp: Date.now(),
        event: eventType,
        studentName: selectedStudent.name,
        studentNumber: selectedStudent.studentNumber,
        details: outcome.reason || 'Verification failed',
        severity: 'danger',
        attemptedDelaySec: outcome.tokenAgeSec,
      });
    }
  };

  // Handler for testing an instantaneous fresh scan directly
  const handleSimulateLiveScan = () => {
    setIsEvaluating(true);
    setTimeout(() => {
      // Fetch fresh token from store / current session
      const now = Date.now();
      const freshPayload: QRTokenPayload = {
        s: session.id,
        t: now - 1400, // 1.4 seconds ago (fresh scan)
        seq: 42,
        n: Math.random().toString(36).substring(2, 8),
        c: '74',
        sig: '',
      };
      // We will compute proper signature or process
      import('../utils/security').then(({ createTokenSignature }) => {
        freshPayload.sig = createTokenSignature(
          freshPayload.s,
          freshPayload.t,
          freshPayload.seq,
          freshPayload.n
        );
        processPayload(freshPayload, 'direct_token');
      });
    }, 400);
  };

  // Handler for simulating the exact cheat attempt (someone sent a screenshot taken 20s ago)
  const handleSimulateForwardedScreenshot = () => {
    setIsEvaluating(true);
    setTimeout(() => {
      const now = Date.now();
      const capturedPayload: QRTokenPayload = {
        s: session.id,
        t: now - 22000, // 22 seconds ago! Forwarded via WhatsApp
        seq: 38,
        n: 'nonce_forwarded',
        c: '12',
        sig: '',
      };
      import('../utils/security').then(({ createTokenSignature }) => {
        capturedPayload.sig = createTokenSignature(
          capturedPayload.s,
          capturedPayload.t,
          capturedPayload.seq,
          capturedPayload.n
        );
        processPayload(capturedPayload, 'direct_token');
      });
    }, 400);
  };

  return (
    <div className="py-8 max-w-4xl mx-auto px-4 sm:px-6">
      <div className="space-y-6">
        {/* Page Title & Context */}
        <div className="pb-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <span>Student Attendance Portal</span>
              <span aria-hidden="true">·</span>
              <span>{session.courseCode}</span>
              <span aria-hidden="true">·</span>
              <span>{session.room}</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
              Sign Register
            </h1>
          </div>

          <button
            onClick={() => onSelectTab('projector')}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer self-start sm:self-auto"
          >
            <span>Switch to Projector Screen</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Student Selector Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-indigo-600" />
              <span>Select Your Student Identity</span>
            </label>
            <span className="text-[11px] text-slate-400 font-mono">
              Device bound
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Student Name & ID:</label>
              <select
                value={selectedStudent.studentNumber}
                onChange={(e) => {
                  const s = INITIAL_STUDENTS.find((st) => st.studentNumber === e.target.value);
                  if (s) setSelectedStudent(s);
                }}
                className="w-full text-xs font-medium border border-slate-200 rounded-lg p-2.5 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {INITIAL_STUDENTS.map((st) => (
                  <option key={st.studentNumber} value={st.studentNumber}>
                    {st.name} ({st.studentNumber}) · {st.department}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-500 mb-1">
                Classroom Location Status:
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSimulatedDistance(12)}
                  className={`flex-1 py-2 text-xs font-medium rounded-lg border transition-colors ${
                    simulatedDistance <= 25
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-semibold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Inside Room (~12m)
                </button>
                <button
                  type="button"
                  onClick={() => setSimulatedDistance(1850)}
                  className={`flex-1 py-2 text-xs font-medium rounded-lg border transition-colors ${
                    simulatedDistance > 100
                      ? 'bg-rose-50 border-rose-300 text-rose-800 font-semibold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Remote / Home (1.8km)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Verification Result Card (if evaluated) */}
        {verificationResult && (
          <div
            className={`rounded-2xl border p-6 transition-all duration-300 ${
              verificationResult.success
                ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950 shadow-sm'
                : 'bg-rose-50/90 border-rose-300 text-rose-950 shadow-sm'
            }`}
          >
            {verificationResult.success ? (
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-emerald-950">
                      Attendance Successfully Registered
                    </h2>
                    <p className="text-xs text-emerald-800 mt-1">
                      Your presence for <strong>{session.courseCode}</strong> has been cryptographically confirmed.
                    </p>
                  </div>
                </div>

                {/* Digital Verified Pass Receipt */}
                <div className="bg-white/90 backdrop-blur-xs rounded-xl p-4 border border-emerald-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Student</span>
                    <span className="font-semibold text-slate-900">{selectedStudent.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Student ID</span>
                    <span className="font-mono font-semibold text-slate-900">{selectedStudent.studentNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Time Logged</span>
                    <span className="font-mono font-semibold text-slate-900">
                      {verifiedRecord?.checkInTime || 'Just now'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Freshness Proof</span>
                    <span className="font-mono font-semibold text-emerald-700">
                      {verificationResult.tokenAgeSec}s (Pass)
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <AlertOctagon className="w-7 h-7" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-rose-950">
                      Attendance Denied: Anti-Proxy Triggered
                    </h2>
                    <p className="text-sm text-rose-900 font-medium mt-1">
                      {verificationResult.reason}
                    </p>
                  </div>
                </div>

                {/* Security Detail Box */}
                <div className="bg-white/90 backdrop-blur-xs rounded-xl p-4 border border-rose-200 space-y-2 text-xs">
                  <div className="font-semibold text-rose-900 flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-rose-600" />
                    <span>Why did this check-in fail?</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed">
                    {verificationResult.code === 'EXPIRED_FORWARD' && (
                      <>
                        <strong>Ephemeral Token Expiration:</strong> The QR code updates every {session.rotationIntervalSec} seconds.
                        Forwarding a photo or screenshot takes at least 15–30 seconds to send via messaging apps, by which time the token is permanently voided.
                      </>
                    )}
                    {verificationResult.code === 'GEOFENCE_FAIL' && (
                      <>
                        <strong>Classroom Geofence Violation:</strong> You must be physically inside {session.classroomCoords.name} to sign the register.
                      </>
                    )}
                    {verificationResult.code === 'DUPLICATE_DEVICE' && (
                      <>
                        <strong>Device Proxy Restriction:</strong> This phone or browser has already checked in for another student. One student per device.
                      </>
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setVerificationResult(null);
                      startCamera();
                    }}
                    className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Scan Live Screen Again</span>
                  </button>

                  <button
                    onClick={() => onSelectTab('simulator')}
                    className="px-4 py-2 text-xs font-semibold text-rose-900 bg-rose-100 hover:bg-rose-200 rounded-lg transition-colors cursor-pointer"
                  >
                    View Attack Analysis
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Live Camera Scanner Box */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-slate-700" />
              <h2 className="text-sm font-bold text-slate-900">
                Live QR Scanner Viewfinder
              </h2>
            </div>
            {isCameraActive && (
              <span className="text-xs font-mono text-emerald-600 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                Scanning live...
              </span>
            )}
          </div>

          {/* Viewfinder Target */}
          <div className="relative w-full max-w-md mx-auto aspect-square bg-slate-900 rounded-2xl overflow-hidden flex items-center justify-center border border-slate-800">
            {isCameraActive ? (
              <>
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                />
                <canvas ref={canvasRef} className="hidden" />

                {/* Target reticle */}
                <div className="absolute inset-10 border-2 border-white/60 rounded-xl pointer-events-none flex flex-col justify-between p-2">
                  <div className="flex justify-between">
                    <div className="w-4 h-4 border-t-2 border-l-2 border-emerald-400" />
                    <div className="w-4 h-4 border-t-2 border-r-2 border-emerald-400" />
                  </div>
                  {/* Laser scan line */}
                  <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-scan-sweep relative" />
                  <div className="flex justify-between">
                    <div className="w-4 h-4 border-b-2 border-l-2 border-emerald-400" />
                    <div className="w-4 h-4 border-b-2 border-r-2 border-emerald-400" />
                  </div>
                </div>
              </>
            ) : (
              <div className="p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-800 text-slate-300 mx-auto flex items-center justify-center">
                  <Camera className="w-8 h-8 text-slate-400" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-white">
                    Camera is currently inactive
                  </p>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    Activate camera to point at the rotating QR code on the lecture hall screen.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={startCamera}
                  className="px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors inline-flex items-center gap-2 shadow-sm cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  <span>Start Camera Scanner</span>
                </button>
              </div>
            )}
          </div>

          {cameraError && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>{cameraError}</span>
            </div>
          )}

          {/* Quick Simulation Testing Deck (allows testing live vs forwarded photo in 1-click) */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 uppercase tracking-wider">
                Instant Simulation Testing
              </span>
              <span className="text-slate-400">
                (Test live vs captured screenshot)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleSimulateLiveScan}
                disabled={isEvaluating}
                className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100/70 text-left transition-colors cursor-pointer group"
              >
                <div className="flex items-center justify-between text-xs font-bold text-emerald-950">
                  <span>Simulate: Fresh In-Class Scan</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <p className="text-[11px] text-emerald-800 mt-1">
                  Simulates student sitting in class scanning live screen in 1.4 seconds.
                </p>
              </button>

              <button
                type="button"
                onClick={handleSimulateForwardedScreenshot}
                disabled={isEvaluating}
                className="p-3 rounded-xl border border-rose-200 bg-rose-50/60 hover:bg-rose-100/70 text-left transition-colors cursor-pointer group"
              >
                <div className="flex items-center justify-between text-xs font-bold text-rose-950">
                  <span>Simulate: Forwarded Screenshot</span>
                  <AlertOctagon className="w-4 h-4 text-rose-600" />
                </div>
                <p className="text-[11px] text-rose-800 mt-1">
                  Simulates receiving photo via WhatsApp after 22s delay. Will be rejected!
                </p>
              </button>
            </div>
          </div>
        </div>

        {/* Security Feature Explanation */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span>How "my register" Prevents Screenshot Sharing</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-600">
            <div>
              <span className="font-semibold text-slate-800 block mb-1">1. Ephemeral Hash</span>
              Each QR token decays in {session.rotationIntervalSec}s. Messaging a picture takes too long.
            </div>
            <div>
              <span className="font-semibold text-slate-800 block mb-1">2. Hardware Identity</span>
              A student cannot scan twice for a friend using the same phone.
            </div>
            <div>
              <span className="font-semibold text-slate-800 block mb-1">3. Venue Boundary</span>
              Students outside {session.geofenceRadiusMeters}m of the room are flagged as absent.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
