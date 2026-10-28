import QRCode from 'qrcode';
import { ClassSession, QRTokenPayload, VerificationResult } from '../types/register';

// Simple deterministic signature helper for client-side demo and tamper resistance
export function createTokenSignature(sessionId: string, timestamp: number, seq: number, nonce: string): string {
  const raw = `${sessionId}:${timestamp}:${seq}:${nonce}:MY_REGISTER_SALT_9201`;
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

// Generate a random 2-digit sync challenge code (e.g. "48", "72")
export function generateSyncCode(): string {
  return Math.floor(10 + Math.random() * 90).toString();
}

// Generate the rotating ephemeral QR payload
export function generateQRToken(session: ClassSession, seq: number, syncCode: string): QRTokenPayload {
  const now = Date.now();
  const nonce = Math.random().toString(36).substring(2, 9);
  const sig = createTokenSignature(session.id, now, seq, nonce);

  return {
    s: session.id,
    t: now,
    seq,
    n: nonce,
    c: syncCode,
    sig,
  };
}

// Convert payload to compact JSON string for QR encoding
export function encodeQRPayload(payload: QRTokenPayload): string {
  return JSON.stringify(payload);
}

// Parse string from scanned QR code
export function parseQRPayload(raw: string): QRTokenPayload | null {
  try {
    const parsed = JSON.parse(raw);
    if (parsed && parsed.s && parsed.t && parsed.sig && parsed.c) {
      return parsed as QRTokenPayload;
    }
    return null;
  } catch {
    return null;
  }
}

// Generate high quality QR code data URL
export async function renderQRCodeDataUrl(payload: QRTokenPayload): Promise<string> {
  const jsonStr = encodeQRPayload(payload);
  return QRCode.toDataURL(jsonStr, {
    errorCorrectionLevel: 'M',
    margin: 2,
    width: 380,
    color: {
      dark: '#0f172a',
      light: '#ffffff',
    },
  });
}

// Core Anti-Capture Verification Engine
export function verifyToken(
  payload: QRTokenPayload,
  session: ClassSession,
  studentCoords: { lat: number; lng: number } | null,
  currentDeviceFingerprint: string,
  existingRecords: Array<{ studentId: string; deviceFingerprint: string; studentNumber: string }>,
  currentStudentNumber: string,
  syncCodeInput?: string
): VerificationResult {
  if (!session.active) {
    return {
      success: false,
      code: 'SESSION_INACTIVE',
      reason: 'This register session is currently closed or paused by the instructor.',
    };
  }

  if (payload.s !== session.id) {
    return {
      success: false,
      code: 'INVALID_TOKEN',
      reason: 'Invalid session token: this QR code belongs to a different class register.',
    };
  }

  // 1. TIME-DECAY CHECK (ANTI-CAPTURE / FORWARDING PROTECTION)
  const now = Date.now();
  const tokenAgeMs = now - payload.t;
  const tokenAgeSec = tokenAgeMs / 1000;

  // Maximum validity: session rotation interval + 2.5s network/scan grace period
  const maxAllowedAgeSec = session.rotationIntervalSec + 2.5;

  if (tokenAgeSec < -3) {
    return {
      success: false,
      code: 'INVALID_TOKEN',
      tokenAgeSec: 0,
      reason: 'Clock desynchronization detected. Please ensure your device clock is accurate.',
    };
  }

  if (tokenAgeSec > maxAllowedAgeSec) {
    return {
      success: false,
      code: 'EXPIRED_FORWARD',
      tokenAgeSec: Number(tokenAgeSec.toFixed(1)),
      reason: `QR code expired ${tokenAgeSec.toFixed(1)}s ago (Maximum validity: ${session.rotationIntervalSec}s). Forwarded screenshots and captured photos are permanently blocked.`,
    };
  }

  // Verify signature tamper protection
  const expectedSig = createTokenSignature(payload.s, payload.t, payload.seq, payload.n);
  if (payload.sig !== expectedSig) {
    return {
      success: false,
      code: 'INVALID_TOKEN',
      reason: 'Tampered or counterfeit QR token signature rejected by security validator.',
    };
  }

  // 2. LIVE SYNC CODE CHALLENGE (OPTIONAL STRICT MODE)
  if (session.requireSyncChallenge && syncCodeInput) {
    if (syncCodeInput.trim() !== payload.c) {
      return {
        success: false,
        code: 'INVALID_TOKEN',
        reason: `Sync code mismatch: Projected sync code was #${payload.c}, but entered #${syncCodeInput}. Must match the live projector screen.`,
      };
    }
  }

  // 3. CLASSROOM GEOFENCE CHECK
  let distanceMeters: number | null = null;
  if (session.geofenceEnabled && studentCoords) {
    distanceMeters = Math.round(
      calculateHaversineDistance(
        studentCoords.lat,
        studentCoords.lng,
        session.classroomCoords.lat,
        session.classroomCoords.lng
      )
    );

    if (distanceMeters > session.geofenceRadiusMeters) {
      return {
        success: false,
        code: 'GEOFENCE_FAIL',
        distanceMeters,
        tokenAgeSec: Number(tokenAgeSec.toFixed(1)),
        reason: `Location out of range: You are ${distanceMeters}m away from ${session.classroomCoords.name}. Allowed classroom radius is ${session.geofenceRadiusMeters}m.`,
      };
    }
  }

  // 4. DEVICE FINGERPRINT / PROXY BUDDY-PUNCHING CHECK
  // Check if this physical device has ALREADY registered for a DIFFERENT student in this session
  const priorDeviceRegistration = existingRecords.find(
    (r) => r.deviceFingerprint === currentDeviceFingerprint && r.studentNumber !== currentStudentNumber
  );

  if (priorDeviceRegistration) {
    return {
      success: false,
      code: 'DUPLICATE_DEVICE',
      tokenAgeSec: Number(tokenAgeSec.toFixed(1)),
      reason: `Device conflict: This phone/computer has already signed in for another student (ID: ${priorDeviceRegistration.studentNumber}). Proxy check-in on behalf of others is not permitted.`,
    };
  }

  return {
    success: true,
    tokenAgeSec: Number(tokenAgeSec.toFixed(1)),
    distanceMeters,
  };
}

// Haversine formula to compute distance in meters between two lat/lng coordinates
export function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth's radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Stable browser/device fingerprint generator for proxy detection
export function getOrCreateDeviceFingerprint(): string {
  const storageKey = 'my_register_device_id';
  let deviceId = localStorage.getItem(storageKey);
  if (!deviceId) {
    const randomEntropy = Math.random().toString(36).substring(2, 10);
    const screenEntropy = `${window.screen.width}x${window.screen.height}`;
    deviceId = `dev_${randomEntropy}_${screenEntropy}_${Date.now().toString(36)}`;
    localStorage.setItem(storageKey, deviceId);
  }
  return deviceId;
}
