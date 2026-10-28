export interface ClassSession {
  id: string;
  courseCode: string;
  courseTitle: string;
  lecturerName: string;
  room: string;
  date: string;
  rotationIntervalSec: number;
  geofenceEnabled: boolean;
  geofenceRadiusMeters: number;
  classroomCoords: {
    lat: number;
    lng: number;
    name: string;
  };
  requireSyncChallenge: boolean;
  active: boolean;
  startedAt: number;
}

export interface Student {
  id: string;
  name: string;
  studentNumber: string;
  email: string;
  department: string;
}

export interface AttendanceRecord {
  id: string;
  sessionId: string;
  studentId: string;
  studentName: string;
  studentNumber: string;
  checkInTime: string;
  checkInTimestamp: number;
  tokenAgeSec: number;
  distanceMeters: number | null;
  deviceFingerprint: string;
  status: 'verified' | 'flagged' | 'manual';
  flagReason?: string;
  verificationMethod: 'live_camera' | 'direct_token' | 'manual_override';
}

export type SecurityEventType =
  | 'TOKEN_ROTATED'
  | 'SCAN_VERIFIED'
  | 'EXPIRED_QR_REJECTED'
  | 'GEOFENCE_VIOLATION'
  | 'DUPLICATE_DEVICE_BLOCKED'
  | 'MANUAL_OVERRIDE';

export interface SecurityAuditLog {
  id: string;
  sessionId: string;
  timestamp: number;
  event: SecurityEventType;
  studentName?: string;
  studentNumber?: string;
  details: string;
  severity: 'success' | 'info' | 'warning' | 'danger';
  attemptedDelaySec?: number;
}

export interface QRTokenPayload {
  s: string;        // sessionId
  t: number;        // timestamp ms
  seq: number;      // sequence index
  n: string;        // nonce
  c: string;        // 2-digit sync challenge
  sig: string;      // signature
}

export interface VerificationResult {
  success: boolean;
  reason?: string;
  code?: 'EXPIRED_FORWARD' | 'GEOFENCE_FAIL' | 'DUPLICATE_DEVICE' | 'INVALID_TOKEN' | 'SESSION_INACTIVE';
  tokenAgeSec?: number;
  distanceMeters?: number | null;
}
